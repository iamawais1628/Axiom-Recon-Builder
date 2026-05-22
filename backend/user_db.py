from db import get_db_connection
from auth import hash_password, verify_password
from psycopg2.extras import RealDictCursor

def create_user(email, password, name):
    """Create a new user"""
    try:
        conn = get_db_connection()
        if not conn:
            return None, "Database connection failed"
        
        cur = conn.cursor()
        
        # Check if user exists
        cur.execute('SELECT id FROM users WHERE email = %s', (email,))
        if cur.fetchone():
            conn.close()
            return None, "Email already registered"
        
        # Hash password
        password_hash = hash_password(password)
        
        # Create user
        cur.execute('''
            INSERT INTO users (email, password_hash, name, role, created_at)
            VALUES (%s, %s, %s, 'user', CURRENT_TIMESTAMP)
            RETURNING id, email, name
        ''', (email, password_hash, name))
        
        user = cur.fetchone()
        conn.commit()
        conn.close()
        
        return user, "User created successfully"
    
    except Exception as e:
        return None, f"Error creating user: {str(e)}"

def authenticate_user(email, password):
    """Authenticate user by email and password"""
    try:
        conn = get_db_connection()
        if not conn:
            return None, "Database connection failed"
        
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute('''
            SELECT id, email, name, password_hash, role, created_at
            FROM users WHERE email = %s
        ''', (email,))
        
        user = cur.fetchone()
        conn.close()
        
        if not user:
            return None, "Invalid email or password"
        
        if not verify_password(password, user['password_hash']):
            return None, "Invalid email or password"
        
        # Remove password hash from response
        user_data = dict(user)
        del user_data['password_hash']
        
        return user_data, "Authentication successful"
    
    except Exception as e:
        return None, f"Error authenticating: {str(e)}"

def get_user(user_id):
    """Get user by ID"""
    try:
        conn = get_db_connection()
        if not conn:
            return None
        
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute('''
            SELECT id, email, name, role, created_at
            FROM users WHERE id = %s
        ''', (user_id,))
        
        user = cur.fetchone()
        conn.close()
        
        return dict(user) if user else None
    
    except Exception as e:
        print(f"Error getting user: {e}")
        return None

def update_user_profile(user_id, name=None, email=None):
    """Update user profile"""
    try:
        conn = get_db_connection()
        if not conn:
            return None, "Database connection failed"
        
        cur = conn.cursor()
        
        updates = []
        params = []
        
        if name:
            updates.append('name = %s')
            params.append(name)
        
        if email:
            updates.append('email = %s')
            params.append(email)
        
        if not updates:
            return None, "No updates provided"
        
        params.append(user_id)
        
        cur.execute(f'''
            UPDATE users 
            SET {', '.join(updates)}, updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
            RETURNING id, email, name
        ''', params)
        
        user = cur.fetchone()
        conn.commit()
        conn.close()
        
        return user, "Profile updated successfully"
    
    except Exception as e:
        return None, f"Error updating profile: {str(e)}"

def change_password(user_id, old_password, new_password):
    """Change user password"""
    try:
        conn = get_db_connection()
        if not conn:
            return False, "Database connection failed"
        
        cur = conn.cursor()
        
        # Get current password hash
        cur.execute('SELECT password_hash FROM users WHERE id = %s', (user_id,))
        result = cur.fetchone()
        
        if not result:
            conn.close()
            return False, "User not found"
        
        current_hash = result[0]
        
        # Verify old password
        if not verify_password(old_password, current_hash):
            conn.close()
            return False, "Current password is incorrect"
        
        # Hash new password
        new_hash = hash_password(new_password)
        
        # Update password
        cur.execute('''
            UPDATE users 
            SET password_hash = %s, updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
        ''', (new_hash, user_id))
        
        conn.commit()
        conn.close()
        
        return True, "Password changed successfully"
    
    except Exception as e:
        return False, f"Error changing password: {str(e)}"

def delete_user(user_id):
    """Delete user account"""
    try:
        conn = get_db_connection()
        if not conn:
            return False, "Database connection failed"
        
        cur = conn.cursor()
        
        cur.execute('DELETE FROM users WHERE id = %s', (user_id,))
        
        conn.commit()
        conn.close()
        
        return True, "User deleted successfully"
    
    except Exception as e:
        return False, f"Error deleting user: {str(e)}"

def list_users(limit=100):
    """List all users (admin only)"""
    try:
        conn = get_db_connection()
        if not conn:
            return []
        
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute('''
            SELECT id, email, name, role, created_at
            FROM users
            ORDER BY created_at DESC
            LIMIT %s
        ''', (limit,))
        
        users = cur.fetchall()
        conn.close()
        
        return [dict(u) for u in users]
    
    except Exception as e:
        print(f"Error listing users: {e}")
        return []
