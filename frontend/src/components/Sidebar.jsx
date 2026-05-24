import React, { useState } from 'react';
import '../styles/Sidebar.css';

export default function Sidebar({ user, currentPage, onNavigate }) {
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
      </aside>
    </div>
  );
}
