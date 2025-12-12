import os
import re
import uuid
import numpy as np
from PIL import Image
import pytesseract
import cv2
from skimage.feature import hog


def _ensure_grayscale_cv(img_path):
    img = cv2.imdecode(np.fromfile(img_path, dtype=np.uint8), cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError('Unable to read image for OCR/hog')
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    return img, gray


def preprocess_for_ocr(gray_image):
    # Adaptive thresholding and denoising to improve OCR
    denoised = cv2.bilateralFilter(gray_image, d=9, sigmaColor=75, sigmaSpace=75)
    th = cv2.adaptiveThreshold(denoised, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                               cv2.THRESH_BINARY, 11, 2)
    return th


def extract_text_from_image(image_path):
    """Run pytesseract OCR on the provided image file path and return raw text."""
    # Using PIL for pytesseract compatibility
    try:
        with Image.open(image_path) as pil_img:
            pil_gray = pil_img.convert('L')
            # Optionally increase contrast or resize
            w, h = pil_gray.size
            if max(w, h) < 1200:
                pil_gray = pil_gray.resize((int(w * 1.5), int(h * 1.5)), Image.LANCZOS)
            text = pytesseract.image_to_string(pil_gray, lang='eng')
            return text
    except Exception:
        # Fallback to cv2 path if PIL fails
        _, gray = _ensure_grayscale_cv(image_path)
        processed = preprocess_for_ocr(gray)
        text = pytesseract.image_to_string(processed, lang='eng')
        return text


def extract_fields_from_text(text):
    """Extract likely fields from certificate OCR text using regex heuristics.

    Returns a dict: name, student_id, degree, university, date
    """
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    joined = ' '.join(lines)

    result = {
        'name': None,
        'student_id': None,
        'degree': None,
        'university': None,
        'date': None,
        'raw_text': text
    }

    # Student ID heuristic: look for patterns like STU1234, digits with prefixes, or long numeric IDs
    id_match = re.search(r'([A-Z]{2,5}\-?\d{4,10}|\b\d{8,12}\b)', joined)
    if id_match:
        result['student_id'] = id_match.group(1)

    # Date heuristic: dd/mm/yyyy or dd-mm-yyyy or Month YYYY
    date_match = re.search(r'(\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b)|(\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4})', joined, re.I)
    if date_match:
        result['date'] = date_match.group(0)

    # Degree heuristic: common words
    deg_match = re.search(r'Bachelor|B\.Tech|BTech|Master|M\.Tech|MTech|Degree|Diploma|Certificate|Ph\.D|PhD', joined, re.I)
    if deg_match:
        result['degree'] = deg_match.group(0)

    # University heuristic: look for keywords like University, Institute, College
    uni_match = re.search(r'([A-Z][A-Za-z\s&,\.\-]{3,}\b(?:University|Institute|College|School|Academy)\b)', joined)
    if uni_match:
        result['university'] = uni_match.group(0).strip()

    # Name heuristic: often near "This is to certify" or "awarded to" phrases
    name_match = re.search(r'(?:awarded to|presented to|this is to certify\s*[:\-]?\s*)([A-Z][A-Za-z\s\.]{2,80})', joined, re.I)
    if name_match:
        candidate = name_match.group(1).strip()
        # Basic cleanup
        candidate = re.sub(r'\s{2,}', ' ', candidate)
        result['name'] = candidate

    # Fallback: try first line with capitalized words
    if not result['name'] and lines:
        for ln in lines[:6]:
            if re.match(r'^[A-Z][A-Za-z\s\.]{3,}$', ln):
                result['name'] = ln
                break

    return result


def compute_hog_descriptor(image_path, resize=(400, 400)):
    """Compute a HOG descriptor for the provided image.

    Returns a 1D numpy array descriptor.
    """
    img = cv2.imdecode(np.fromfile(image_path, dtype=np.uint8), cv2.IMREAD_GRAYSCALE)
    if img is None:
        raise ValueError('Unable to read image for HOG')
    img_resized = cv2.resize(img, resize)
    # skimage hog expects float image
    hog_feature = hog(img_resized, pixels_per_cell=(16, 16), cells_per_block=(2, 2), feature_vector=True)
    # normalize
    hog_feature = hog_feature.astype(np.float32)
    norm = np.linalg.norm(hog_feature)
    if norm > 0:
        hog_feature = hog_feature / norm
    return hog_feature


def cosine_similarity(a, b):
    a = np.asarray(a)
    b = np.asarray(b)
    if a.size == 0 or b.size == 0:
        return 0.0
    dot = float(np.dot(a, b))
    denom = (np.linalg.norm(a) * np.linalg.norm(b))
    if denom == 0:
        return 0.0
    return dot / denom


def compare_with_templates(hog_descriptor, templates_dir='backend/ocr_templates', top_n=3):
    """Compare HOG descriptor to templates stored in `templates_dir`.

    Returns list of (template_name, similarity) sorted descending.
    """
    if not os.path.isdir(templates_dir):
        return []
    results = []
    for fname in os.listdir(templates_dir):
        if not fname.lower().endswith(('.png', '.jpg', '.jpeg')):
            continue
        template_path = os.path.join(templates_dir, fname)
        try:
            t_hog = compute_hog_descriptor(template_path)
            sim = cosine_similarity(hog_descriptor, t_hog)
            results.append((fname, float(sim)))
        except Exception:
            continue
    results.sort(key=lambda x: x[1], reverse=True)
    return results[:top_n]


def verify_certificate(image_path, templates_dir='backend/ocr_templates'):
    """High level orchestration: runs OCR, extracts fields, computes HOG similarity

    Returns:
      {
        'extracted': {name, student_id, degree, university, date, raw_text},
        'hog_matches': [(template_name, similarity), ...],
        'verdict': 'genuine'|'suspect'|'unknown',
        'confidence': 0.0-1.0
      }
    """
    # 1) OCR
    text = extract_text_from_image(image_path)
    fields = extract_fields_from_text(text)

    # 2) HOG descriptor comparison
    try:
        hog_desc = compute_hog_descriptor(image_path)
        matches = compare_with_templates(hog_desc, templates_dir)
    except Exception as e:
        matches = []

    # 3) Heuristics to compute a verdict
    top_sim = matches[0][1] if matches else 0.0
    # Heuristics: if OCR found a student id and top_sim > 0.7 -> genuine
    if fields.get('student_id') and top_sim > 0.70:
        verdict = 'genuine'
        confidence = min(0.95, 0.5 + top_sim * 0.5)
    elif top_sim > 0.55:
        verdict = 'suspect'
        confidence = min(0.8, 0.4 + top_sim * 0.4)
    else:
        verdict = 'unknown'
        confidence = min(0.6, 0.2 + top_sim * 0.3)

    return {
        'extracted': fields,
        'hog_matches': matches,
        'verdict': verdict,
        'confidence': float(confidence)
    }
