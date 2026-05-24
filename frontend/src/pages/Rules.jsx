import React, { useState, useEffect, useCallback } from 'react';
import API_URL from '../config.js';
import '../styles/Rules.css';

export default function Rules({ token, user }) {
  const [rules, setRules] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [stats, setStats] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    conditions: [],
    action: '',
    enabled: true
  });

  // Fetch all rules
  const fetchRules = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/rules`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch rules');
      const data = await response.json();
      setRules(data.rules || []);
      setError('');
    } catch (err) {
      setError(err.message);
      console.error('Error fetching rules:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Fetch templates
  const fetchTemplates = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/rules/templates`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch templates');
      const data = await response.json();
      setTemplates(data.templates || []);
    } catch (err) {
      console.error('Error fetching templates:', err);
    }
  }, [token]);

  // Fetch statistics
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/rules/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data.stats || {});
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, [token]);

  useEffect(() => {
    fetchRules();
    fetchTemplates();
    fetchStats();
  }, [fetchRules, fetchTemplates, fetchStats]);

  // Handle form input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Create or update rule
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.action.trim()) {
      setError('Name and action are required');
      return;
    }

    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId 
        ? `${API_URL}/api/rules/${editingId}`
        : `${API_URL}/api/rules`;

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to save rule');

      setFormData({ name: '', conditions: [], action: '', enabled: true });
      setEditingId(null);
      setShowForm(false);
      setError('');
      
      await fetchRules();
      await fetchStats();
    } catch (err) {
      setError(err.message);
      console.error('Error saving rule:', err);
    }
  };

  // Delete rule
  const handleDelete = async (ruleId) => {
    if (!window.confirm('Are you sure you want to delete this rule?')) return;

    try {
      const response = await fetch(`${API_URL}/api/rules/${ruleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to delete rule');
      
      await fetchRules();
      await fetchStats();
    } catch (err) {
      setError(err.message);
      console.error('Error deleting rule:', err);
    }
  };

  // Toggle rule enabled/disabled
  const handleToggle = async (ruleId, currentStatus) => {
    try {
      const response = await fetch(`${API_URL}/api/rules/${ruleId}/toggle`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ enabled: !currentStatus })
      });

      if (!response.ok) throw new Error('Failed to toggle rule');
      
      await fetchRules();
    } catch (err) {
      setError(err.message);
      console.error('Error toggling rule:', err);
    }
  };

  // Edit rule
  const handleEdit = (rule) => {
    setFormData({
      name: rule.name,
      conditions: rule.conditions || [],
      action: rule.action,
      enabled: rule.enabled
    });
    setEditingId(rule.id);
    setShowForm(true);
  };

  // Cancel form
  const handleCancel = () => {
    setFormData({ name: '', conditions: [], action: '', enabled: true });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="rules-loading">
        <div className="loading-spinner" />
        <p>Loading rules engine...</p>
      </div>
    );
  }

  return (
    <div className="rules-container">
      {/* Header */}
      <div className="rules-header">
        <div>
          <h2>🎯 Rules Engine</h2>
          <p>Create custom matching rules for your reconciliations</p>
        </div>
        <button 
          className="btn-create-rule"
          onClick={() => {
            setShowForm(!showForm);
            if (showForm) handleCancel();
          }}
        >
          {showForm ? '✕ Cancel' : '+ New Rule'}
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="error-banner">
          ⚠️ {error}
        </div>
      )}

      {/* Statistics */}
      {stats && (
        <div className="rules-stats">
          <div className="stat-card">
            <h4>Total Rules</h4>
            <div className="stat-value">{stats.total_rules || 0}</div>
          </div>
          <div className="stat-card">
            <h4>Active Rules</h4>
            <div className="stat-value">{stats.active_rules || 0}</div>
          </div>
          <div className="stat-card">
            <h4>Matches Applied</h4>
            <div className="stat-value">{stats.total_matches_applied || 0}</div>
          </div>
          <div className="stat-card">
            <h4>Success Rate</h4>
            <div className="stat-value">{stats.average_success_rate ? `${stats.average_success_rate.toFixed(1)}%` : '0%'}</div>
          </div>
        </div>
      )}

      {/* Create Rule Form */}
      {showForm && (
        <div className="rule-form-section">
          <h3>{editingId ? '✏️ Edit Rule' : '✨ Create New Rule'}</h3>
          <form onSubmit={handleSubmit} className="rule-form">
            <div className="form-group">
              <label>Rule Name *</label>
              <input
                type="text"
                name="name"
                placeholder="e.g., Amount Match Within $10"
                value={formData.name}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Matching Action *</label>
              <textarea
                name="action"
                placeholder="e.g., Match if amount difference is less than $10 AND date is within 3 days"
                value={formData.action}
                onChange={handleInputChange}
                className="form-input"
                rows="3"
              />
            </div>

            <div className="form-group checkbox">
              <input
                type="checkbox"
                id="enabled"
                name="enabled"
                checked={formData.enabled}
                onChange={(e) => setFormData(prev => ({ ...prev, enabled: e.target.checked }))}
              />
              <label htmlFor="enabled">Enable this rule</label>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-submit">
                {editingId ? '💾 Update Rule' : '✨ Create Rule'}
              </button>
              <button type="button" className="btn-cancel" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Template Guide */}
      {templates.length > 0 && (
        <div className="templates-section">
          <h3>📋 Rule Templates (Click to Use)</h3>
          <div className="templates-grid">
            {templates.map((template, idx) => (
              <div key={idx} className="template-card">
                <h4>{template.name}</h4>
                <p>{template.description}</p>
                <button
                  className="btn-use-template"
                  onClick={() => {
                    setFormData({
                      name: template.name,
                      conditions: template.conditions || [],
                      action: template.action,
                      enabled: true
                    });
                    setShowForm(true);
                  }}
                >
                  Use Template →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rules List */}
      <div className="rules-list-section">
        <h3>📜 Your Rules ({rules.length})</h3>

        {rules.length > 0 ? (
          <div className="rules-list">
            {rules.map((rule) => (
              <div key={rule.id} className={`rule-card ${rule.enabled ? 'active' : 'inactive'}`}>
                <div className="rule-header">
                  <div className="rule-title">
                    <div className="rule-status">
                      {rule.enabled ? '✅' : '⭕'}
                    </div>
                    <div>
                      <h4>{rule.name}</h4>
                      <p className="rule-action">{rule.action}</p>
                    </div>
                  </div>
                  <div className="rule-actions">
                    <button
                      className={`btn-toggle ${rule.enabled ? 'enabled' : 'disabled'}`}
                      onClick={() => handleToggle(rule.id, rule.enabled)}
                      title={rule.enabled ? 'Disable rule' : 'Enable rule'}
                    >
                      {rule.enabled ? '🔴 Disable' : '🟢 Enable'}
                    </button>
                    <button
                      className="btn-edit"
                      onClick={() => handleEdit(rule)}
                      title="Edit rule"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(rule.id)}
                      title="Delete rule"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>📋 No rules created yet</p>
            <p className="subtitle">Create a rule to start automating your matching process</p>
            <button 
              className="btn-create-rule"
              onClick={() => setShowForm(true)}
            >
              + Create First Rule
            </button>
          </div>
        )}
      </div>

      {/* Help Section */}
      <div className="help-section">
        <h3>❓ How Rules Work</h3>
        <div className="help-content">
          <div className="help-item">
            <h4>📌 Matching Actions</h4>
            <p>Define logic like: "Match if amount is within $10 AND date is within 3 days"</p>
          </div>
          <div className="help-item">
            <h4>🎯 Rule Priority</h4>
            <p>Rules are applied in order. More specific rules should come first.</p>
          </div>
          <div className="help-item">
            <h4>✅ Enable/Disable</h4>
            <p>Toggle rules on and off without deleting them. Useful for testing.</p>
          </div>
          <div className="help-item">
            <h4>📊 Statistics</h4>
            <p>Monitor how many matches each rule applies and track success rates.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
