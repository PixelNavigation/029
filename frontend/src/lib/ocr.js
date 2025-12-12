import { createWorker } from 'tesseract.js';

let ocrWorker = null;

/**
 * Initialize OCR worker (lazy initialization)
 */
const initializeOcrWorker = async () => {
  if (!ocrWorker) {
    ocrWorker = await createWorker('eng', 1, {
      logger: (m) => {
        if (import.meta.env.DEV) {
          console.log('OCR:', m);
        }
      },
    });
  }
  return ocrWorker;
};

/**
 * Extract text from image file using OCR
 */
export const extractTextFromImage = async (file, options = {}) => {
  // Check if OCR is enabled
  if (import.meta.env.VITE_FEATURE_OCR !== 'true') {
    throw new Error('OCR feature is disabled');
  }

  const startTime = Date.now();
  
  try {
    const worker = await initializeOcrWorker();
    
    // Convert file to image data
    const imageData = await fileToImageData(file);
    
    // Perform OCR
    const { data } = await worker.recognize(imageData);
    
    // Extract and validate text
    const text = data.text.trim();
    const confidence = data.confidence;
    
    if (confidence < (options.confidence || 70)) {
      console.warn(`OCR confidence is low: ${confidence}%`);
    }
    
    // Extract structured fields from the text
    const extractedFields = extractStructuredFields(text);
    
    // Detect potential anomalies
    const anomalies = detectAnomalies(text, data, file);
    
    const processingTimeMs = Date.now() - startTime;
    
    return {
      text,
      confidence,
      extractedFields,
      anomalies,
      processingTimeMs,
    };
  } catch (error) {
    throw new Error(`OCR processing failed: ${error}`);
  }
};

/**
 * Convert file to image data for OCR processing
 */
const fileToImageData = (file) => {
  return new Promise((resolve, reject) => {
    if (file.type.startsWith('image/')) {
      resolve(file);
      return;
    }
    
    // For non-image files (like PDFs), we would need additional processing
    // For now, we'll reject non-image files
    reject(new Error('Only image files are supported for OCR'));
  });
};

/**
 * Extract structured fields from OCR text
 */
const extractStructuredFields = (text) => {
  const fields = {};
  
  // Common patterns for certificate fields
  const patterns = {
    name: [
      /(?:name|student.*name|full.*name)[\s:]*([a-zA-Z\s.]+)/i,
      /this.*certifies.*that[\s\n]+([a-zA-Z\s.]+)/i,
    ],
    rollNo: [
      /(?:roll.*no|roll.*number|registration.*no|reg.*no|student.*id)[\s:]*([a-zA-Z0-9]+)/i,
    ],
    course: [
      /(?:course|program|degree|qualification)[\s:]*([a-zA-Z\s&().-]+)/i,
      /bachelor.*of[^\n]*/i,
      /master.*of[^\n]*/i,
      /diploma.*in[^\n]*/i,
    ],
    institution: [
      /(?:university|college|institute|school)[\s:]*([a-zA-Z\s&().-]+)/i,
    ],
    date: [
      /(?:date|issued.*on|awarded.*on)[\s:]*(\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4})/i,
      /(\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4})/g,
    ],
    grade: [
      /(?:grade|marks|percentage|cgpa|gpa)[\s:]*([a-zA-Z0-9+.-]+)/i,
    ],
  };
  
  Object.entries(patterns).forEach(([fieldName, fieldPatterns]) => {
    for (const pattern of fieldPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        fields[fieldName] = match[1].trim();
        break;
      }
    }
  });
  
  // Clean up extracted fields
  Object.keys(fields).forEach(key => {
    fields[key] = cleanExtractedField(fields[key]);
  });
  
  return fields;
};

/**
 * Clean up extracted field values
 */
const cleanExtractedField = (value) => {
  return value
    .replace(/[^\w\s&().-]/g, '') // Remove special characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
};

/**
 * Detect potential anomalies in the OCR results
 */
const detectAnomalies = (text, ocrData, file) => {
  const anomalies = [];
  
  // Low confidence detection
  if (ocrData.confidence < 80) {
    anomalies.push({
      type: 'ocr_mismatch',
      severity: 'medium',
      description: 'Low OCR confidence detected',
      details: `OCR confidence: ${ocrData.confidence.toFixed(1)}%`,
      confidence: 100 - ocrData.confidence,
      suggestedAction: 'Manually verify extracted text or provide a higher quality image'
    });
  }
  
  // Suspicious text patterns
  const suspiciousPatterns = [
    /\d{4,}/g, // Long number sequences (might indicate tampering)
    /[^\x00-\x7F]+/g, // Non-ASCII characters (might indicate encoding issues)
  ];
  
  suspiciousPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches && matches.length > 5) {
      anomalies.push({
        type: 'format_suspicious',
        severity: 'low',
        description: 'Suspicious text patterns detected',
        details: `Found ${matches.length} instances of potentially suspicious patterns`,
        confidence: Math.min(matches.length * 10, 80),
        suggestedAction: 'Review document formatting for potential tampering'
      });
    }
  });
  
  // File size anomalies
  const expectedSizeRange = { min: 50000, max: 5000000 }; // 50KB - 5MB
  if (file.size < expectedSizeRange.min) {
    anomalies.push({
      type: 'format_suspicious',
      severity: 'medium',
      description: 'Document file size is unusually small',
      details: `File size: ${(file.size / 1024).toFixed(1)}KB`,
      confidence: 70,
      suggestedAction: 'Verify document quality and authenticity'
    });
  } else if (file.size > expectedSizeRange.max) {
    anomalies.push({
      type: 'format_suspicious',
      severity: 'low',
      description: 'Document file size is unusually large',
      details: `File size: ${(file.size / 1024 / 1024).toFixed(1)}MB`,
      confidence: 50,
      suggestedAction: 'Consider optimizing document size'
    });
  }
  
  // Missing common fields
  const extractedFields = extractStructuredFields(text);
  const expectedFields = ['name', 'course', 'institution'];
  const missingFields = expectedFields.filter(field => !extractedFields[field]);
  
  if (missingFields.length > 0) {
    anomalies.push({
      type: 'ocr_mismatch',
      severity: 'medium',
      description: 'Expected certificate fields not found',
      details: `Missing fields: ${missingFields.join(', ')}`,
      confidence: missingFields.length * 30,
      suggestedAction: 'Manually verify document completeness or improve image quality'
    });
  }
  
  return anomalies;
};

/**
 * Terminate OCR worker (cleanup)
 */
export const terminateOcrWorker = async () => {
  if (ocrWorker) {
    await ocrWorker.terminate();
    ocrWorker = null;
  }
};

/**
 * Check if OCR is available and enabled
 */
export const isOcrEnabled = () => {
  return import.meta.env.VITE_FEATURE_OCR === 'true';
};

/**
 * Get OCR processing status
 */
export const getOcrStatus = () => {
  if (!isOcrEnabled()) {
    return 'disabled';
  }
  return ocrWorker ? 'ready' : 'initializing';
};

/**
 * Batch process multiple files with OCR
 */
export const batchExtractText = async (files, onProgress) => {
  const results = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    onProgress?.(i + 1, files.length, file.name);
    
    try {
      const result = await extractTextFromImage(file);
      results.push({ file, result });
    } catch (error) {
      results.push({ 
        file, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }
  
  return results;
};