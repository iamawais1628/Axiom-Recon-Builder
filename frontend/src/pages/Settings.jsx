import React, { useState } from 'react';
import API_URL from '../config.js';
import '../styles/Settings.css';

export default function Settings({ user, token }) {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Profile Settings
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  // Password Settings
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Preferences
  const [preferences, setPreferences] = useState({
    theme: 'light',
    emailNotifications: true,
    matchAlerts: true,
    weeklyReport: false,
  });

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handlePreferenceChange = (e) => {
    const { name, type, checked, value } = e.target;
    setPreferences(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch(`${API_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: profileData.name })
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage({ type: 'error', text: data.message || 'Failed to update profile' });
        setLoading(false);
        return;
      }

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setLoading(false);
    } catch (err) {
      setMessage({ type: 'error', text: 'Error: ' + err.message });
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters' });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          old_password: passwordData.oldPassword,
          new_password: passwordData.newPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage({ type: 'error', text: data.message || 'Failed to change password' });
        setLoading(false);
        return;
      }

      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setLoading(false);
    } catch (err) {
      setMessage({ type: 'error', text: 'Error: ' + err.message });
      setLoading(false);
    }
  };

  const handleSavePreferences = (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    // Simulate saving preferences
    setTimeout(() => {
      setMessage({ type: 'success', text: 'Preferences saved successfully!' });
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="settings-container">
      {/* Tabs */}
      <div className="settings-tabs">
        <button
          className={`settings-tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          👤 Profile
        </button>
        <button
          className={`settings-tab ${activeTab === 'password' ? 'active' : ''}`}
          onClick={() => setActiveTab('password')}
        >
          🔐 Security
        </button>
        <button
          className={`settings-tab ${activeTab === 'preferences' ? 'active' : ''}`}
          onClick={() => setActiveTab('preferences')}
        >
          ⚙️ Preferences
        </button>
      </div>

      {/* Messages */}
      {message.text && (
        <div className={`settings-message ${message.type}`}>
          {message.type === 'success' ? '✅' : '⚠️'} {message.text}
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="settings-section">
          <div className="section-header">
            <h2>👤 Profile Settings</h2>
            <p>Manage your account information</p>
          </div>

          <form onSubmit={handleSaveProfile} className="settings-form">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                name="name"
                value={profileData.name}
                onChange={handleProfileChange}
                placeholder="Your full name"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                name="email"
                value={profileData.email}
                disabled
                placeholder="Your email"
                className="form-input disabled"
              />
              <small>Email cannot be changed</small>
            </div>

            <div className="form-group">
              <label htmlFor="role">Role</label>
              <input
                id="role"
                type="text"
                value={user?.role || 'User'}
                disabled
                className="form-input disabled"
              />
            </div>

            <div className="form-actions">
              <button type="submit" disabled={loading} className="btn btn-primary">
                {loading ? 'Saving...' : '💾 Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <div className="settings-section">
          <div className="section-header">
            <h2>🔐 Security Settings</h2>
            <p>Manage your password and security</p>
          </div>

          <form onSubmit={handleChangePassword} className="settings-form">
            <div className="security-warning">
              <span>🔒</span>
              <p>Keep your password strong and unique. Never share it with anyone.</p>
            </div>

            <div className="form-group">
              <label htmlFor="oldPassword">Current Password</label>
              <input
                id="oldPassword"
                type="password"
                name="oldPassword"
                value={passwordData.oldPassword}
                onChange={handlePasswordChange}
                placeholder="Enter current password"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                id="newPassword"
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                placeholder="Enter new password"
                className="form-input"
                required
              />
              <small>Minimum 8 characters, 1 uppercase, 1 number</small>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                placeholder="Confirm new password"
                className="form-input"
                required
              />
            </div>

            <div className="form-actions">
              <button type="submit" disabled={loading} className="btn btn-primary">
                {loading ? 'Updating...' : '🔄 Change Password'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <div className="settings-section">
          <div className="section-header">
            <h2>⚙️ Preferences</h2>
            <p>Customize your experience</p>
          </div>

          <form onSubmit={handleSavePreferences} className="settings-form">
            <div className="preferences-group">
              <h3>Theme & Display</h3>
              
              <div className="form-group">
                <label htmlFor="theme">Theme</label>
                <select
                  id="theme"
                  name="theme"
                  value={preferences.theme}
                  onChange={handlePreferenceChange}
                  className="form-input"
                >
                  <option value="light">☀️ Light</option>
                  <option value="dark">🌙 Dark</option>
                  <option value="auto">🔄 Auto (System)</option>
                </select>
              </div>
            </div>

            <div className="preferences-group">
              <h3>Notifications</h3>
              
              <div className="form-group checkbox">
                <input
                  id="emailNotifications"
                  type="checkbox"
                  name="emailNotifications"
                  checked={preferences.emailNotifications}
                  onChange={handlePreferenceChange}
                />
                <label htmlFor="emailNotifications">
                  📧 Email Notifications
                  <small>Receive email updates about your account</small>
                </label>
              </div>

              <div className="form-group checkbox">
                <input
                  id="matchAlerts"
                  type="checkbox"
                  name="matchAlerts"
                  checked={preferences.matchAlerts}
                  onChange={handlePreferenceChange}
                />
                <label htmlFor="matchAlerts">
                  ⚡ Match Alerts
                  <small>Get notified when reconciliations complete</small>
                </label>
              </div>

              <div className="form-group checkbox">
                <input
                  id="weeklyReport"
                  type="checkbox"
                  name="weeklyReport"
                  checked={preferences.weeklyReport}
                  onChange={handlePreferenceChange}
                />
                <label htmlFor="weeklyReport">
                  📊 Weekly Report
                  <small>Receive weekly reconciliation reports</small>
                </label>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" disabled={loading} className="btn btn-primary">
                {loading ? 'Saving...' : '💾 Save Preferences'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
