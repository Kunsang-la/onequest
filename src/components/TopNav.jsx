import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sword } from 'lucide-react';
import './TopNav.css';

export default function TopNav({ stats }) {
  const navigate = useNavigate();
  
  // Safe fallback
  const currentStats = stats || { userName: 'Adventurer', level: 1, xp: 0, requiredXp: 100, avatarUrl: '/anime_avatar.png' };
  
  // XP Calculation
  const xpPercentage = Math.min((currentStats.xp / currentStats.requiredXp) * 100, 100);



  return (
    <header className="top-nav">
      
      {/* Row 1: Logo and Profile */}
      <div className="dashboard-row-1">
        
        {/* App Logo */}
        <div onClick={() => navigate('/')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', flexShrink: 0 }}>
          <Sword size={20} color="var(--konoha-orange)" />
          <span style={{ fontFamily: "'Kanit', sans-serif", fontSize: '1.4rem', fontWeight: 'bold', letterSpacing: '1px', color: '#FFF', textShadow: '2px 2px 0px var(--ink-dark)' }} className="hide-on-mobile">
            ONE<span style={{ color: 'var(--konoha-orange)' }}>QUEST</span>
          </span>
        </div>



        {/* Profile Nav */}
        <div className="dashboard-title" onClick={() => navigate('/profile')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginRight: '0.5rem' }}>
            <span style={{ fontSize: '1rem', fontWeight: 'bold', lineHeight: 1 }}>{stats.userName}</span>
            <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)', textShadow: 'none', fontFamily: "'Rubik', sans-serif" }}>
              Lv. {stats.level}
            </span>
          </div>
          <img src={stats.avatarUrl} alt="Avatar" className="avatar-img" />
        </div>
      </div>

      {/* Row 2: XP Bar */}
      <div className="dashboard-row-2">
        <span className="xp-text">XP {currentStats.xp} / {currentStats.requiredXp}</span>
        <div className="xp-bar-container-top">
          <div className="xp-bar-fill-top" style={{ width: `${xpPercentage}%` }}></div>
        </div>
      </div>

    </header>
  );
}
