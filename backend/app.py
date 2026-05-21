from flask import Flask, jsonify, request
import psycopg2
import os
from dotenv import load_dotenv

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
            return jsonify({'status': 'error', 'message': 'DB connection failed'}), 500
        
        cur = conn.cursor()
        cur.execute('SELECT COUNT(*) FROM transactions')
        count = cur.fetchone()[0]
        conn.close()
        
        return jsonify({
            'status': 'ok',
            'message': 'API is running',
            'transactions_in_db': count
        })
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/test', methods=['POST'])
def test_api():
    """Test API with simple data"""
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

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(debug=True, port=port)
