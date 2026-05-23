import API_URL from '../config.js';
import React, { useState, useEffect } from 'react';
import '../styles/RulesBuilder.css';

export default function RulesBuilder() {
  const [rules, setRules] = useState([]);
  const [templates, setTemplates] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    action: 'auto_match',
    conditions: []
  });

  useEffect(() => {
    loadRules();
    loadTemplates();
  }, []);

  const loadRules = async () => {
    setLoading(true);
    try {
      // Demo data
      setRules([
        {
          id: 1,
          name: 'Exact Amount Match',
          action: 'auto_match',
          enabled: true,
          conditions: [{ field: 'bank_amount', operator: '==', value: 'erp_amount' }]
        },
        {
          id: 2,
          name: 'Large Transaction Review',
          action: 'flag_review',
          enabled: true,
          conditions: [{ field: 'bank_amount', operator: '>', value: '10000' }]
        }
      ]);
    } catch (err) {
      console.error('Error loading rules:', err);
    }
    setLoading(false);
  };

  const loadTemplates = async () => {
    try {
      // Demo templates
      setTemplates({
        'exact_amount_match': {
          name: 'Exact Amount Match',
          description: 'Auto-match when amounts are exactly equal'
        },
        'within_tolerance': {
          name: 'Amount Within Tolerance',
          description: 'Auto-match when difference is less than $1'
        },
        'payroll_invoice': {
          name: 'Payroll Matching',
          description: 'Auto-match payroll descriptions'
        }
      });
    } catch (err) {
      console.error('Error loading templates:', err);
    }
  };

  const handleAddCondition = () => {
    setFormData({
      ...formData,
      conditions: [...formData.conditions, { field: 'bank_amount', operator: '==', value: '' }]
    });
  };

  const handleRemoveCondition = (index) => {
    setFormData({
      ...formData,
      conditions: formData.conditions.filter((_, i) => i !== index)
    });
  };

  const handleConditionChange = (index, key, value) => {
    const newConditions = [...formData.conditions];
    newConditions[index][key] = value;
    setFormData({ ...formData, conditions: newConditions });
  };

  const handleSaveRule = async () => {
    if (!formData.name) {
      alert('Please enter a rule name');
      return;
    }

    try {
      // Add to rules for demo
      if (editingRule) {
        setRules(rules.map(r => r.id === editingRule.id ? { ...formData, id: editingRule.id } : r));
      } else {
        setRules([...rules, { ...formData, id: Math.max(...rules.map(r => r.id), 0) + 1, enabled: true }]);
      }

      // Reset form
      setFormData({ name: '', action: 'auto_match', conditions: [] });
      setEditingRule(null);
      setShowForm(false);
    } catch (err) {
      alert('Error saving rule: ' + err.message);
    }
  };

  const handleDeleteRule = (ruleId) => {
    setRules(rules.filter(r => r.id !== ruleId));
  };

  const handleToggleRule = (ruleId) => {
    setRules(rules.map(r => 
      r.id === ruleId ? { ...r, enabled: !r.enabled } : r
    ));
  };

  const applyTemplate = (templateKey) => {
    const template = templates[templateKey];
    setFormData({
      name: template.name,
      action: 'auto_match',
      conditions: []
    });
  };

  return (
    <div className="rules-builder-container">
      <header className="rules-header">
        <h1>⚙️ Reconciliation Rules</h1>
        <p>Create custom matching rules to automate reconciliation</p>
      </header>

      <main className="rules-main">
        {/* Rules List */}
        <section className="rules-list-section">
          <div className="section-header">
            <h2>Your Rules ({rules.length})</h2>
            <button onClick={() => setShowForm(true)} className="btn btn-primary">
              + Create Rule
            </button>
          </div>

          {rules.length > 0 ? (
            <div className="rules-list">
              {rules.map(rule => (
                <div key={rule.id} className={`rule-card ${rule.enabled ? 'enabled' : 'disabled'}`}>
                  <div className="rule-header">
                    <h3>{rule.name}</h3>
                    <span className={`action-badge action-${rule.action}`}>
                      {rule.action === 'auto_match' ? '✓ Auto Match' : 
                       rule.action === 'flag_review' ? '⚠ Flag Review' : 
                       '⊘ Skip'}
                    </span>
                  </div>

                  <div className="rule-conditions">
                    <p className="label">Conditions:</p>
                    {rule.conditions.length > 0 ? (
                      <ul>
                        {rule.conditions.map((cond, idx) => (
                          <li key={idx}>
                            {cond.field} {cond.operator} {cond.value}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="empty">No conditions set</p>
                    )}
                  </div>

                  <div className="rule-actions">
                    <button
                      onClick={() => {
                        setEditingRule(rule);
                        setFormData(rule);
                        setShowForm(true);
                      }}
                      className="btn-small btn-edit"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleRule(rule.id)}
                      className={`btn-small ${rule.enabled ? 'btn-disable' : 'btn-enable'}`}
                    >
                      {rule.enabled ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="btn-small btn-delete"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-rules">No rules created yet. Create your first rule to get started!</p>
          )}
        </section>

        {/* Rule Form */}
        {showForm && (
          <section className="rule-form-section">
            <h2>{editingRule ? 'Edit Rule' : 'Create New Rule'}</h2>

            <div className="form-group">
              <label htmlFor="rule-name">Rule Name</label>
              <input
                id="rule-name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Exact Amount Match"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="rule-action">Action</label>
              <select
                id="rule-action"
                value={formData.action}
                onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                className="form-select"
              >
                <option value="auto_match">Auto Match</option>
                <option value="flag_review">Flag for Review</option>
                <option value="skip">Skip</option>
              </select>
            </div>

            <div className="form-group">
              <label>Conditions</label>
              <div className="conditions-list">
                {formData.conditions.map((cond, idx) => (
                  <div key={idx} className="condition-row">
                    <select
                      value={cond.field}
                      onChange={(e) => handleConditionChange(idx, 'field', e.target.value)}
                      className="condition-select"
                    >
                      <option value="bank_amount">Bank Amount</option>
                      <option value="bank_desc">Bank Description</option>
                      <option value="erp_amount">ERP Amount</option>
                      <option value="erp_desc">ERP Description</option>
                      <option value="amount_diff">Amount Difference</option>
                      <option value="date_diff">Date Difference</option>
                    </select>

                    <select
                      value={cond.operator}
                      onChange={(e) => handleConditionChange(idx, 'operator', e.target.value)}
                      className="condition-select"
                    >
                      <option value="==">Equals</option>
                      <option value="!=">Not Equals</option>
                      <option value=">">Greater Than</option>
                      <option value="<">Less Than</option>
                      <option value="contains">Contains</option>
                      <option value="starts_with">Starts With</option>
                    </select>

                    <input
                      type="text"
                      value={cond.value}
                      onChange={(e) => handleConditionChange(idx, 'value', e.target.value)}
                      placeholder="Value"
                      className="condition-input"
                    />

                    <button
                      onClick={() => handleRemoveCondition(idx)}
                      className="btn-small btn-delete"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <button onClick={handleAddCondition} className="btn btn-secondary">
                + Add Condition
              </button>
            </div>

            <div className="form-actions">
              <button onClick={handleSaveRule} className="btn btn-primary">
                {editingRule ? 'Update Rule' : 'Create Rule'}
              </button>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingRule(null);
                  setFormData({ name: '', action: 'auto_match', conditions: [] });
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </section>
        )}

        {/* Templates */}
        <section className="templates-section">
          <h2>Rule Templates</h2>
          <p className="section-description">Quick start with pre-built rules</p>

          <div className="templates-grid">
            {Object.entries(templates).map(([key, template]) => (
              <div key={key} className="template-card">
                <h3>{template.name}</h3>
                <p>{template.description}</p>
                <button
                  onClick={() => applyTemplate(key)}
                  className="btn btn-secondary"
                >
                  Use Template
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
