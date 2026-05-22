from flask import Flask, jsonify, request
import os
from dotenv import load_dotenv
from csv_parser import parse_csv
from matching import match_transactions
from db import (
    init_db, save_transaction, save_match, confirm_match, reject_match,
    get_all_matches, get_match_stats, save_reconciliation_session, get_all_sessions
)

load_dotenv()

app = Flask(__name__)

# Initialize database on startup
init_db()

@app.route('/', methods=['GET'])
def index():
    """API documentation"""
    return jsonify({
        'name': 'ReconAI API',
        'version': '1.0',
        'endpoints': {
            'GET /health': 'Health check',
            'POST /api/upload-and-match': 'Upload CSVs and run matching',
            'GET /api/matches': 'Get all matches',
            'GET /api/stats': 'Get reconciliation statistics',
            'POST /api/match/<id>/confirm': 'Confirm a match',
            'POST /api/match/<id>/reject': 'Reject a match',
            'GET /api/sessions': 'Get all reconciliation sessions'
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
    Upload bank and ERP CSVs, run matching algorithm, save to database
    
    Expected JSON:
    {
        "bank_csv": "amount,description,date\n...",
        "erp_csv": "amount,description,date\n...",
        "session_name": "Monthly Reconciliation - Jan 2024"
    }
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
        
        # Add IDs for matching
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
        
        # Save transactions
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
        
        # Save reconciliation session
        session_id = save_reconciliation_session(
            session_name, total_bank, total_erp, matched, match_rate, avg_confidence
        )
        
        print(f"✓ Created reconciliation session: {session_id}\n")
        
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
        })
    
    except Exception as e:
        print(f"❌ Error: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 400

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
    print(f"\n🚀 Starting ReconAI API on port {port}")
    print(f"   http://localhost:{port}")
    print(f"   Press Ctrl+C to stop\n")
    app.run(debug=True, port=port)
