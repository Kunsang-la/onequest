import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Target, Trophy, Flame, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { calculateProgression } from '../lib/rpgLogic';
import { BadgeIcon } from '../components/Badges';
import { BADGE_DEFINITIONS } from '../lib/badges';
import './Profile.css';

export default function PublicProfile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      const cleanUsername = username.replace('@', ''); // Allow both /user/shadow and /user/@shadow
      
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', cleanUsername)
        .maybeSingle();

      if (profileError || !userProfile) {
        setError('Adventurer not found.');
        setLoading(false);
        return;
      }

      setProfile(userProfile);

      const { data: questHistory } = await supabase
        .from('user_quests')
        .select('*')
        .eq('user_id', userProfile.id)
        .order('completed_at', { ascending: false })
        .limit(5);

      if (questHistory) setQuests(questHistory);
      setLoading(false);
    };
    fetchUser();
  }, [username]);

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center', fontFamily: "'Kanit', sans-serif" }}>Scouting adventurer data...</div>;
  if (error) return (
    <div style={{ padding: '4rem', textAlign: 'center' }}>
      <h2 style={{ color: '#E53E3E', fontFamily: "'Kanit', sans-serif" }}>{error}</h2>
      <br/>
      <button onClick={() => navigate(-1)} className="btn-secondary">Go Back</button>
    </div>
  );

  const progression = calculateProgression(profile.xp);

  return (
    <div className="profile-container">
      <button onClick={() => navigate(-1)} className="btn-secondary" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: 'none', boxShadow: 'none' }}>
        <ArrowLeft size={18} /> Back to previous
      </button>

      <div className="profile-grid">
        {/* Adventurer ID Card */}
        <div className="adventurer-card">
          <div className="card-header">
            <div className="card-guild-stamp">ONEQUEST REGISTRY</div>
            {/* No edit button for public profile */}
          </div>

          <div className="card-body">
            <div className="card-avatar-wrapper">
              <img src={profile.avatar_url || '/anime_avatar.png'} alt="Avatar" className="card-avatar" />
              <div className="card-level-badge">Lv.{progression.level}</div>
            </div>
            
            <div className="card-identity">
              <h1 className="card-name">{profile.display_name}</h1>
              <p className="card-username">@{profile.username}</p>
              
              <div className="title-ribbon">
                <span>{progression.rank}</span>
              </div>
              
              <div className="card-bio-section">
                <span className="bio-quote">"</span>
                <p className="card-bio">{profile.bio || 'Ready for the next quest!'}</p>
                <span className="bio-quote end">"</span>
              </div>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="card-xp-section">
            <div className="xp-labels">
              <span>Rank Progression</span>
              <span>{progression.currentXp} / {progression.requiredXp} XP</span>
            </div>
            <div className="xp-track">
              <motion.div 
                className="xp-fill"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((progression.currentXp / progression.requiredXp) * 100, 100)}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              ></motion.div>
            </div>
          </div>
        </div>

        {/* Guild Statistics Grid */}
        <div className="profile-stats-section">
          <div className="asset-container" style={{ padding: '1.5rem' }}>
            
            {/* Showcase Badges Section */}
            {profile.showcase_badges && profile.showcase_badges.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h3 className="section-title" style={{ margin: 0, paddingBottom: '1rem', borderBottom: '1px solid var(--wood-light)' }}>Showcase Badges</h3>
                <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', paddingTop: '1.5rem' }}>
                  {profile.showcase_badges.map(badgeId => {
                    const badgeDef = BADGE_DEFINITIONS.find(b => b.id === badgeId);
                    if (!badgeDef) return null;
                    return (
                      <div key={badgeId} style={{ width: '60px', height: '60px', position: 'relative' }} title={badgeDef.label}>
                        <BadgeIcon badge={badgeDef} isUnlocked={true} />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <h3 className="section-title" style={{ margin: 0, paddingBottom: '1rem', borderBottom: '1px solid var(--wood-light)', marginBottom: '1.5rem' }}>Guild Ledger</h3>
            <div className="stats-ledger">
              <div className="ledger-item">
                <Target size={24} className="ledger-icon" color="#38A169" />
                <div className="ledger-data">
                  <span className="ledger-value">{profile.quests_completed || 0}</span>
                  <span className="ledger-label">Quests Cleared</span>
                </div>
              </div>
              <div className="ledger-item">
                <Flame size={24} className="ledger-icon" color="#E53E3E" />
                <div className="ledger-data">
                  <span className="ledger-value">0</span>
                  <span className="ledger-label">Day Streak</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Adventures Log */}
      <h3 className="section-title">Recent Adventures</h3>
      <div className="adventure-log">
        {quests && quests.length > 0 ? (
          quests.map((q, i) => (
            <div key={i} className="log-entry">
              <div className="log-header">
                <span className="log-title">{q.quest_title}</span>
                <span className="log-xp">+{q.xp_earned} XP</span>
              </div>
              <div className="log-footer">
                <span className={`log-rarity rarity-${q.quest_rarity?.toLowerCase() || 'common'}`}>{q.quest_rarity || 'Common'}</span>
                <span className="log-date">{new Date(q.completed_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-log">
            <p>No adventures recorded yet.</p>
          </div>
        )}
      </div>

    </div>
  );
}
