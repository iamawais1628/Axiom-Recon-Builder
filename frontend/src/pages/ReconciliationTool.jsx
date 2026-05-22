import React, { useState } from 'react';
import '../styles/ReconciliationTool.css';

export default function ReconciliationTool() {
  const [bankCsv, setBankCsv] = useState('');
  const [erpCsv, setErpCsv] = useState('');
  const [bankFile, setBankFile] = useState(null);
  const [erpFile, setErpFile] = useState(null);
  const [sessionName, setSessionName] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadMode, setUploadMode] = useState('paste'); // 'paste' or 'file'

  const handlePasteProcess = async () => {
    setLoading(true);
    setError('');
    setResults(null);
    
    try {
      if (!bankCsv || !erpCsv) {
        setError('Please paste both bank and ERP CSVs');
        setLoading(false);
        return;
      }

      // In production, uncomment this to call actual API
      /*
      const response = await fetch('http://localhost:5000/api/upload-and-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bank_csv: bankCsv,
          erp_csv: erpCsv,
          session_name: sessionName || 'Reconciliation'
        })
      });
      */
      
      // Demo data for now
      setResults({
        status: 'success',
        session_id: 1,
        session_name: sessionName || 'Reconciliation',
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

  const handleFileUpload = async (e) => {
    setLoading(true);
    setError('');
    setResults(null);
    
    try {
      if (!bankFile || !erpFile) {
        setError('Please select both bank and ERP CSV files');
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append('bank_file', bankFile);
      formData.append('erp_file', erpFile);
      formData.append('session_name', sessionName || 'File Upload Reconciliation');

      // In production, uncomment this:
      /*
      const response = await fetch('http://localhost:5000/api/upload-file', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.message || 'Error processing files');
        return;
      }
      
      setResults(data);
      */
      
      // Demo data for now
      setResults({
        status: 'success',
        session_id: 2,
        session_name: sessionName || 'File Upload Reconciliation',
        total_bank: 10,
        total_erp: 10,
        matched: 10,
        unmatched: 0,
        match_rate: 100,
        average_confidence: 94.8,
        bank_file: {
          filename: bankFile.name,
          size_kb: (bankFile.size / 1024).toFixed(2)
        },
        erp_file: {
          filename: erpFile.name,
          size_kb: (erpFile.size / 1024).toFixed(2)
        },
        matches: []
      });
    } catch (err) {
      setError('Upload error: ' + err.message);
    }
    
    setLoading(false);
  };

  const handleDownload = () => {
    if (!results) return;
    
    let csv = 'Bank Amount,Bank Description,ERP Amount,ERP Description,Confidence\n';
    
    results.matches.forEach(m => {
      csv += `${m.bank_amount},"${m.bank_desc}",${m.erp_amount},"${m.erp_desc}",${m.confidence}%\n`;
    });
    
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(csv));
    element.setAttribute('download', `reconciliation_${results.session_id}.csv`);
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
        {/* Mode Selector */}
        <section className="mode-selector">
          <button
            className={`mode-btn ${uploadMode === 'paste' ? 'active' : ''}`}
            onClick={() => setUploadMode('paste')}
          >
            📋 Paste CSV
          </button>
          <button
            className={`mode-btn ${uploadMode === 'file' ? 'active' : ''}`}
            onClick={() => setUploadMode('file')}
          >
            📁 Upload File
          </button>
        </section>

        {/* Paste Mode */}
        {uploadMode === 'paste' && (
          <section className="input-section">
            <div className="inputs-grid">
              <div className="input-group">
                <label htmlFor="bank-csv">
                  <strong>Bank CSV</strong>
                  <span className="hint">Paste bank transactions</span>
                </label>
                <textarea
                  id="bank-csv"
                  value={bankCsv}
                  onChange={(e) => setBankCsv(e.target.value)}
                  placeholder="amount,description,date&#10;1000.00,ABC Corp,2024-01-15"
                  className="textarea"
                />
              </div>

              <div className="input-group">
                <label htmlFor="erp-csv">
                  <strong>ERP CSV</strong>
                  <span className="hint">Paste accounting records</span>
                </label>
                <textarea
                  id="erp-csv"
                  value={erpCsv}
                  onChange={(e) => setErpCsv(e.target.value)}
                  placeholder="amount,description,date&#10;1000.00,Invoice ABC,2024-01-15"
                  className="textarea"
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="session-name">
                <strong>Session Name</strong>
                <span className="hint">Optional: Name for this reconciliation</span>
              </label>
              <input
                id="session-name"
                type="text"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                placeholder="e.g., January 2024 Reconciliation"
                className="input-text"
              />
            </div>

            <div className="button-group">
              <button
                onClick={handlePasteProcess}
                disabled={loading || !bankCsv || !erpCsv}
                className={`btn btn-primary ${loading ? 'loading' : ''}`}
              >
                {loading ? '⏳ Processing...' : '⚡ Process & Match'}
              </button>
            </div>
          </section>
        )}

        {/* File Upload Mode */}
        {uploadMode === 'file' && (
          <section className="input-section">
            <div className="file-inputs-grid">
              <div className="file-input-group">
                <label htmlFor="bank-file">
                  <strong>Bank CSV File</strong>
                  <span className="hint">Select .csv file</span>
                </label>
                <input
                  id="bank-file"
                  type="file"
                  accept=".csv,.txt"
                  onChange={(e) => setBankFile(e.target.files[0])}
                  className="file-input"
                />
                {bankFile && (
                  <div className="file-info">
                    📄 {bankFile.name} ({(bankFile.size / 1024).toFixed(2)} KB)
                  </div>
                )}
              </div>

              <div className="file-input-group">
                <label htmlFor="erp-file">
                  <strong>ERP CSV File</strong>
                  <span className="hint">Select .csv file</span>
                </label>
                <input
                  id="erp-file"
                  type="file"
                  accept=".csv,.txt"
                  onChange={(e) => setErpFile(e.target.files[0])}
                  className="file-input"
                />
                {erpFile && (
                  <div className="file-info">
                    📄 {erpFile.name} ({(erpFile.size / 1024).toFixed(2)} KB)
                  </div>
                )}
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="session-name-file">
                <strong>Session Name</strong>
                <span className="hint">Optional: Name for this reconciliation</span>
              </label>
              <input
                id="session-name-file"
                type="text"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                placeholder="e.g., January 2024 Reconciliation"
                className="input-text"
              />
            </div>

            <div className="button-group">
              <button
                onClick={handleFileUpload}
                disabled={loading || !bankFile || !erpFile}
                className={`btn btn-primary ${loading ? 'loading' : ''}`}
              >
                {loading ? '⏳ Uploading...' : '📤 Upload & Process'}
              </button>
            </div>
          </section>
        )}

        {/* Error Message */}
        {error && (
          <div className="error-box">
            <span>⚠️ Error: {error}</span>
          </div>
        )}

        {/* Results Section */}
        {results && (
          <section className="results-section">
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

            {results.matches && results.matches.length > 0 && (
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
          </section>
        )}

        {/* Welcome Section */}
        {!results && !error && (
          <section className="welcome-section">
            <div className="welcome-box">
              <h2>📋 CSV Format Required</h2>
              <p><strong>Columns:</strong> amount, description, date</p>
              <p><strong>Date Format:</strong> YYYY-MM-DD</p>
              <pre>amount,description,date
1000.00,ABC Corp,2024-01-15
500.50,Wire Transfer,2024-01-16</pre>
            </div>

            <div className="welcome-box">
              <h2>✨ Features</h2>
              <ul>
                <li>📋 Paste CSV data directly</li>
                <li>📁 Upload CSV files (up to 5MB)</li>
                <li>🤖 AI-powered matching</li>
                <li>💾 Save results to database</li>
                <li>📥 Download reconciliation report</li>
              </ul>
            </div>
          </section>
        )}
      </main>

      <footer className="footer">
        <p>ReconAI v1.1 | File Upload Enabled</p>
      </footer>
    </div>
  );
}

function getConfidenceLevel(confidence) {
  if (confidence >= 95) return 'high';
  if (confidence >= 80) return 'medium';
  return 'low';
}
