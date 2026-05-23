import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import ReconciliationTool from './pages/ReconciliationTool';
import Sidebar from './components/Sidebar';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('reconciliation');

  useEffect(() => {
    // Check if user is already logged in
    const savedToken = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (err) {
        console.error('Error loading saved user:', err);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
      }
    }
    
    setLoading(false);
  }, []);

  const handleLoginSuccess = ({ token, user }) => {
    setToken(token);
    setUser(user);
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setCurrentPage('reconciliation');
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  };

  const handleNavigate = (pageId) => {
    setCurrentPage(pageId);
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)'
      }}>
        Loading...
      </div>
    );
  }

  // Show Login page if not authenticated
  if (!token || !user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Show App with Sidebar if authenticated
  return (
    <div className="App">
      <Sidebar 
        user={user} 
        onLogout={handleLogout}
        currentPage={currentPage}
        onNavigate={handleNavigate}
      />
      
      <div className="app-main">
        {/* Header */}
        <div className="app-header">
          <h1>
            {currentPage === 'dashboard' && '📊 Dashboard'}
            {currentPage === 'reconciliation' && '⚙️ Reconciliation'}
            {currentPage === 'history' && '📁 History'}
            {currentPage === 'rules' && '⚡ Rules Engine'}
            {currentPage === 'settings' && '⚙️ Settings'}
          </h1>
        </div>

        {/* Content */}
        <div className="app-content">
          {currentPage === 'reconciliation' && (
            <ReconciliationTool token={token} user={user} />
          )}
          
          {currentPage === 'dashboard' && (
            <div className="page-placeholder">
              <h2>📊 Dashboard</h2>
              <p>Dashboard content coming soon...</p>
            </div>
          )}
          
          {currentPage === 'history' && (
            <div className="page-placeholder">
              <h2>📁 Reconciliation History</h2>
              <p>View all past reconciliations here...</p>
            </div>
          )}
          
          {currentPage === 'rules' && (
            <div className="page-placeholder">
              <h2>⚡ Rules Engine</h2>
              <p>Manage your matching rules here...</p>
            </div>
          )}
          
          {currentPage === 'settings' && (
            <div className="page-placeholder">
              <h2>⚙️ Settings</h2>
              <p>Configure your account and preferences...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
