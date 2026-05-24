import React, { useState } from 'react';
import '../styles/Sidebar.css';

export default function Sidebar({ user, onLogout, currentPage, onNavigate }) {
  const [isHovered, setIsHovered] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', badge: null },
    { id: 'reconciliation', label: 'Reconciliation', icon: '🔄', badge: null },
    { id: 'history', label: 'History', icon: '📜', badge: null },
    { id: 'rules', label: 'Rules', icon: '🎯', badge: null },
    { id: 'settings', label: 'Settings', icon: '⚙️', badge: null },
  ];

  return (
    <div className="sidebar-container">
      {/* Sidebar */}
      <aside 
        className={`sidebar ${isHovered ? 'expanded' : 'collapsed'}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Navigation Menu */}
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
              onClick={() => onNavigate(item.id)}
              title={!isHovered ? item.label : ''}
            >
              <span className="nav-icon">{item.icon}</span>
              {isHovered && (
                <>
                  <span className="nav-label">{item.label}</span>
                  {item.badge && <span className="nav-badge">{item.badge}</span>}
                </>
              )}
            </button>
          ))}
        </nav>

        {/* Divider */}
        <div className="sidebar-divider" />

        {/* User Section */}
        <div className="sidebar-user">
          <div className="user-avatar">
            {user?.name
              ? user.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
              : user?.email?.charAt(0).toUpperCase()}
          </div>
          {isHovered && (
            <div className="user-info">
              <div className="user-name">{user?.name || user?.email}</div>
              <div className="user-role">User</div>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <button className="btn-sidebar-logout" onClick={onLogout} title="Logout">
          <span className="logout-icon">🚪</span>
          {isHovered && <span>Logout</span>}
        </button>
      </aside>
    </div>
  );
}
