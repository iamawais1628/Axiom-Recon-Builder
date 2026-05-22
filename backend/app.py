from flask import Flask, jsonify, request
import os
from dotenv import load_dotenv
from csv_parser import parse_csv
from matching import match_transactions
from db import (
    init_db, save_transaction, save_match, confirm_match, reject_match,
    get_all_matches, get_match_stats, save_reconciliation_session, get_all_sessions
)
from file_handler import (
    init_upload_folder, save_upload_file, read_csv_file, delete_upload_file,
    validate_csv_content, count_csv_rows, get_file_info
)

load_dotenv()

app = Flask(__name__)

# Allow larger file uploads
app.config['MAX_CONTENT_LENGTH'] = 5 * 1024 * 1024  # 5MB

# Initialize on startup
init_db()
init_upload_folder()

@app.route('/', methods=['GET'])
def index():
    """API documentation"""
    return jsonify({
        'name': 'ReconAI API',
        'version': '1.1',
        'features': [
            'CSV paste & match',
            'CSV file upload',
            'Database storage',
            'Match confirmation',
            'Reconciliation history'
        ],
        'endpoints': {
            'GET /health': 'Health check',
            'POST /api/upload-and-match': 'Paste CSVs and run matching',
            'POST /api/upload-file': 'Upload CSV files',
            'GET /api/matches': 'Get all matches',
            'GET /api/stats': 'Get statistics',
            'POST /api/match/<id>/confirm': 'Confirm match',
            'POST /api/match/<id>/reject': 'Reject match',
            'GET /api/sessions': 'Get reconciliation history'
        }
    })

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    try:
        from db import get_db_connection
        conn = get_db_connection()
        if not conn:
            return jsonify({
                'status': 'error',
                'message': 'Database not connected',
                'database': 'OFFLINE'
            }), 500
        
        cur = conn.cursor()
        cur.execute('SELECT COUNT(*) FROM transactions')
        count = cur.fetchone()[0]
        conn.close()
        
        return jsonify({
            'status': 'ok',
            'message': 'API is running',
            'database': 'ONLINE',
            'transactions_in_db': count
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e),
            'database': 'OFFLINE'
        }), 500

@app.route('/api/upload-and-match', methods=['POST'])
def upload_and_match():
    """
    Paste CSVs and run matching (original method)
    """
    try:
        data = request.json
        
        bank_csv = data.get('bank_csv', '')
        erp_csv = data.get('erp_csv', '')
        session_name = data.get('session_name', 'Reconciliation')
        
        if not bank_csv or not erp_csv:
            return jsonify({
                'status': 'error',
                'message': 'bank_csv and erp_csv are required'
            }), 400
        
        return process_reconciliation(bank_csv, erp_csv, session_name)
    
    except Exception as e:
        print(f"❌ Error: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 400

@app.route('/api/upload-file', methods=['POST'])
def upload_file():
    """
    Upload CSV files and run matching
    
    Expected: multipart/form-data with:
    - bank_file: CSV file
    - erp_file: CSV file
    - session_name: (optional) name for this reconciliation
    """
    try:
        # Check if files are present
        if 'bank_file' not in request.files or 'erp_file' not in request.files:
            return jsonify({
                'status': 'error',
                'message': 'bank_file and erp_file are required'
            }), 400
        
        bank_file = request.files['bank_file']
        erp_file = request.files['erp_file']
        session_name = request.form.get('session_name', 'File Upload Reconciliation')
        
        # Save files
        print("\n--- Processing File Upload ---")
        bank_path, bank_msg = save_upload_file(bank_file, 'bank')
        erp_path, erp_msg = save_upload_file(erp_file, 'erp')
        
        if not bank_path or not erp_path:
            return jsonify({
                'status': 'error',
                'bank_message': bank_msg,
                'erp_message': erp_msg
            }), 400
        
        # Read file contents
        bank_csv, bank_read_error = read_csv_file(bank_path)
        erp_csv, erp_read_error = read_csv_file(erp_path)
        
        if not bank_csv or not erp_csv:
            return jsonify({
                'status': 'error',
                'message': f"Error reading files: {bank_read_error or erp_read_error}"
            }), 400
        
        # Validate CSV content
        bank_valid, bank_validate_msg = validate_csv_content(bank_csv)
        erp_valid, erp_validate_msg = validate_csv_content(erp_csv)
        
        if not bank_valid or not erp_valid:
            return jsonify({
                'status': 'error',
                'bank_message': bank_validate_msg if not bank_valid else 'Valid',
                'erp_message': erp_validate_msg if not erp_valid else 'Valid'
            }), 400
        
        # Get file info
        bank_info = get_file_info(bank_path)
        erp_info = get_file_info(erp_path)
        bank_rows = count_csv_rows(bank_csv)
        erp_rows = count_csv_rows(erp_csv)
        
        print(f"✓ Bank file: {bank_info['filename']} ({bank_rows} rows)")
        print(f"✓ ERP file: {erp_info['filename']} ({erp_rows} rows)")
        
        # Process reconciliation
        result = process_reconciliation(bank_csv, erp_csv, session_name)
        
        # Clean up uploaded files
        delete_upload_file(bank_path)
        delete_upload_file(erp_path)
        
        # Add file info to response
        result_data = result.get_json()
        result_data['bank_file'] = bank_info
        result_data['erp_file'] = erp_info
        
        return jsonify(result_data), result[1]
    
    except Exception as e:
        print(f"❌ Error: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 400

def process_reconciliation(bank_csv, erp_csv, session_name):
    """
    Core reconciliation logic (used by both paste and file upload)
    """
    try:
        # Parse CSVs
        print("\n--- Parsing CSVs ---")
        bank_txs = parse_csv(bank_csv)
        erp_txs = parse_csv(erp_csv)
        
        print(f"✓ Parsed {len(bank_txs)} bank transactions")
        print(f"✓ Parsed {len(erp_txs)} ERP transactions")
        
        if not bank_txs or not erp_txs:
            return jsonify({
                'status': 'error',
                'message': 'Failed to parse CSV files'
            }), 400
        
        # Add IDs
        for i, tx in enumerate(bank_txs):
            tx['id'] = i + 1
        
        for i, tx in enumerate(erp_txs):
            tx['id'] = i + 100
        
        # Run matching
        print("\n--- Running Matching Algorithm ---")
        matches = match_transactions(bank_txs, erp_txs)
        print(f"✓ Found {len(matches)} matches")
        
        # Calculate stats
        total_bank = len(bank_txs)
        total_erp = len(erp_txs)
        matched = len(matches)
        unmatched = total_bank + total_erp - (matched * 2)
        match_rate = (matched / max(total_bank, total_erp)) * 100 if max(total_bank, total_erp) > 0 else 0
        avg_confidence = sum(m['confidence'] for m in matches) / max(len(matches), 1) if matches else 0
        
        # Save to database
        print("\n--- Saving to Database ---")
        
        for tx in bank_txs:
            save_transaction('bank', tx['amount'], tx['description'], tx['date'])
        
        for tx in erp_txs:
            save_transaction('erp', tx['amount'], tx['description'], tx['date'])
        
        print(f"✓ Saved {total_bank} bank transactions")
        print(f"✓ Saved {total_erp} ERP transactions")
        
        # Save matches
        for m in matches:
            save_match(m['bank_id'], m['erp_id'], m['confidence'])
        
        print(f"✓ Saved {matched} matches")
        
        # Save session
        session_id = save_reconciliation_session(
            session_name, total_bank, total_erp, matched, match_rate, avg_confidence
        )
        
        print(f"✓ Created session: {session_id}\n")
        
        return jsonify({
            'status': 'success',
            'session_id': session_id,
            'session_name': session_name,
            'total_bank': total_bank,
            'total_erp': total_erp,
            'matched': matched,
            'unmatched': unmatched,
            'match_rate': round(match_rate, 1),
            'average_confidence': round(avg_confidence, 1),
            'matches': matches
        }), 200
    
    except Exception as e:
        print(f"❌ Error in process_reconciliation: {e}")
        raise

@app.route('/api/matches', methods=['GET'])
def get_matches():
    """Get all matches from database"""
    try:
        matches = get_all_matches(limit=200)
        return jsonify({
            'status': 'success',
            'count': len(matches),
            'matches': [dict(m) for m in matches]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get reconciliation statistics"""
    try:
        stats = get_match_stats()
        return jsonify({
            'status': 'success',
            'stats': stats
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/match/<match_id>/confirm', methods=['POST'])
def confirm(match_id):
    """Confirm a match"""
    try:
        success = confirm_match(int(match_id))
        if success:
            return jsonify({'status': 'success', 'message': 'Match confirmed'})
        else:
            return jsonify({'status': 'error'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/match/<match_id>/reject', methods=['POST'])
def reject(match_id):
    """Reject a match"""
    try:
        success = reject_match(int(match_id))
        if success:
            return jsonify({'status': 'success', 'message': 'Match rejected'})
        else:
            return jsonify({'status': 'error'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/sessions', methods=['GET'])
def get_sessions():
    """Get all reconciliation sessions"""
    try:
        sessions = get_all_sessions()
        return jsonify({
            'status': 'success',
            'count': len(sessions),
            'sessions': [dict(s) for s in sessions]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def server_error(error):
    return jsonify({'error': 'Server error'}), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    print(f"\n🚀 Starting ReconAI API v1.1 on port {port}")
    print(f"   http://localhost:{port}")
    print(f"   File upload enabled (5MB max)\n")
    app.run(debug=True, port=port)
