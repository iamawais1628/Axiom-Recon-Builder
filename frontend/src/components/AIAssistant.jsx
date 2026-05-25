import React, { useState } from 'react';
import API_URL from '../config.js';
import '../styles/AIAssistant.css';

export default function AIAssistant({ token, sessionData, matchesData }) {
  const [activeTab, setActiveTab] = useState('analyze');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const callAIEndpoint = async (endpoint, payload) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`${API_URL}/api/ai/${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to get AI analysis');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
      console.error('AI Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeMatches = async () => {
    if (!matchesData || matchesData.length === 0) {
      setError('No matches data available');
      return;
    }

    await callAIEndpoint('analyze-matches', {
      matches: matchesData.slice(0, 10),
      total_matches: matchesData.length
    });
  };

  const handleSuggestRules = async () => {
    await callAIEndpoint('suggest-rules', {
      session: sessionData
    });
  };

  const handleSummarize = async () => {
    await callAIEndpoint('summarize', {
      session: sessionData
    });
  };

  return (
    <div className="ai-assistant">
      {/* Header */}
      <div className="ai-header">
        <h3>🤖 AI Assistant</h3>
        <p>Get AI-powered insights about your reconciliation</p>
      </div>

      {/* Tabs */}
      <div className="ai-tabs">
        <button
          className={`tab ${activeTab === 'analyze' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('analyze');
            setResult(null);
          }}
        >
          🔍 Analyze Matches
        </button>
        <button
          className={`tab ${activeTab === 'rules' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('rules');
            setResult(null);
          }}
        >
          💡 Suggest Rules
        </button>
        <button
          className={`tab ${activeTab === 'summary' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('summary');
            setResult(null);
          }}
        >
          📊 Summary
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="ai-error">
          ⚠️ {error}
        </div>
      )}

      {/* Content */}
      <div className="ai-content">
        {!result ? (
          <div className="ai-prompt">
            {activeTab === 'analyze' && (
              <>
                <p>📊 Analyze your matched transactions and get insights</p>
                <button
                  className="btn-ai-action"
                  onClick={handleAnalyzeMatches}
                  disabled={loading}
                >
                  {loading ? '⏳ Analyzing...' : '🤖 Analyze Matches'}
                </button>
              </>
            )}

            {activeTab === 'rules' && (
              <>
                <p>💡 Get AI-suggested rules to improve future matching</p>
                <button
                  className="btn-ai-action"
                  onClick={handleSuggestRules}
                  disabled={loading}
                >
                  {loading ? '⏳ Analyzing...' : '🤖 Suggest Rules'}
                </button>
              </>
            )}

            {activeTab === 'summary' && (
              <>
                <p>📊 Get a professional summary of this reconciliation</p>
                <button
                  className="btn-ai-action"
                  onClick={handleSummarize}
                  disabled={loading}
                >
                  {loading ? '⏳ Analyzing...' : '🤖 Generate Summary'}
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="ai-result">
            <div className="result-header">
              <h4>✨ AI Analysis</h4>
              <button
                className="btn-close-result"
                onClick={() => setResult(null)}
              >
                ✕
              </button>
            </div>

            {result.status === 'success' ? (
              <div className="result-content">
                {result.analysis && (
                  <div className="result-text">{result.analysis}</div>
                )}
                {result.suggestions && (
                  <div className="result-text">{result.suggestions}</div>
                )}
                {result.summary && (
                  <div className="result-text">{result.summary}</div>
                )}
                {result.explanation && (
                  <div className="result-text">{result.explanation}</div>
                )}
              </div>
            ) : (
              <div className="result-error">
                <p>Failed to generate analysis</p>
                <p className="error-msg">{result.message}</p>
              </div>
            )}

            <button
              className="btn-new-analysis"
              onClick={() => setResult(null)}
            >
              ↻ New Analysis
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="ai-footer">
        <p>Powered by Groq AI ⚡</p>
      </div>
    </div>
  );
}
