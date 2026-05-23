import API_URL from '../config.js';
import React, { useState, useEffect } from 'react';
import '../styles/Admin.css';

export default function Admin({ user }) {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [newRole, setNewRole] = useState('');

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      // Demo data
      setStats({
        total_users: 24,
        active_users: 22,
        admin_count: 2,
        analyst_count: 8,
        total_sessions: 156,
        total_transactions: 12450,
        average_match_rate: 94.2
      });

      setUsers([
        {
          id: 1,
          email: 'admin@example.com',
          name: 'Admin User',
          role: 'admin',
          active: true,
          created_at: '2024-01-01T10:00:00'
        },
        {
          id: 2,
          email: 'analyst@example.com',
          name: 'Analyst User',
          role: 'analyst',
          active: true,
          created_at: '2024-01-05T10:00:00'
        },
        {
          id: 3,
          email: 'user@example.com',
          name: 'Regular User',
          role: 'user',
          active: true,
          created_at: '2024-01-10T10:00:00'
        }
      ]);
    } catch (err) {
      console.error('Error loading admin data:', err);
    }
    setLoading(false);
  };

  const handleUpdateRole = async (userId, role) => {
    try {
      // Update in state for demo
      setUsers(users.map(u => 
        u.id === userId ? { ...u, role } : u
      ));
      setEditingUserId(null);
    } catch (err) {
      console.error('Error updating role:', err);
    }
  };

  const handleToggleActive = async (userId, active) => {
    try {
      // Update in state for demo
      setUsers(users.map(u => 
        u.id === userId ? { ...u, active: !u.active } : u
      ));
    } catch (err) {
      console.error('Error toggling user:', err);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>⚙️ Admin Panel</h1>
        <p>Manage users, roles, and system statistics</p>
      </header>

      <main className="admin-main">
        {/* Dashboard Stats */}
        {stats && (
          <section className="dashboard-stats">
            <h2>System Overview</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <p className="stat-label">Total Users</p>
                <p className="stat-number">{stats.total_users}</p>
              </div>
              <div className="stat-card">
                <p className="stat-label">Active Users</p>
                <p className="stat-number">{stats.active_users}</p>
              </div>
              <div className="stat-card">
                <p className="stat-label">Admins</p>
                <p className="stat-number">{stats.admin_count}</p>
              </div>
              <div className="stat-card">
                <p className="stat-label">Analysts</p>
                <p className="stat-number">{stats.analyst_count}</p>
              </div>
              <div className="stat-card">
                <p className="stat-label">Total Sessions</p>
                <p className="stat-number">{stats.total_sessions}</p>
              </div>
              <div className="stat-card">
                <p className="stat-label">Avg Match Rate</p>
                <p className="stat-number">{stats.average_match_rate}%</p>
              </div>
            </div>
          </section>
        )}

        {/* Users Management */}
        <section className="users-management">
          <h2>User Management</h2>
          
          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className={u.active ? '' : 'inactive'}>
                    <td>{u.email}</td>
                    <td>{u.name}</td>
                    <td>
                      {editingUserId === u.id ? (
                        <select
                          value={newRole || u.role}
                          onChange={(e) => setNewRole(e.target.value)}
                          className="role-select"
                        >
                          <option value="user">User</option>
                          <option value="analyst">Analyst</option>
                          <option value="admin">Admin</option>
                        </select>
                      ) : (
                        <span className={`role-badge role-${u.role}`}>
                          {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={`status-badge ${u.active ? 'active' : 'inactive'}`}>
                        {u.active ? '✓ Active' : '✗ Inactive'}
                      </span>
                    </td>
                    <td>{formatDate(u.created_at)}</td>
                    <td className="actions">
                      {editingUserId === u.id ? (
                        <>
                          <button
                            onClick={() => handleUpdateRole(u.id, newRole || u.role)}
                            className="btn-small btn-save"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingUserId(null)}
                            className="btn-small btn-cancel"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setEditingUserId(u.id);
                              setNewRole(u.role);
                            }}
                            className="btn-small btn-edit"
                          >
                            Edit Role
                          </button>
                          <button
                            onClick={() => handleToggleActive(u.id, u.active)}
                            className={`btn-small ${u.active ? 'btn-disable' : 'btn-enable'}`}
                          >
                            {u.active ? 'Disable' : 'Enable'}
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Role Information */}
        <section className="role-info">
          <h2>Role Permissions</h2>
          <div className="roles-grid">
            <div className="role-card">
              <h3>👤 User</h3>
              <ul>
                <li>✓ Run reconciliation</li>
                <li>✓ View own sessions</li>
                <li>✓ Edit own profile</li>
                <li>✗ View other sessions</li>
                <li>✗ Manage users</li>
              </ul>
            </div>

            <div className="role-card">
              <h3>📊 Analyst</h3>
              <ul>
                <li>✓ Run reconciliation</li>
                <li>✓ View all sessions</li>
                <li>✓ View analytics</li>
                <li>✓ Edit own profile</li>
                <li>✗ Manage users</li>
              </ul>
            </div>

            <div className="role-card">
              <h3>⚙️ Admin</h3>
              <ul>
                <li>✓ Full system access</li>
                <li>✓ Manage users</li>
                <li>✓ View all data</li>
                <li>✓ View analytics</li>
                <li>✓ Delete sessions</li>
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
