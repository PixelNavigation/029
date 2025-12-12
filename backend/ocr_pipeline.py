import os
import re
import json
from datetime import datetime
from pathlib import Path
from PIL import Image
import google.generativeai as genai
import pandas as pd


def setup_gemini():
    """Initialize Gemini AI with API key from environment"""
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY not found in environment variables")
    genai.configure(api_key=api_key)
    return genai.GenerativeModel('gemini-2.0-flash-exp')


def extract_certificate_data_with_gemini(file_path):
    """
    Use Gemini AI to extract all certificate details from a file (image, PDF, etc.).
    
    Returns:
        dict: Extracted certificate data
    """
    try:
        model = setup_gemini()
        
        # Determine file type and handle accordingly
        file_ext = os.path.splitext(file_path)[1].lower()
        
        # For PDFs, upload directly to Gemini
        if file_ext == '.pdf':
            # Upload PDF file to Gemini
            uploaded_file = genai.upload_file(file_path)
            content_input = uploaded_file
        else:
            # For images, open with PIL
            img = Image.open(file_path)
            content_input = img
        
        # Prompt for Gemini to extract certificate details
        prompt = """
        Analyze this certificate/document image and extract ALL relevant information in a structured format.
        
        Please extract the following details if present:
        1. Student/Recipient Name
        2. Student ID or Registration Number
        3. Degree/Certificate Type (e.g., B.Tech, M.Sc, Diploma)
        4. University/Institution Name
        5. Course/Program Name
        6. Date of Issue/Completion
        7. Grade/CGPA/Marks
        8. Year of Study/Passing Year
        9. Specialization/Branch
        10. Certificate Number
        11. Issuing Authority/Signatory
        12. Any other relevant details
        
        Return the data in JSON format with these keys:
        {
            "student_name": "",
            "student_id": "",
            "degree_type": "",
            "university_name": "",
            "course_name": "",
            "issue_date": "",
            "completion_date": "",
            "grade": "",
            "cgpa": "",
            "year_of_passing": "",
            "specialization": "",
            "certificate_number": "",
            "issuing_authority": "",
            "additional_details": {},
            "raw_text": ""
        }
        
        If any field is not found, leave it as an empty string. Include the complete text you can read in the "raw_text" field.
        """
        
        # Generate content with Gemini
        response = model.generate_content([prompt, content_input])
        
        # Parse the response
        response_text = response.text.strip()
        
        # Extract JSON from response (handle markdown code blocks)
        if "```json" in response_text:
            json_start = response_text.find("```json") + 7
            json_end = response_text.find("```", json_start)
            json_str = response_text[json_start:json_end].strip()
        elif "```" in response_text:
            json_start = response_text.find("```") + 3
            json_end = response_text.find("```", json_start)
            json_str = response_text[json_start:json_end].strip()
        else:
            json_str = response_text
        
        # Parse JSON
        try:
            certificate_data = json.loads(json_str)
        except json.JSONDecodeError:
            # Fallback: create structured data from text
            certificate_data = {
                "student_name": "",
                "student_id": "",
                "degree_type": "",
                "university_name": "",
                "course_name": "",
                "issue_date": "",
                "completion_date": "",
                "grade": "",
                "cgpa": "",
                "year_of_passing": "",
                "specialization": "",
                "certificate_number": "",
                "issuing_authority": "",
                "additional_details": {},
                "raw_text": response_text
            }
        
        # Add metadata
        certificate_data['extracted_at'] = datetime.utcnow().isoformat()
        certificate_data['upload_date'] = datetime.now().strftime('%Y-%m-%d')
        certificate_data['file_path'] = str(file_path)
        certificate_data['file_name'] = os.path.basename(file_path)
        
        return certificate_data
        
    except Exception as e:
        print(f"Gemini extraction error: {str(e)}")
        return {
            "error": str(e),
            "student_name": "",
            "student_id": "",
            "degree_type": "",
            "university_name": "",
            "raw_text": "",
            "upload_date": datetime.now().strftime('%Y-%m-%d'),
            "extracted_at": datetime.utcnow().isoformat()
        }


def save_to_excel(data_list, institution_name, output_dir='e:\\SIH 2025\\029'):
    """
    Save extracted certificate data to a neat Excel file based on institution name
    
    Args:
        data_list: List of dictionaries containing certificate data
        institution_name: Name of the institution
        output_dir: Directory to save the file (default: project root)
    
    Returns:
        str: Path to saved Excel file
    """
    try:
        from openpyxl import load_workbook
        from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
        
        # Ensure output directory exists
        os.makedirs(output_dir, exist_ok=True)
        
        # Sanitize institution name for filename
        safe_institution_name = re.sub(r'[^\w\s-]', '', institution_name).strip()
        safe_institution_name = re.sub(r'[-\s]+', '_', safe_institution_name)
        
        # Create filename based on institution name only (one file per college)
        filename = f"{safe_institution_name}_Certificates.xlsx"
        filepath = os.path.join(output_dir, filename)
        
        # Define clean column order
        columns = [
            'student_name', 'student_id', 'university_name', 'degree_type',
            'course_name', 'specialization', 'grade', 'cgpa', 
            'year_of_passing', 'issue_date', 'completion_date',
            'certificate_number', 'issuing_authority', 'upload_date',
            'extracted_at', 'file_name'
        ]
        
        # Prepare data with consistent columns
        prepared_data = []
        for data in data_list:
            row = {col: data.get(col, '') for col in columns}
            prepared_data.append(row)
        
        # Create DataFrame with specified column order
        df = pd.DataFrame(prepared_data, columns=columns)
        
        # Check if file exists to append data
        if os.path.exists(filepath):
            existing_df = pd.read_excel(filepath, engine='openpyxl')
            df = pd.concat([existing_df, df], ignore_index=True)
        
        # Save to Excel
        df.to_excel(filepath, index=False, engine='openpyxl')
        
        # Apply formatting
        wb = load_workbook(filepath)
        ws = wb.active
        
        # Header formatting
        header_fill = PatternFill(start_color='4472C4', end_color='4472C4', fill_type='solid')
        header_font = Font(bold=True, color='FFFFFF', size=11)
        border = Border(
            left=Side(style='thin'),
            right=Side(style='thin'),
            top=Side(style='thin'),
            bottom=Side(style='thin')
        )
        
        # Format header row
        for cell in ws[1]:
            cell.fill = header_fill
            cell.font = header_font
            cell.alignment = Alignment(horizontal='center', vertical='center')
            cell.border = border
        
        # Format data rows
        for row in ws.iter_rows(min_row=2, max_row=ws.max_row):
            for cell in row:
                cell.alignment = Alignment(horizontal='left', vertical='center', wrap_text=True)
                cell.border = border
        
        # Auto-adjust column widths
        for column in ws.columns:
            max_length = 0
            column_letter = column[0].column_letter
            for cell in column:
                try:
                    if len(str(cell.value)) > max_length:
                        max_length = len(str(cell.value))
                except:
                    pass
            adjusted_width = min(max_length + 2, 50)
            ws.column_dimensions[column_letter].width = adjusted_width
        
        # Freeze header row
        ws.freeze_panes = 'A2'
        
        wb.save(filepath)
        
        print(f"Data saved to Excel: {filepath}")
        return filepath
        
    except Exception as e:
        print(f"Error saving to Excel: {str(e)}")
        return None


def process_certificate_file(file_path):
    """
    Extract certificate data from a file using Gemini AI
    
    Args:
        file_path: Path to certificate file
    
    Returns:
        dict: Extracted certificate data
    """
    try:
        certificate_data = extract_certificate_data_with_gemini(file_path)
        return certificate_data
    except Exception as e:
        print(f"Certificate processing error: {str(e)}")
        return {
            'error': str(e),
            'student_name': '',
            'student_id': '',
            'university_name': '',
            'file_name': os.path.basename(file_path)
        }


def batch_process_and_save(file_paths, institution_name, output_dir='e:\\SIH 2025\\029'):
    """
    Process multiple certificate files and save to one Excel per institution
    
    Args:
        file_paths: List of file paths to process
        institution_name: Name of the institution
        output_dir: Directory to save output files
    
    Returns:
        dict: Processing results
    """
    try:
        all_data = []
        processed_count = 0
        failed_count = 0
        
        for file_path in file_paths:
            print(f"Processing: {file_path}")
            data = process_certificate_file(file_path)
            
            if data.get('error'):
                failed_count += 1
            else:
                processed_count += 1
            
            all_data.append(data)
        
        # Save all data to Excel
        excel_path = save_to_excel(all_data, institution_name, output_dir)
        
        return {
            'success': True,
            'processed': processed_count,
            'failed': failed_count,
            'total': len(file_paths),
            'excel_file': excel_path,
            'data': all_data
        }
        
    except Exception as e:
        print(f"Batch processing error: {str(e)}")
        return {
            'success': False,
            'error': str(e),
            'processed': 0,
            'failed': len(file_paths)
        }
