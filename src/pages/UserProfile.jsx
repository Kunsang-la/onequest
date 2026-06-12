import React from 'react';
import { FirstQuestBadge, SocialButterflyBadge, BraveExplorerBadge } from '../components/Badges';
import { Flame, Target, Award } from 'lucide-react';
import './UserProfile.css';

export default function UserProfile({ stats }) {
  // Safe fallback if stats aren't loaded properly
  const currentStats = stats || { level: 1, xp: 0, gold: 0, streak: 0, questsCompleted: 0 };
  
  // XP Calculation
  const xpForNextLevel = currentStats.level * 200;
  const xpPercentage = Math.min((currentStats.xp / xpForNextLevel) * 100, 100);

  return (
    <div className="profile-container">
      
      <div className="dashboard-header">
        <h2>Adventurer's Log</h2>
        <p>Record of your courageous deeds.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card asset-container level-card">
          <span className="stat-label" style={{ fontSize: '1rem', color: 'var(--accent-gold)' }}>Adventurer Level</span>
          <span className="stat-value" style={{ fontSize: '2.5rem' }}>{currentStats.level}</span>
          <div className="xp-bar-container">
            <div className="xp-bar-fill" style={{ width: `${xpPercentage}%` }}></div>
          </div>
          <span style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: 'var(--text-muted)' }}>
            {currentStats.xp} / {xpForNextLevel} XP
          </span>
        </div>

        <div className="stat-card asset-container">
          <span className="stat-value"><Target size={24} style={{ marginRight: '8px', verticalAlign: 'middle' }} color="var(--accent-green)"/>{currentStats.questsCompleted}</span>
          <span className="stat-label">Quests Done</span>
        </div>

        <div className="stat-card asset-container">
          <span className="stat-value"><Flame size={24} style={{ marginRight: '8px', verticalAlign: 'middle' }} color="var(--accent-red)"/>{currentStats.streak}</span>
          <span className="stat-label">Day Streak</span>
        </div>
      </div>

      {/* Quote Widget */}
      <div className="quote-widget asset-container">
        <p className="quote-text">"Courage is not the absence of fear, but the triumph over it. The tavern awaits those who take the first step."</p>
        <p className="quote-author">- Guild Master Aris</p>
      </div>

      <h3 className="section-title">Achievements</h3>
      <div className="badge-case">
        <div className="badges-grid">
          <FirstQuestBadge />
          <SocialButterflyBadge />
          <BraveExplorerBadge />
        </div>
      </div>

    </div>
  );
}
