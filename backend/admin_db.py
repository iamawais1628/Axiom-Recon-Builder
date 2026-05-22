from db import get_db_connection
from psycopg2.extras import RealDictCursor

def update_user_role(user_id, new_role):
    """Update user role (admin only)"""
    try:
        valid_roles = ['user', 'analyst', 'admin']
        if new_role not in valid_roles:
            return False, f"Invalid role. Must be one of: {', '.join(valid_roles)}"
        
        conn = get_db_connection()
        if not conn:
            return False, "Database connection failed"
        
        cur = conn.cursor()
        
        cur.execute('''
            UPDATE users 
            SET role = %s, updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
        ''', (new_role, user_id))
        
        if cur.rowcount == 0:
            conn.close()
            return False, "User not found"
        
        conn.commit()
        conn.close()
        
        return True, f"User role updated to {new_role}"
    
    except Exception as e:
        return False, f"Error updating role: {str(e)}"

def toggle_user_active(user_id, active):
    """Enable/disable user account"""
    try:
        conn = get_db_connection()
        if not conn:
            return False, "Database connection failed"
        
        cur = conn.cursor()
        
        cur.execute('''
            UPDATE users 
            SET active = %s, updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
        ''', (active, user_id))
        
        if cur.rowcount == 0:
            conn.close()
            return False, "User not found"
        
        conn.commit()
        conn.close()
        
        status = "enabled" if active else "disabled"
        return True, f"User {status} successfully"
    
    except Exception as e:
        return False, f"Error toggling user: {str(e)}"

def get_user_stats(user_id):
    """Get statistics for a specific user"""
    try:
        conn = get_db_connection()
        if not conn:
            return None
        
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute('''
            SELECT 
                COUNT(rs.id) as total_sessions,
                SUM(rs.matched_count) as total_matches,
                AVG(rs.match_rate) as avg_match_rate,
                AVG(rs.average_confidence) as avg_confidence,
                MAX(rs.created_at) as last_reconciliation
            FROM reconciliation_sessions rs
            JOIN user_sessions us ON rs.id = us.reconciliation_session_id
            WHERE us.user_id = %s
        ''', (user_id,))
        
        stats = cur.fetchone()
        conn.close()
        
        return dict(stats) if stats else None
    
    except Exception as e:
        print(f"Error getting user stats: {e}")
        return None

def get_team_members(admin_user_id, limit=100):
    """Get all users in the system (if admin)"""
    try:
        conn = get_db_connection()
        if not conn:
            return []
        
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute('''
            SELECT 
                id, email, name, role, active,
                created_at, last_login
            FROM users
            ORDER BY created_at DESC
            LIMIT %s
        ''', (limit,))
        
        users = cur.fetchall()
        conn.close()
        
        return [dict(u) for u in users]
    
    except Exception as e:
        print(f"Error getting team members: {e}")
        return []

def get_admin_dashboard_stats():
    """Get overall system statistics for admin dashboard"""
    try:
        conn = get_db_connection()
        if not conn:
            return None
        
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        # Total users
        cur.execute('SELECT COUNT(*) as count FROM users')
        total_users = cur.fetchone()['count']
        
        # Active users
        cur.execute("SELECT COUNT(*) as count FROM users WHERE active = TRUE")
        active_users = cur.fetchone()['count']
        
        # Admin users
        cur.execute("SELECT COUNT(*) as count FROM users WHERE role = 'admin'")
        admin_count = cur.fetchone()['count']
        
        # Analyst users
        cur.execute("SELECT COUNT(*) as count FROM users WHERE role = 'analyst'")
        analyst_count = cur.fetchone()['count']
        
        # Total reconciliations
        cur.execute('SELECT COUNT(*) as count FROM reconciliation_sessions')
        total_sessions = cur.fetchone()['count']
        
        # Total transactions processed
        cur.execute('SELECT COUNT(*) as count FROM transactions')
        total_transactions = cur.fetchone()['count']
        
        # Average match rate
        cur.execute('SELECT AVG(match_rate) as avg_rate FROM reconciliation_sessions')
        avg_match_rate = cur.fetchone()['avg_rate'] or 0
        
        conn.close()
        
        return {
            'total_users': total_users,
            'active_users': active_users,
            'admin_count': admin_count,
            'analyst_count': analyst_count,
            'total_sessions': total_sessions,
            'total_transactions': total_transactions,
            'average_match_rate': round(avg_match_rate, 1)
        }
    
    except Exception as e:
        print(f"Error getting admin stats: {e}")
        return None

def get_user_activity_log(user_id, limit=50):
    """Get login history for a user"""
    try:
        conn = get_db_connection()
        if not conn:
            return []
        
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute('''
            SELECT login_at, ip_address, user_agent
            FROM login_history
            WHERE user_id = %s
            ORDER BY login_at DESC
            LIMIT %s
        ''', (user_id, limit))
        
        activities = cur.fetchall()
        conn.close()
        
        return [dict(a) for a in activities]
    
    except Exception as e:
        print(f"Error getting activity log: {e}")
        return []
