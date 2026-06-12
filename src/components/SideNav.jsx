import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sword, ScrollText, BookOpen, Beer, LogOut, Coins, Search, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './SideNav.css';

export default function SideNav({ stats }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const navItems = [
    { path: '/', label: 'Board', icon: ScrollText },
    { path: '/search', label: 'Search', icon: Search },
    { path: '/tavern', label: 'Tavern', icon: Beer },
    { path: '/journal', label: 'Journal', icon: BookOpen }
  ];

  return (
    <aside className="side-nav">
      
      {/* Logo */}
      <div className="side-nav-logo" onClick={() => navigate('/')}>
        <Sword size={32} color="var(--konoha-orange)" />
        <div>ONE<span>QUEST</span></div>
      </div>

      {/* Navigation Links */}
      <nav className="side-nav-links">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <div 
              key={item.path}
              className={`side-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <div className="side-nav-icon-wrapper">
                <Icon size={24} className="nav-icon" />
              </div>
              <span style={{ zIndex: 2 }}>{item.label}</span>
            </div>
          );
        })}
        
        {stats?.isAdmin && (
          <div 
            className={`side-nav-item ${location.pathname === '/admin' ? 'active' : ''}`}
            onClick={() => navigate('/admin')}
            style={{ marginTop: '1rem', borderTop: '2px solid var(--wood-light)', paddingTop: '1rem' }}
          >
            <div className="side-nav-icon-wrapper" style={{ background: '#FED7D7', borderColor: '#E53E3E' }}>
              <ShieldAlert size={24} className="nav-icon" color="#C53030" />
            </div>
            <span style={{ zIndex: 2, color: '#C53030', fontWeight: 'bold' }}>Guild Master</span>
          </div>
        )}
      </nav>

      {/* Profile Section */}
      <div className="side-nav-profile" onClick={() => navigate('/profile')}>
        <img src={stats.avatarUrl} alt="Avatar" className="side-avatar" />
        <div className="side-profile-info">
          <span className="side-profile-name">{stats.userName}</span>
          <span className="side-profile-level">{stats.title}</span>
        </div>
      </div>
      
      <div className="side-nav-stats">
        <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#FFF' }}>
          Lv. {stats.level} <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginLeft: '0.2rem' }}>| {stats.xp}/{stats.requiredXp} XP</span>
        </div>
      </div>

    </aside>
  );
}
