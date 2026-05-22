from db import get_db_connection
from psycopg2.extras import RealDictCursor
import json

def create_rule(user_id, name, conditions, action, enabled=True):
    """Create a new rule"""
    try:
        conn = get_db_connection()
        if not conn:
            return None, "Database connection failed"
        
        cur = conn.cursor()
        
        conditions_json = json.dumps(conditions)
        
        cur.execute('''
            INSERT INTO reconciliation_rules 
            (user_id, name, conditions, action, enabled, created_at)
            VALUES (%s, %s, %s, %s, %s, CURRENT_TIMESTAMP)
            RETURNING id
        ''', (user_id, name, conditions_json, action, enabled))
        
        rule_id = cur.fetchone()[0]
        conn.commit()
        conn.close()
        
        return rule_id, "Rule created successfully"
    
    except Exception as e:
        return None, f"Error creating rule: {str(e)}"

def get_user_rules(user_id, limit=100):
    """Get all rules for a user"""
    try:
        conn = get_db_connection()
        if not conn:
            return []
        
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute('''
            SELECT id, name, conditions, action, enabled, created_at
            FROM reconciliation_rules
            WHERE user_id = %s
            ORDER BY created_at DESC
            LIMIT %s
        ''', (user_id, limit))
        
        rules = cur.fetchall()
        conn.close()
        
        result = []
        for rule in rules:
            rule_dict = dict(rule)
            rule_dict['conditions'] = json.loads(rule_dict['conditions'])
            result.append(rule_dict)
        
        return result
    
    except Exception as e:
        print(f"Error getting rules: {e}")
        return []

def get_rule(rule_id):
    """Get a specific rule"""
    try:
        conn = get_db_connection()
        if not conn:
            return None
        
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute('''
            SELECT id, user_id, name, conditions, action, enabled, created_at
            FROM reconciliation_rules
            WHERE id = %s
        ''', (rule_id,))
        
        rule = cur.fetchone()
        conn.close()
        
        if rule:
            rule_dict = dict(rule)
            rule_dict['conditions'] = json.loads(rule_dict['conditions'])
            return rule_dict
        
        return None
    
    except Exception as e:
        print(f"Error getting rule: {e}")
        return None

def update_rule(rule_id, name=None, conditions=None, action=None, enabled=None):
    """Update a rule"""
    try:
        conn = get_db_connection()
        if not conn:
            return False, "Database connection failed"
        
        cur = conn.cursor()
        
        updates = []
        params = []
        
        if name:
            updates.append('name = %s')
            params.append(name)
        
        if conditions:
            updates.append('conditions = %s')
            params.append(json.dumps(conditions))
        
        if action:
            updates.append('action = %s')
            params.append(action)
        
        if enabled is not None:
            updates.append('enabled = %s')
            params.append(enabled)
        
        if not updates:
            return False, "No updates provided"
        
        updates.append('updated_at = CURRENT_TIMESTAMP')
        params.append(rule_id)
        
        cur.execute(f'''
            UPDATE reconciliation_rules
            SET {', '.join(updates)}
            WHERE id = %s
        ''', params)
        
        conn.commit()
        conn.close()
        
        return True, "Rule updated successfully"
    
    except Exception as e:
        return False, f"Error updating rule: {str(e)}"

def delete_rule(rule_id):
    """Delete a rule"""
    try:
        conn = get_db_connection()
        if not conn:
            return False, "Database connection failed"
        
        cur = conn.cursor()
        
        cur.execute('DELETE FROM reconciliation_rules WHERE id = %s', (rule_id,))
        
        conn.commit()
        conn.close()
        
        return True, "Rule deleted successfully"
    
    except Exception as e:
        return False, f"Error deleting rule: {str(e)}"

def toggle_rule(rule_id, enabled):
    """Enable/disable a rule"""
    try:
        conn = get_db_connection()
        if not conn:
            return False, "Database connection failed"
        
        cur = conn.cursor()
        
        cur.execute('''
            UPDATE reconciliation_rules
            SET enabled = %s
            WHERE id = %s
        ''', (enabled, rule_id))
        
        conn.commit()
        conn.close()
        
        status = "enabled" if enabled else "disabled"
        return True, f"Rule {status} successfully"
    
    except Exception as e:
        return False, f"Error toggling rule: {str(e)}"

def get_rule_statistics(user_id):
    """Get statistics about rule usage"""
    try:
        conn = get_db_connection()
        if not conn:
            return {}
        
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute('''
            SELECT COUNT(*) as total_rules FROM reconciliation_rules WHERE user_id = %s
        ''', (user_id,))
        
        total_rules = cur.fetchone()['total_rules']
        
        cur.execute('''
            SELECT COUNT(*) as enabled_rules FROM reconciliation_rules 
            WHERE user_id = %s AND enabled = TRUE
        ''', (user_id,))
        
        enabled_rules = cur.fetchone()['enabled_rules']
        
        conn.close()
        
        return {
            'total_rules': total_rules,
            'enabled_rules': enabled_rules,
            'disabled_rules': total_rules - enabled_rules
        }
    
    except Exception as e:
        print(f"Error getting rule stats: {e}")
        return {}
