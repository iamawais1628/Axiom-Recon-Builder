import React, { useState } from 'react';
import '../styles/ReconciliationTool.css';

export default function ReconciliationTool() {
  const [bankCsv, setBankCsv] = useState('');
  const [erpCsv, setErpCsv] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleProcess = async () => {
    setLoading(true);
    setError('');
    setResults(null);
    
    try {
      // For now, show message since backend isn't running yet
      if (!bankCsv || !erpCsv) {
        setError('Please paste both bank and ERP CSVs');
        setLoading(false);
        return;
      }

      // When backend is ready, uncomment this:
      /*
      const response = await fetch('http://localhost:5000/api/upload-and-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bank_csv: bankCsv,
          erp_csv: erpCsv
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.message || 'Error processing');
        return;
      }
      
      setResults(data);
      */
      
      // For now, show demo data
      setResults({
        status: 'success',
        total_bank: 5,
        total_erp: 5,
        matched: 5,
        unmatched: 0,
        match_rate: 100,
        average_confidence: 92.5,
        matches: [
          {
            bank_amount: 1000,
            bank_desc: 'ABC Corp Payment',
            erp_amount: 1000,
            erp_desc: 'Invoice from ACME',
            confidence: 95.2
          }
        ]
      });
      
    } catch (err) {
      setError('Connection error: ' + err.message);
    }
    
    setLoading(false);
  };

  const handleDownload = () => {
    if (!results) return;
    
    // Create CSV report
    let csv = 'Bank Amount,Bank Description,ERP Amount,ERP Description,Confidence\n';
    
    results.matches.forEach(m => {
      csv += `${m.bank_amount},"${m.bank_desc}",${m.erp_amount},"${m.erp_desc}",${m.confidence}%\n`;
    });
    
    // Download
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(csv));
    element.setAttribute('download', 'reconciliation_results.csv');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="container">
      <header className="header">
        <h1>🤖 ReconAI</h1>
        <p>AI-Powered Reconciliation Tool</p>
      </header>

      <main className="main-content">
        {/* Input Section */}
        <section className="input-section">
          <div className="inputs-grid">
            {/* Bank CSV Input */}
            <div className="input-group">
              <label htmlFor="bank-csv">
                <strong>Bank CSV</strong>
                <span className="hint">Paste bank transactions (amount, description, date)</span>
              </label>
              <textarea
                id="bank-csv"
                value={bankCsv}
                onChange={(e) => setBankCsv(e.target.value)}
                placeholder="amount,description,date&#10;1000.00,ABC Corp Payment,2024-01-15&#10;500.50,Wire Transfer,2024-01-16"
                className="textarea"
              />
            </div>

            {/* ERP CSV Input */}
            <div className="input-group">
              <label htmlFor="erp-csv">
                <strong>ERP CSV</strong>
                <span className="hint">Paste accounting records (amount, description, date)</span>
              </label>
              <textarea
                id="erp-csv"
                value={erpCsv}
                onChange={(e) => setErpCsv(e.target.value)}
                placeholder="amount,description,date&#10;1000.00,Invoice ABC Corp,2024-01-15&#10;500.50,Payment XYZ,2024-01-16"
                className="textarea"
              />
            </div>
          </div>

          {/* Process Button */}
          <div className="button-group">
            <button
              onClick={handleProcess}
              disabled={loading || !bankCsv || !erpCsv}
              className={`btn btn-primary ${loading ? 'loading' : ''}`}
            >
              {loading ? '⏳ Processing...' : '⚡ Process & Match'}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-box">
              <span>⚠️ Error: {error}</span>
            </div>
          )}
        </section>

        {/* Results Section */}
        {results && (
          <section className="results-section">
            {/* Statistics Cards */}
            <div className="stats-grid">
              <div className="stat-card">
                <p className="stat-label">Total Transactions</p>
                <p className="stat-value">{results.total_bank + results.total_erp}</p>
              </div>

              <div className="stat-card success">
                <p className="stat-label">Matched</p>
                <p className="stat-value">{results.matched}</p>
              </div>

              <div className="stat-card warning">
                <p className="stat-label">Unmatched</p>
                <p className="stat-value">{results.unmatched}</p>
              </div>

              <div className="stat-card info">
                <p className="stat-label">Match Rate</p>
                <p className="stat-value">{results.match_rate}%</p>
              </div>

              <div className="stat-card info">
                <p className="stat-label">Avg Confidence</p>
                <p className="stat-value">{results.average_confidence}%</p>
              </div>
            </div>

            {/* Matches Table */}
            {results.matches.length > 0 && (
              <div className="matches-section">
                <div className="section-header">
                  <h2>Suggested Matches ({results.matches.length})</h2>
                  <button onClick={handleDownload} className="btn btn-secondary btn-small">
                    📥 Download CSV
                  </button>
                </div>

                <div className="table-container">
                  <table className="matches-table">
                    <thead>
                      <tr>
                        <th>Bank Amount</th>
                        <th>Bank Description</th>
                        <th>ERP Amount</th>
                        <th>ERP Description</th>
                        <th>Confidence</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.matches.map((match, idx) => (
                        <tr key={idx} className={`confidence-${getConfidenceLevel(match.confidence)}`}>
                          <td className="amount">${match.bank_amount.toFixed(2)}</td>
                          <td>{match.bank_desc}</td>
                          <td className="amount">${match.erp_amount.toFixed(2)}</td>
                          <td>{match.erp_desc}</td>
                          <td className="confidence">
                            <span className={`badge ${getConfidenceLevel(match.confidence)}`}>
                              {match.confidence}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Empty State */}
            {results.matches.length === 0 && (
              <div className="empty-state">
                <p>❌ No matches found. Check your CSV data.</p>
              </div>
            )}
          </section>
        )}

        {/* Welcome Section (when no results) */}
        {!results && !error && (
          <section className="welcome-section">
            <div className="welcome-box">
              <h2>📋 How It Works</h2>
              <ol>
                <li><strong>Paste Bank CSV</strong> - Export from your bank (amount, description, date)</li>
                <li><strong>Paste ERP CSV</strong> - Export from accounting software</li>
                <li><strong>Click Process</strong> - AI matches transactions automatically</li>
                <li><strong>Review Results</strong> - See confidence scores and download report</li>
              </ol>
            </div>

            <div className="welcome-box">
              <h2>📊 CSV Format Required</h2>
              <p><strong>Columns:</strong> amount, description, date</p>
              <p><strong>Date Format:</strong> YYYY-MM-DD</p>
              <p><strong>Example:</strong></p>
              <pre>amount,description,date
1000.00,ABC Corp Payment,2024-01-15
500.50,Wire Transfer,2024-01-16</pre>
            </div>
          </section>
        )}
      </main>

      <footer className="footer">
        <p>ReconAI v1.0 | Powered by AI Matching Algorithm</p>
      </footer>
    </div>
  );
}

function getConfidenceLevel(confidence) {
  if (confidence >= 95) return 'high';
  if (confidence >= 80) return 'medium';
  return 'low';
}
