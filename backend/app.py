from flask import Flask, jsonify, request
from functools import wraps
import os
from dotenv import load_dotenv
from auth import create_token, verify_token, validate_email, validate_password
from user_db import (
    create_user, authenticate_user, get_user, update_user_profile,
    change_password, delete_user, list_users
)
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
from analytics import (
    get_session_details, get_session_matches, get_all_sessions_with_stats,
    get_historical_stats, get_matching_trends, get_match_quality_breakdown, search_sessions
)

load_dotenv()

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 5 * 1024 * 1024

# Initialize on startup
init_db()
init_upload_folder()

# ===== AUTHENTICATION MIDDLEWARE =====

def token_required(f):
    """Decorator to protect routes that require authentication"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Get token from header
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]
            except IndexError:
                return jsonify({'error': 'Invalid token format'}), 401
        
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        # Verify token
        payload = verify_token(token)
        if not payload:
            return jsonify({'error': 'Invalid or expired token'}), 401
        
        # Pass user data to route
        request.user = get_user(payload['user_id'])
        if not request.user:
            return jsonify({'error': 'User not found'}), 401
        
        return f(*args, **kwargs)
    
    return decorated

# ===== AUTHENTICATION ENDPOINTS =====

@app.route('/api/auth/signup', methods=['POST'])
def signup():
    """Register a new user"""
    try:
        data = request.json
        
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        name = data.get('name', '').strip()
        
        if not email or not password or not name:
            return jsonify({
                'status': 'error',
                'message': 'Email, password, and name are required'
            }), 400
        
        if not validate_email(email):
            return jsonify({
                'status': 'error',
                'message': 'Invalid email format'
            }), 400
        
        valid, message = validate_password(password)
        if not valid:
            return jsonify({
                'status': 'error',
                'message': message
            }), 400
        
        user, message = create_user(email, password, name)
        
        if not user:
            return jsonify({
                'status': 'error',
                'message': message
            }), 400
        
        token = create_token(user[0], user[1])
        
        return jsonify({
            'status': 'success',
            'message': 'Account created successfully',
            'user': {
                'id': user[0],
                'email': user[1],
                'name': user[2]
            },
            'token': token
        }), 201
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    """Login user"""
    try:
        data = request.json
        
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        if not email or not password:
            return jsonify({
                'status': 'error',
                'message': 'Email and password are required'
            }), 400
        
        user, message = authenticate_user(email, password)
        
        if not user:
            return jsonify({
                'status': 'error',
                'message': message
            }), 401
        
        token = create_token(user['id'], user['email'])
        
        return jsonify({
            'status': 'success',
            'message': 'Login successful',
            'user': {
                'id': user['id'],
                'email': user['email'],
                'name': user['name'],
                'role': user['role']
            },
            'token': token
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/profile', methods=['GET'])
@token_required
def get_profile():
    """Get current user profile"""
    try:
        return jsonify({
            'status': 'success',
            'user': {
                'id': request.user['id'],
                'email': request.user['email'],
                'name': request.user['name'],
                'role': request.user['role']
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/profile', methods=['PUT'])
@token_required
def update_profile():
    """Update user profile"""
    try:
        data = request.json
        name = data.get('name')
        
        if not name:
            return jsonify({
                'status': 'error',
                'message': 'Name is required'
            }), 400
        
        user, message = update_user_profile(request.user['id'], name=name)
        
        if not user:
            return jsonify({
                'status': 'error',
                'message': message
            }), 400
        
        return jsonify({
            'status': 'success',
            'message': 'Profile updated',
            'user': {
                'id': user[0],
                'email': user[1],
                'name': user[2]
            }
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/change-password', methods=['POST'])
@token_required
def change_pwd():
    """Change password"""
    try:
        data = request.json
        
        old_password = data.get('old_password', '')
        new_password = data.get('new_password', '')
        
        if not old_password or not new_password:
            return jsonify({
                'status': 'error',
                'message': 'Old and new passwords are required'
            }), 400
        
        valid, message = validate_password(new_password)
        if not valid:
            return jsonify({
                'status': 'error',
                'message': message
            }), 400
        
        success, message = change_password(request.user['id'], old_password, new_password)
        
        if not success:
            return jsonify({
                'status': 'error',
                'message': message
            }), 400
        
        return jsonify({
            'status': 'success',
            'message': message
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/delete', methods=['DELETE'])
@token_required
def delete_account():
    """Delete user account"""
    try:
        success, message = delete_user(request.user['id'])
        
        if not success:
            return jsonify({
                'status': 'error',
                'message': message
            }), 400
        
        return jsonify({
            'status': 'success',
            'message': 'Account deleted successfully'
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ===== MAIN ENDPOINTS =====

@app.route('/', methods=['GET'])
def index():
    """API documentation"""
    return jsonify({
        'name': 'ReconAI API',
        'version': '1.3',
        'features': [
            'CSV paste & match',
            'CSV file upload',
            'Database storage',
            'Match confirmation',
            'Reconciliation history',
            'Analytics & trends',
            'User authentication'
        ],
        'endpoints': {
            'Authentication': {
                'POST /api/auth/signup': 'Register new user',
                'POST /api/auth/login': 'Login',
                'GET /api/auth/profile': 'Get profile (auth required)',
                'PUT /api/auth/profile': 'Update profile (auth required)',
                'POST /api/auth/change-password': 'Change password (auth required)',
                'DELETE /api/auth/delete': 'Delete account (auth required)'
            },
            'Reconciliation': {
                'POST /api/upload-and-match': 'Paste CSVs (auth required)',
                'POST /api/upload-file': 'Upload files (auth required)'
            },
            'History & Analytics': {
                'GET /api/sessions': 'All sessions (auth required)',
                'GET /api/sessions/<id>': 'Session details',
                'GET /api/sessions/<id>/matches': 'Session matches',
                'GET /api/analytics/stats': 'Overall statistics',
                'GET /api/analytics/trends': 'Historical trends',
                'GET /api/analytics/quality': 'Match quality breakdown',
                'GET /api/analytics/search': 'Search sessions'
            },
            'Match Management': {
                'GET /api/matches': 'All matches',
                'GET /api/stats': 'Current statistics',
                'POST /api/match/<id>/confirm': 'Confirm match',
                'POST /api/match/<id>/reject': 'Reject match'
            },
            'System': {
                'GET /health': 'Health check'
            }
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
@token_required
def upload_and_match():
    """Paste CSVs and run matching"""
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
        return jsonify({'status': 'error', 'message': str(e)}), 400

@app.route('/api/upload-file', methods=['POST'])
@token_required
def upload_file():
    """Upload CSV files and run matching"""
    try:
        if 'bank_file' not in request.files or 'erp_file' not in request.files:
            return jsonify({
                'status': 'error',
                'message': 'bank_file and erp_file are required'
            }), 400
        
        bank_file = request.files['bank_file']
        erp_file = request.files['erp_file']
        session_name = request.form.get('session_name', 'File Upload Reconciliation')
        
        print("\n--- Processing File Upload ---")
        bank_path, bank_msg = save_upload_file(bank_file, 'bank')
        erp_path, erp_msg = save_upload_file(erp_file, 'erp')
        
        if not bank_path or not erp_path:
            return jsonify({
                'status': 'error',
                'bank_message': bank_msg,
                'erp_message': erp_msg
            }), 400
        
        bank_csv, bank_read_error = read_csv_file(bank_path)
        erp_csv, erp_read_error = read_csv_file(erp_path)
        
        if not bank_csv or not erp_csv:
            return jsonify({
                'status': 'error',
                'message': f"Error reading files: {bank_read_error or erp_read_error}"
            }), 400
        
        bank_valid, bank_validate_msg = validate_csv_content(bank_csv)
        erp_valid, erp_validate_msg = validate_csv_content(erp_csv)
        
        if not bank_valid or not erp_valid:
            return jsonify({
                'status': 'error',
                'bank_message': bank_validate_msg if not bank_valid else 'Valid',
                'erp_message': erp_validate_msg if not erp_valid else 'Valid'
            }), 400
        
        bank_info = get_file_info(bank_path)
        erp_info = get_file_info(erp_path)
        bank_rows = count_csv_rows(bank_csv)
        erp_rows = count_csv_rows(erp_csv)
        
        print(f"✓ Bank file: {bank_info['filename']} ({bank_rows} rows)")
        print(f"✓ ERP file: {erp_info['filename']} ({erp_rows} rows)")
        
        result = process_reconciliation(bank_csv, erp_csv, session_name)
        
        delete_upload_file(bank_path)
        delete_upload_file(erp_path)
        
        result_data = result.get_json()
        result_data['bank_file'] = bank_info
        result_data['erp_file'] = erp_info
        
        return jsonify(result_data), result[1]
    
    except Exception as e:
        print(f"❌ Error: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 400

def process_reconciliation(bank_csv, erp_csv, session_name):
    """Core reconciliation logic"""
    try:
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
        
        for i, tx in enumerate(bank_txs):
            tx['id'] = i + 1
        
        for i, tx in enumerate(erp_txs):
            tx['id'] = i + 100
        
        print("\n--- Running Matching Algorithm ---")
        matches = match_transactions(bank_txs, erp_txs)
        print(f"✓ Found {len(matches)} matches")
        
        total_bank = len(bank_txs)
        total_erp = len(erp_txs)
        matched = len(matches)
        unmatched = total_bank + total_erp - (matched * 2)
        match_rate = (matched / max(total_bank, total_erp)) * 100 if max(total_bank, total_erp) > 0 else 0
        avg_confidence = sum(m['confidence'] for m in matches) / max(len(matches), 1) if matches else 0
        
        print("\n--- Saving to Database ---")
        
        for tx in bank_txs:
            save_transaction('bank', tx['amount'], tx['description'], tx['date'])
        
        for tx in erp_txs:
            save_transaction('erp', tx['amount'], tx['description'], tx['date'])
        
        print(f"✓ Saved {total_bank} bank transactions")
        print(f"✓ Saved {total_erp} ERP transactions")
        
        for m in matches:
            save_match(m['bank_id'], m['erp_id'], m['confidence'])
        
        print(f"✓ Saved {matched} matches")
        
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

# ===== ANALYTICS ENDPOINTS =====

@app.route('/api/analytics/stats', methods=['GET'])
def analytics_stats():
    """Get overall historical statistics"""
    try:
        stats = get_historical_stats()
        return jsonify({
            'status': 'success',
            'stats': stats
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/analytics/trends', methods=['GET'])
def analytics_trends():
    """Get historical trends"""
    try:
        trends = get_matching_trends()
        return jsonify({
            'status': 'success',
            'count': len(trends),
            'trends': trends
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/analytics/quality', methods=['GET'])
def analytics_quality():
    """Get match quality breakdown"""
    try:
        quality = get_match_quality_breakdown()
        return jsonify({
            'status': 'success',
            'quality': quality
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/analytics/search', methods=['GET'])
def analytics_search():
    """Search sessions by name"""
    try:
        query = request.args.get('q', '')
        if not query:
            return jsonify({'error': 'Query parameter q is required'}), 400
        
        results = search_sessions(query)
        return jsonify({
            'status': 'success',
            'query': query,
            'count': len(results),
            'results': results
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# ===== SESSION MANAGEMENT ENDPOINTS =====

@app.route('/api/sessions', methods=['GET'])
@token_required
def get_sessions_list():
    """Get all reconciliation sessions"""
    try:
        limit = request.args.get('limit', 50, type=int)
        sessions = get_all_sessions_with_stats(limit=limit)
        return jsonify({
            'status': 'success',
            'count': len(sessions),
            'sessions': sessions
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/sessions/<int:session_id>', methods=['GET'])
def get_session(session_id):
    """Get details of a specific session"""
    try:
        session = get_session_details(session_id)
        if not session:
            return jsonify({'error': 'Session not found'}), 404
        
        return jsonify({
            'status': 'success',
            'session': session
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/sessions/<int:session_id>/matches', methods=['GET'])
def get_session_matches_endpoint(session_id):
    """Get all matches from a specific session"""
    try:
        limit = request.args.get('limit', 100, type=int)
        matches = get_session_matches(session_id, limit=limit)
        
        return jsonify({
            'status': 'success',
            'session_id': session_id,
            'count': len(matches),
            'matches': matches
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# ===== LEGACY ENDPOINTS =====

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
    """Get current reconciliation statistics"""
    try:
        stats = get_match_stats()
        return jsonify({
            'status': 'success',
            'stats': stats
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/match/<int:match_id>/confirm', methods=['POST'])
def confirm(match_id):
    """Confirm a match"""
    try:
        success = confirm_match(match_id)
        if success:
            return jsonify({'status': 'success', 'message': 'Match confirmed'})
        else:
            return jsonify({'status': 'error'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/match/<int:match_id>/reject', methods=['POST'])
def reject(match_id):
    """Reject a match"""
    try:
        success = reject_match(match_id)
        if success:
            return jsonify({'status': 'success', 'message': 'Match rejected'})
        else:
            return jsonify({'status': 'error'}), 400
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
    print(f"\n🚀 Starting ReconAI API v1.3 on port {port}")
    print(f"   Full-featured reconciliation, analytics & authentication\n")
    app.run(debug=True, port=port)
