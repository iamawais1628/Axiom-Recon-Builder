import React, { useState, useEffect } from 'react';
import API_URL from '../config.js';
import '../styles/History.css';

export default function History({ token, user }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedSession, setSelectedSession] = useState(null);

  // Fetch sessions from dashboard stats (we know this works!)
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        setError('');

        // Use the same endpoint that Dashboard uses
        const response = await fetch(`${API_URL}/api/admin/dashboard/stats`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: Failed to fetch sessions`);
        }

        const data = await response.json();
        
        // Extract sessions from the response
        const sessionsData = data.recentSessions || [];
        setSessions(sessionsData);

        if (sessionsData.length === 0) {
          setError('No reconciliation sessions found');
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError(`Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchSessions();
    }
  }, [token]);

  // Filter sessions
  const filteredSessions = sessions.filter(session => {
    const matchesSearch = 
      session.session_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === 'high') {
      return matchesSearch && session.match_rate >= 75;
    } else if (filterType === 'low') {
      return matchesSearch && session.match_rate < 75;
    }
    return matchesSearch;
  });

  // Calculate average match rate
  const avgMatchRate = sessions.length > 0 
    ? (sessions.reduce((sum, s) => sum + (s.match_rate || 0), 0) / sessions.length).toFixed(1)
    : 0;

  if (loading) {
    return (
      <div className="history-loading">
        <div className="loading-spinner" />
        <p>Loading history...</p>
      </div>
    );
  }

  return (
    <div className="history-container">
      {/* Header */}
      <div className="history-header">
        <div>
          <h2>📜 Reconciliation History</h2>
          <p>View all your past reconciliation sessions</p>
        </div>
        <div className="header-stats">
          <div className="stat">
            <div className="stat-label">Total Sessions</div>
            <div className="stat-value">{sessions.length}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Avg Match Rate</div>
            <div className="stat-value">{avgMatchRate}%</div>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && !sessions.length && (
        <div className="error-banner">
          ⚠️ {error}
        </div>
      )}

      {/* Search and Filter */}
      {sessions.length > 0 && (
        <div className="history-controls">
          <div className="search-box">
            <input
              type="text"
              placeholder="🔍 Search sessions by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-tabs">
            <button
              className={`filter-tab ${filterType === 'all' ? 'active' : ''}`}
              onClick={() => setFilterType('all')}
            >
              All ({sessions.length})
            </button>
            <button
              className={`filter-tab ${filterType === 'high' ? 'active' : ''}`}
              onClick={() => setFilterType('high')}
            >
              High Match (75%+)
            </button>
            <button
              className={`filter-tab ${filterType === 'low' ? 'active' : ''}`}
              onClick={() => setFilterType('low')}
            >
              Low Match (&lt;75%)
            </button>
          </div>
        </div>
      )}

      {/* Sessions List */}
      <div className="history-content">
        {filteredSessions.length > 0 ? (
          <div className="sessions-table">
            <div className="table-header">
              <div className="col col-date">Date</div>
              <div className="col col-name">Session Name</div>
              <div className="col col-stats">Matched / Unmatched</div>
              <div className="col col-rate">Match Rate</div>
              <div className="col col-confidence">Confidence</div>
              <div className="col col-action">Action</div>
            </div>

            {filteredSessions.map((session) => (
              <div 
                key={session.id} 
                className={`table-row ${selectedSession?.id === session.id ? 'selected' : ''}`}
                onClick={() => setSelectedSession(session)}
              >
                <div className="col col-date">
                  {new Date(session.created_at).toLocaleDateString()}
                </div>
                <div className="col col-name">
                  <span className="session-name">{session.session_name || 'Unnamed'}</span>
                </div>
                <div className="col col-stats">
                  <span className="badge success">{session.total_matched}</span>
                  <span className="badge">{session.total_unmatched}</span>
                </div>
                <div className="col col-rate">
                  <div className="rate-bar">
                    <div 
                      className={`rate-fill ${session.match_rate >= 75 ? 'high' : 'low'}`}
                      style={{ width: `${Math.min(session.match_rate, 100)}%` }}
                    />
                  </div>
                  <span className="rate-text">{session.match_rate?.toFixed(1)}%</span>
                </div>
                <div className="col col-confidence">
                  {session.avg_confidence?.toFixed(1)}%
                </div>
                <div className="col col-action">
                  <button 
                    className="btn-view"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSession(session);
                    }}
                  >
                    👁️ View
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>📋 No sessions found</p>
            <p className="subtitle">
              {searchTerm 
                ? 'Try a different search term' 
                : 'Start a reconciliation to see history here'}
            </p>
          </div>
        )}
      </div>

      {/* Session Details Panel */}
      {selectedSession && (
        <div className="details-panel">
          <div className="details-header">
            <h3>📊 Session Details</h3>
            <button 
              className="btn-close" 
              onClick={() => setSelectedSession(null)}
            >
              ✕
            </button>
          </div>

          <div className="details-content">
            {/* Session Info */}
            <div className="detail-section">
              <h4>Session Information</h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="label">Session Name</span>
                  <span className="value">{selectedSession.session_name || 'Unnamed'}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Created</span>
                  <span className="value">{new Date(selectedSession.created_at).toLocaleString()}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Total Matched</span>
                  <span className="value">{selectedSession.total_matched}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Total Unmatched</span>
                  <span className="value">{selectedSession.total_unmatched}</span>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="detail-section">
              <h4>Performance Metrics</h4>
              <div className="metrics-display">
                <div className="metric">
                  <div className="metric-label">Match Rate</div>
                  <div className="metric-bar">
                    <div 
                      className={`metric-fill ${selectedSession.match_rate >= 75 ? 'high' : 'low'}`}
                      style={{ width: `${Math.min(selectedSession.match_rate, 100)}%` }}
                    />
                  </div>
                  <div className="metric-value">{selectedSession.match_rate?.toFixed(1)}%</div>
                </div>
                <div className="metric">
                  <div className="metric-label">Avg Confidence</div>
                  <div className="metric-bar">
                    <div 
                      className="metric-fill"
                      style={{ width: `${Math.min(selectedSession.avg_confidence, 100)}%` }}
                    />
                  </div>
                  <div className="metric-value">{selectedSession.avg_confidence?.toFixed(1)}%</div>
                </div>
              </div>
            </div>

            {/* Match Ratio */}
            <div className="detail-section">
              <h4>Match Ratio</h4>
              <div className="ratio-display">
                <div className="ratio-item">
                  <span className="ratio-label">Matched</span>
                  <span className="ratio-value">{selectedSession.total_matched}</span>
                </div>
                <span className="ratio-separator">:</span>
                <div className="ratio-item">
                  <span className="ratio-label">Unmatched</span>
                  <span className="ratio-value">{selectedSession.total_unmatched}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Summary */}
      {sessions.length > 0 && (
        <div className="history-summary">
          <div className="summary-card">
            <h4>📈 Performance</h4>
            <p>Your average match rate is <strong>{avgMatchRate}%</strong></p>
          </div>
          <div className="summary-card">
            <h4>💡 Insight</h4>
            <p>You have <strong>{sessions.length}</strong> reconciliation sessions in your history</p>
          </div>
        </div>
      )}
    </div>
  );
}
