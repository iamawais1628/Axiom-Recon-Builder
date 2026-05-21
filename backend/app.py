from flask import Flask, jsonify, request
import psycopg2
import os
from dotenv import load_dotenv
from csv_parser import parse_csv
from matching import match_transactions

load_dotenv()

app = Flask(__name__)

def get_db():
    """Get database connection"""
    try:
        conn = psycopg2.connect(os.getenv('DATABASE_URL'))
        return conn
    except Exception as e:
        print(f"Database connection error: {e}")
        return None

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    try:
        conn = get_db()
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
    Upload bank and ERP CSVs, run matching algorithm
    
    Expected JSON:
    {
        "bank_csv": "amount,description,date\n1000,Payment,2024-01-15\n...",
        "erp_csv": "amount,description,date\n1000,Invoice,2024-01-15\n..."
    }
    
    Returns:
    {
        "status": "success",
        "total_bank": 5,
        "total_erp": 5,
        "matched": 5,
        "unmatched": 0,
        "match_rate": 100.0,
        "average_confidence": 95.5,
        "matches": [
            {
                "bank_amount": 1000,
                "bank_desc": "Payment ABC",
                "erp_amount": 1000,
                "erp_desc": "Invoice ABC",
                "confidence": 98.5
            },
            ...
        ]
    }
    """
    try:
        data = request.json
        
        # Get CSVs from request
        bank_csv = data.get('bank_csv', '')
        erp_csv = data.get('erp_csv', '')
        
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
                'message': 'Failed to parse CSV files. Check format.'
            }), 400
        
        # Run matching algorithm
        print("\n--- Running Matching Algorithm ---")
        matches = match_transactions(bank_txs, erp_txs)
        print(f"✓ Found {len(matches)} matches")
        
        # Calculate statistics
        total_bank = len(bank_txs)
        total_erp = len(erp_txs)
        matched = len(matches)
        unmatched = total_bank + total_erp - (matched * 2)
        match_rate = (matched / max(total_bank, total_erp)) * 100 if max(total_bank, total_erp) > 0 else 0
        avg_confidence = sum(m['confidence'] for m in matches) / max(len(matches), 1) if matches else 0
        
        return jsonify({
            'status': 'success',
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

@app.route('/api/test', methods=['POST'])
def test_api():
    """Simple test endpoint"""
    try:
        data = request.json
        
        amount = data.get('amount', 0)
        description = data.get('description', '')
        
        if amount <= 0:
            return jsonify({'error': 'Amount must be positive'}), 400
        
        if not description:
            return jsonify({'error': 'Description required'}), 400
        
        return jsonify({
            'status': 'success',
            'received': {
                'amount': amount,
                'description': description
            }
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/', methods=['GET'])
def index():
    """API documentation"""
    return jsonify({
        'name': 'ReconAI API',
        'version': '1.0',
        'endpoints': {
            'GET /health': 'Health check',
            'POST /api/upload-and-match': 'Upload CSVs and run matching',
            'POST /api/test': 'Test endpoint'
        }
    })

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    print(f"\n🚀 Starting ReconAI API on port {port}")
    print(f"   http://localhost:{port}")
    print(f"   Press Ctrl+C to stop\n")
    app.run(debug=True, port=port)
