import React, { useState, useEffect, useCallback } from 'react';
import API_URL from '../config.js';
import '../styles/Dashboard.css';

export default function Dashboard({ token, user }) {
  const [metrics, setMetrics] = useState({
    totalSessions: 0,
    totalMatches: 0,
    totalUnmatched: 0,
    overallMatchRate: 0,
    avgConfidence: 0,
    recentSessions: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardMetrics = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/dashboard/metrics`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch metrics');
      }

      const data = await response.json();
      setMetrics(data);
      setError('');
    } catch (err) {
      setError(err.message);
      console.error('Error fetching metrics:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchDashboardMetrics();
  }, [fetchDashboardMetrics]);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner" />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <h2>Dashboard Overview</h2>
        <button className="btn-refresh" onClick={fetchDashboardMetrics} title="Refresh metrics">
          🔄 Refresh
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-banner">
          ⚠️ {error}
        </div>
      )}

      {/* Key Metrics Grid */}
      <div className="metrics-grid">
        {/* Total Reconciliations */}
        <div className="metric-card">
          <div className="metric-header">
            <h3>Total Reconciliations</h3>
            <span className="metric-icon">🔄</span>
          </div>
          <div className="metric-value">{metrics.totalSessions}</div>
          <div className="metric-subtitle">Sessions completed</div>
        </div>

        {/* Overall Match Rate */}
        <div className="metric-card highlight">
          <div className="metric-header">
            <h3>Match Rate</h3>
            <span className="metric-icon">✅</span>
          </div>
          <div className="metric-value">{metrics.overallMatchRate.toFixed(1)}%</div>
          <div className="metric-subtitle">Success rate</div>
          <div className="metric-bar">
            <div 
              className="metric-bar-fill" 
              style={{ width: `${metrics.overallMatchRate}%` }}
            />
          </div>
        </div>

        {/* Average Confidence */}
        <div className="metric-card">
          <div className="metric-header">
            <h3>Avg Confidence</h3>
            <span className="metric-icon">🎯</span>
          </div>
          <div className="metric-value">{metrics.avgConfidence.toFixed(1)}%</div>
          <div className="metric-subtitle">Match confidence</div>
        </div>

        {/* Total Matched */}
        <div className="metric-card success">
          <div className="metric-header">
            <h3>Matched</h3>
            <span className="metric-icon">✔️</span>
          </div>
          <div className="metric-value">{metrics.totalMatches}</div>
          <div className="metric-subtitle">Successful matches</div>
        </div>

        {/* Total Unmatched */}
        <div className="metric-card warning">
          <div className="metric-header">
            <h3>Unmatched</h3>
            <span className="metric-icon">❌</span>
          </div>
          <div className="metric-value">{metrics.totalUnmatched}</div>
          <div className="metric-subtitle">Pending review</div>
        </div>

        {/* Match/Unmatch Ratio */}
        <div className="metric-card">
          <div className="metric-header">
            <h3>Ratio</h3>
            <span className="metric-icon">📊</span>
          </div>
          <div className="metric-value">
            {metrics.totalMatches}:{metrics.totalUnmatched}
          </div>
          <div className="metric-subtitle">Matched to Unmatched</div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="recent-activity-section">
        <div className="section-header">
          <h3>📜 Recent Reconciliations</h3>
          <span className="section-count">{metrics.recentSessions.length} recent</span>
        </div>

        {metrics.recentSessions.length > 0 ? (
          <div className="activity-table">
            <div className="table-header">
              <div className="table-col col-date">Date</div>
              <div className="table-col col-name">Session Name</div>
              <div className="table-col col-stats">Matches</div>
              <div className="table-col col-rate">Match Rate</div>
              <div className="table-col col-confidence">Confidence</div>
              <div className="table-col col-action">Action</div>
            </div>

            {metrics.recentSessions.map((session, idx) => (
              <div key={idx} className="table-row">
                <div className="table-col col-date">
                  {new Date(session.created_at).toLocaleDateString()}
                </div>
                <div className="table-col col-name">
                  {session.session_name || 'Unnamed'}
                </div>
                <div className="table-col col-stats">
                  <span className="badge success">{session.total_matched}</span>
                  <span className="badge">{session.total_unmatched}</span>
                </div>
                <div className="table-col col-rate">
                  {session.match_rate.toFixed(1)}%
                </div>
                <div className="table-col col-confidence">
                  {session.avg_confidence.toFixed(1)}%
                </div>
                <div className="table-col col-action">
                  <button className="btn-view" title="View details">
                    👁️
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>📊 No reconciliations yet</p>
            <p className="subtitle">Start a reconciliation to see activity here</p>
          </div>
        )}
      </div>

      {/* Stats Summary */}
      <div className="stats-summary">
        <div className="summary-card">
          <h4>🎯 Performance</h4>
          <p>Your reconciliation system is operating at <strong>{metrics.overallMatchRate.toFixed(1)}%</strong> efficiency</p>
        </div>
        <div className="summary-card">
          <h4>💡 Insight</h4>
          <p>Average match confidence is <strong>{metrics.avgConfidence.toFixed(1)}%</strong>, indicating good matching quality</p>
        </div>
      </div>
    </div>
  );
}
