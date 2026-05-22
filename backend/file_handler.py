import os
from werkzeug.utils import secure_filename
import csv
from io import StringIO

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'csv', 'txt'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

def init_upload_folder():
    """Create upload folder if it doesn't exist"""
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)
    print(f"✓ Upload folder ready: {UPLOAD_FOLDER}")

def allowed_file(filename):
    """Check if file is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def validate_file(file):
    """Validate file before processing"""
    if not file or file.filename == '':
        return False, "No file selected"
    
    if not allowed_file(file.filename):
        return False, f"File type not allowed. Use: {', '.join(ALLOWED_EXTENSIONS)}"
    
    # Check file size
    file.seek(0, os.SEEK_END)
    file_size = file.tell()
    file.seek(0)
    
    if file_size > MAX_FILE_SIZE:
        return False, f"File too large. Max size: {MAX_FILE_SIZE / 1024 / 1024}MB"
    
    return True, "File is valid"

def save_upload_file(file, file_type):
    """
    Save uploaded file temporarily
    file_type: 'bank' or 'erp'
    """
    try:
        init_upload_folder()
        
        # Validate file
        valid, message = validate_file(file)
        if not valid:
            return None, message
        
        # Create filename
        filename = secure_filename(f"{file_type}_{file.filename}")
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        
        # Save file
        file.save(filepath)
        print(f"✓ Saved upload: {filepath}")
        
        return filepath, "File saved successfully"
    
    except Exception as e:
        return None, f"Error saving file: {str(e)}"

def read_csv_file(filepath):
    """
    Read CSV file and return content as string
    """
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        print(f"✓ Read file: {filepath}")
        return content, None
    
    except Exception as e:
        return None, f"Error reading file: {str(e)}"

def delete_upload_file(filepath):
    """Delete uploaded file after processing"""
    try:
        if os.path.exists(filepath):
            os.remove(filepath)
            print(f"✓ Deleted: {filepath}")
        return True
    except Exception as e:
        print(f"⚠ Error deleting file: {e}")
        return False

def get_file_info(filepath):
    """Get file information"""
    try:
        if not os.path.exists(filepath):
            return None
        
        file_size = os.path.getsize(filepath)
        filename = os.path.basename(filepath)
        
        return {
            'filename': filename,
            'size': file_size,
            'size_kb': round(file_size / 1024, 2)
        }
    except Exception as e:
        print(f"Error getting file info: {e}")
        return None

def validate_csv_content(content):
    """
    Validate CSV content has required columns
    """
    try:
        reader = csv.DictReader(StringIO(content))
        
        if not reader.fieldnames:
            return False, "CSV is empty"
        
        required_fields = {'amount', 'description', 'date'}
        actual_fields = set(reader.fieldnames)
        
        if not required_fields.issubset(actual_fields):
            missing = required_fields - actual_fields
            return False, f"Missing columns: {', '.join(missing)}"
        
        # Check if there's at least one row
        first_row = next(reader, None)
        if not first_row:
            return False, "CSV has no data rows"
        
        return True, "CSV is valid"
    
    except Exception as e:
        return False, f"Error validating CSV: {str(e)}"

def count_csv_rows(content):
    """Count number of rows in CSV"""
    try:
        reader = csv.DictReader(StringIO(content))
        count = sum(1 for _ in reader)
        return count
    except:
        return 0
