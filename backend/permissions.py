from functools import wraps
from flask import request, jsonify

# Define roles and their permissions
ROLES = {
    'admin': {
        'manage_users': True,
        'view_all_sessions': True,
        'delete_sessions': True,
        'view_analytics': True,
        'manage_team': True,
        'run_reconciliation': True,
        'view_own_sessions': True,
        'edit_own_profile': True
    },
    'analyst': {
        'manage_users': False,
        'view_all_sessions': True,
        'delete_sessions': False,
        'view_analytics': True,
        'manage_team': False,
        'run_reconciliation': True,
        'view_own_sessions': True,
        'edit_own_profile': True
    },
    'user': {
        'manage_users': False,
        'view_all_sessions': False,
        'delete_sessions': False,
        'view_analytics': False,
        'manage_team': False,
        'run_reconciliation': True,
        'view_own_sessions': True,
        'edit_own_profile': True
    }
}

def has_permission(permission):
    """Decorator to check if user has specific permission"""
    def decorator(f):
        def decorated_function(*args, **kwargs):
            # Check if user is authenticated
            if not hasattr(request, 'user'):
                return jsonify({'error': 'Authentication required'}), 401
            
            user = request.user
            user_role = user.get('role', 'user')
            
            # Get role permissions
            role_permissions = ROLES.get(user_role, {})
            
            # Check permission
            if not role_permissions.get(permission, False):
                return jsonify({
                    'error': 'Permission denied',
                    'message': f'Your role ({user_role}) does not have permission to {permission}'
                }), 403
            
            return f(*args, **kwargs)
        
        decorated_function.__name__ = f.__name__
        return decorated_function
    
    return decorator

def get_user_permissions(user_role):
    """Get all permissions for a role"""
    return ROLES.get(user_role, {})

def can_access_session(user, session_creator_id):
    """Check if user can access a session"""
    user_role = user.get('role', 'user')
    user_id = user.get('id')
    
    if user_role == 'admin':
        return True
    
    if user_role == 'analyst':
        return True
    
    # Regular users can only see their own sessions
    return user_id == session_creator_id

def grant_permission(user_id, permission):
    """Grant permission to user (for advanced features)"""
    # TODO: Implement custom permissions in database
    pass

def revoke_permission(user_id, permission):
    """Revoke permission from user"""
    # TODO: Implement custom permissions in database
    pass
