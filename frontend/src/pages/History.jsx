import API_URL from '../config.js';
import React, { useState, useEffect } from 'react';
import '../styles/History.css';

export default function History() {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionMatches, setSessionMatches] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Load all sessions on mount
  useEffect(() => {
    loadSessions();
    loadStats();
  }, []);

  const loadSessions = async () => {
    setLoading(true);
    try {
      // For now, use demo data
      setSessions([
        {
          id: 1,
          name: 'January 2024 Reconciliation',
          bank_count: 50,
          erp_count: 50,
          matched_count: 48,
          match_rate: 96,
          average_confidence: 92.5,
          created_at: '2024-01-31T16:30:00'
        },
        {
          id: 2,
          name: 'December 2023 Month-End',
          bank_count: 45,
          erp_count: 45,
          matched_count: 42,
          match_rate: 93.3,
          average_confidence: 89.2,
          created_at: '2023-12-31T18:00:00'
        }
      ]);
    } catch (err) {
      console.error('Error loading sessions:', err);
    }
    setLoading(false);
  };

  const loadStats = async () => {
    try {
      // For now, use demo data
      setStats({
        total_sessions: 12,
        total_transactions: 850,
        total_matches: 810,
        confirmed_matches: 800,
        average_match_rate: 95.3,
        average_confidence: 90.8,
        best_session: {
          name: 'January 2024 Reconciliation',
          match_rate: 96
        }
      });
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const handleSessionClick = (session) => {
    setSelectedSession(session);
    loadSessionMatches(session.id);
  };

  const loadSessionMatches = async (sessionId) => {
    try {
      // For now, use demo data
      setSessionMatches([
        {
          id: 1,
          bank_amount: 1000,
          bank_desc: 'ABC Corp Payment',
          erp_amount: 1000,
          erp_desc: 'Invoice ABC',
          confidence: 95.2,
          status: 'confirmed'
        }
      ]);
    } catch (err) {
      console.error('Error loading matches:', err);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery) {
      loadSessions();
      return;
    }
    // Implement search if needed
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="history-container">
      <header className="history-header">
        <h1>📊 Reconciliation History</h1>
        <p>View past reconciliations and analytics</p>
      </header>

      <main className="history-main">
        {/* Overall Statistics */}
        {stats && (
          <section className="stats-overview">
            <h2>Overall Statistics</h2>
            <div className="stats-grid">
              <div className="stat-box">
                <p className="stat-label">Total Sessions</p>
                <p className="stat-number">{stats.total_sessions}</p>
              </div>
              <div className="stat-box">
                <p className="stat-label">Total Transactions</p>
                <p className="stat-number">{stats.total_transactions}</p>
              </div>
              <div className="stat-box">
                <p className="stat-label">Total Matches</p>
                <p className="stat-number">{stats.total_matches}</p>
              </div>
              <div className="stat-box">
                <p className="stat-label">Avg Match Rate</p>
                <p className="stat-number">{stats.average_match_rate}%</p>
              </div>
              <div className="stat-box">
                <p className="stat-label">Avg Confidence</p>
                <p className="stat-number">{stats.average_confidence}%</p>
              </div>
              <div className="stat-box best">
                <p className="stat-label">Best Session</p>
                <p className="stat-number">{stats.best_session?.match_rate}%</p>
                <p className="stat-sublabel">{stats.best_session?.name}</p>
              </div>
            </div>
          </section>
        )}

        {/* Search Bar */}
        <section className="search-section">
          <input
            type="text"
            placeholder="Search sessions by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch} className="search-btn">
            🔍 Search
          </button>
        </section>

        <div className="history-content">
          {/* Sessions List */}
          <section className="sessions-list">
            <h2>Reconciliation Sessions</h2>
            
            {loading ? (
              <p className="loading">Loading sessions...</p>
            ) : sessions.length > 0 ? (
              <div className="sessions-container">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`session-card ${selectedSession?.id === session.id ? 'active' : ''}`}
                    onClick={() => handleSessionClick(session)}
                  >
                    <div className="session-header">
                      <h3>{session.name}</h3>
                      <span className="session-date">{formatDate(session.created_at)}</span>
                    </div>
                    
                    <div className="session-stats">
                      <div className="stat">
                        <span className="label">Bank:</span>
                        <span className="value">{session.bank_count}</span>
                      </div>
                      <div className="stat">
                        <span className="label">ERP:</span>
                        <span className="value">{session.erp_count}</span>
                      </div>
                      <div className="stat">
                        <span className="label">Matched:</span>
                        <span className="value">{session.matched_count}</span>
                      </div>
                    </div>
                    
                    <div className="session-metrics">
                      <div className="metric">
                        <span className="metric-label">Match Rate</span>
                        <span className={`metric-value ${session.match_rate >= 95 ? 'high' : 'medium'}`}>
                          {session.match_rate}%
                        </span>
                      </div>
                      <div className="metric">
                        <span className="metric-label">Avg Confidence</span>
                        <span className={`metric-value ${session.average_confidence >= 90 ? 'high' : 'medium'}`}>
                          {session.average_confidence}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-sessions">No reconciliation sessions found</p>
            )}
          </section>

          {/* Session Details */}
          {selectedSession && (
            <section className="session-details">
              <h2>Session Details: {selectedSession.name}</h2>
              
              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">Date</span>
                  <span className="detail-value">{formatDate(selectedSession.created_at)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Bank Transactions</span>
                  <span className="detail-value">{selectedSession.bank_count}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">ERP Transactions</span>
                  <span className="detail-value">{selectedSession.erp_count}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Matched</span>
                  <span className="detail-value">{selectedSession.matched_count}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Unmatched</span>
                  <span className="detail-value">
                    {selectedSession.bank_count + selectedSession.erp_count - (selectedSession.matched_count * 2)}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Match Rate</span>
                  <span className="detail-value">{selectedSession.match_rate}%</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Avg Confidence</span>
                  <span className="detail-value">{selectedSession.average_confidence}%</span>
                </div>
              </div>

              {/* Matches Table */}
              {sessionMatches.length > 0 && (
                <div className="matches-table-container">
                  <h3>Matches ({sessionMatches.length})</h3>
                  <table className="matches-table">
                    <thead>
                      <tr>
                        <th>Bank Amount</th>
                        <th>Bank Description</th>
                        <th>ERP Amount</th>
                        <th>ERP Description</th>
                        <th>Confidence</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessionMatches.slice(0, 10).map((match) => (
                        <tr key={match.id}>
                          <td>${match.bank_amount.toFixed(2)}</td>
                          <td>{match.bank_desc}</td>
                          <td>${match.erp_amount.toFixed(2)}</td>
                          <td>{match.erp_desc}</td>
                          <td>
                            <span className={`confidence-badge ${match.confidence >= 90 ? 'high' : 'medium'}`}>
                              {match.confidence}%
                            </span>
                          </td>
                          <td>
                            <span className={`status-badge ${match.status}`}>
                              {match.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
