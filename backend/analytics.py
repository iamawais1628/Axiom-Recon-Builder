from db import get_db_connection
from psycopg2.extras import RealDictCursor

def get_session_details(session_id):
    """Get detailed information about a reconciliation session"""
    try:
        conn = get_db_connection()
        if not conn:
            return None
        
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        # Get session info
        cur.execute('''
            SELECT * FROM reconciliation_sessions
            WHERE id = %s
        ''', (session_id,))
        
        session = cur.fetchone()
        conn.close()
        
        return dict(session) if session else None
    
    except Exception as e:
        print(f"❌ Error getting session details: {e}")
        return None

def get_session_matches(session_id, limit=100):
    """Get all matches from a specific session"""
    try:
        conn = get_db_connection()
        if not conn:
            return []
        
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute('''
            SELECT m.id, m.bank_tx_id, m.erp_tx_id, m.confidence, m.status,
                   b.amount as bank_amount, b.description as bank_desc,
                   e.amount as erp_amount, e.description as erp_desc
            FROM matches m
            JOIN transactions b ON m.bank_tx_id = b.id
            JOIN transactions e ON m.erp_tx_id = e.id
            WHERE m.id IN (
                SELECT m2.id FROM matches m2
                WHERE m2.created_at >= (
                    SELECT created_at FROM reconciliation_sessions WHERE id = %s
                )
                LIMIT %s
            )
            ORDER BY m.confidence DESC
        ''', (session_id, limit))
        
        matches = cur.fetchall()
        conn.close()
        
        return [dict(m) for m in matches]
    
    except Exception as e:
        print(f"❌ Error getting session matches: {e}")
        return []

def get_all_sessions_with_stats(limit=50):
    """Get all sessions with summary statistics"""
    try:
        conn = get_db_connection()
        if not conn:
            return []
        
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute('''
            SELECT 
                id,
                name,
                bank_count,
                erp_count,
                matched_count,
                match_rate,
                average_confidence,
                status,
                created_at,
                (bank_count + erp_count) as total_transactions
            FROM reconciliation_sessions
            ORDER BY created_at DESC
            LIMIT %s
        ''', (limit,))
        
        sessions = cur.fetchall()
        conn.close()
        
        return [dict(s) for s in sessions]
    
    except Exception as e:
        print(f"❌ Error getting sessions: {e}")
        return []

def get_historical_stats():
    """Get overall historical statistics"""
    try:
        conn = get_db_connection()
        if not conn:
            return {}
        
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        # Total sessions
        cur.execute('SELECT COUNT(*) as count FROM reconciliation_sessions')
        total_sessions = cur.fetchone()['count']
        
        # Total transactions processed
        cur.execute('SELECT COUNT(*) as count FROM transactions')
        total_transactions = cur.fetchone()['count']
        
        # Total matches
        cur.execute('SELECT COUNT(*) as count FROM matches')
        total_matches = cur.fetchone()['count']
        
        # Confirmed matches
        cur.execute("SELECT COUNT(*) as count FROM matches WHERE status = 'confirmed'")
        confirmed_matches = cur.fetchone()['count']
        
        # Average match rate
        cur.execute('SELECT AVG(match_rate) as avg_rate FROM reconciliation_sessions')
        avg_match_rate = cur.fetchone()['avg_rate'] or 0
        
        # Average confidence
        cur.execute('SELECT AVG(average_confidence) as avg_confidence FROM reconciliation_sessions')
        avg_confidence = cur.fetchone()['avg_confidence'] or 0
        
        # Highest match rate session
        cur.execute('''
            SELECT id, name, match_rate FROM reconciliation_sessions
            ORDER BY match_rate DESC LIMIT 1
        ''')
        best_session = cur.fetchone()
        
        conn.close()
        
        return {
            'total_sessions': total_sessions,
            'total_transactions': total_transactions,
            'total_matches': total_matches,
            'confirmed_matches': confirmed_matches,
            'average_match_rate': round(avg_match_rate, 1),
            'average_confidence': round(avg_confidence, 1),
            'best_session': dict(best_session) if best_session else None
        }
    
    except Exception as e:
        print(f"❌ Error getting historical stats: {e}")
        return {}

def get_matching_trends():
    """Get matching trends over time"""
    try:
        conn = get_db_connection()
        if not conn:
            return []
        
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute('''
            SELECT 
                DATE(created_at) as date,
                COUNT(*) as sessions,
                AVG(match_rate) as avg_match_rate,
                AVG(average_confidence) as avg_confidence,
                SUM(matched_count) as total_matches
            FROM reconciliation_sessions
            GROUP BY DATE(created_at)
            ORDER BY date DESC
            LIMIT 30
        ''')
        
        trends = cur.fetchall()
        conn.close()
        
        return [dict(t) for t in trends]
    
    except Exception as e:
        print(f"❌ Error getting trends: {e}")
        return []

def get_match_quality_breakdown():
    """Get breakdown of match quality (high/medium/low confidence)"""
    try:
        conn = get_db_connection()
        if not conn:
            return {}
        
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        # High confidence (>=95%)
        cur.execute("SELECT COUNT(*) as count FROM matches WHERE confidence >= 95")
        high = cur.fetchone()['count']
        
        # Medium confidence (80-94%)
        cur.execute("SELECT COUNT(*) as count FROM matches WHERE confidence >= 80 AND confidence < 95")
        medium = cur.fetchone()['count']
        
        # Low confidence (<80%)
        cur.execute("SELECT COUNT(*) as count FROM matches WHERE confidence < 80")
        low = cur.fetchone()['count']
        
        total = high + medium + low
        
        conn.close()
        
        return {
            'high_confidence': {
                'count': high,
                'percentage': round((high / total * 100), 1) if total > 0 else 0
            },
            'medium_confidence': {
                'count': medium,
                'percentage': round((medium / total * 100), 1) if total > 0 else 0
            },
            'low_confidence': {
                'count': low,
                'percentage': round((low / total * 100), 1) if total > 0 else 0
            },
            'total': total
        }
    
    except Exception as e:
        print(f"❌ Error getting quality breakdown: {e}")
        return {}

def search_sessions(query, limit=20):
    """Search sessions by name"""
    try:
        conn = get_db_connection()
        if not conn:
            return []
        
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute('''
            SELECT * FROM reconciliation_sessions
            WHERE name ILIKE %s
            ORDER BY created_at DESC
            LIMIT %s
        ''', (f'%{query}%', limit))
        
        sessions = cur.fetchall()
        conn.close()
        
        return [dict(s) for s in sessions]
    
    except Exception as e:
        print(f"❌ Error searching sessions: {e}")
        return []
