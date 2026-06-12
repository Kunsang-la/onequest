import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, Flame, Target, Trophy, Clock, X, Edit3, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { BadgeIcon } from '../components/Badges';
import { BADGE_DEFINITIONS } from '../lib/badges';
import './Profile.css';

export default function Profile({ stats, completedQuests }) {
  const { updateProfile, user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(stats?.userName || '');
  const [usernameInput, setUsernameInput] = useState(stats?.guildUsername || '');
  const [bio, setBio] = useState(stats?.userBio || '');
  const [avatar, setAvatar] = useState(stats?.avatarUrl || '');
  const [errorMsg, setErrorMsg] = useState('');

  const formattedDate = new Date(stats?.memberSince).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  const handleSave = async () => {
    setErrorMsg('');
    
    // Validate Username Format
    const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
    if (!usernameRegex.test(usernameInput)) {
      setErrorMsg('Username must be 3-30 characters and contain only letters, numbers, and underscores.');
      return;
    }

    // Check Uniqueness if it changed
    if (usernameInput !== stats?.guildUsername) {
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', usernameInput)
        .neq('id', user?.id)
        .maybeSingle();
        
      if (data) {
        setErrorMsg(`The username @${usernameInput} is already taken!`);
        return;
      }
    }

    try {
      await updateProfile({ display_name: name, username: usernameInput, bio: bio, avatar_url: avatar });
      setIsEditing(false);
    } catch (err) {
      setErrorMsg("Failed to update profile: " + err.message);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 256;
        const MAX_HEIGHT = 256;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setAvatar(dataUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="profile-container">
      
      <div className="profile-grid">
        {/* Adventurer ID Card */}
        <div className="adventurer-card">
          <div className="card-header">
          <div className="card-guild-stamp">ONEQUEST REGISTRY</div>
          <button className="edit-card-btn" onClick={() => setIsEditing(true)}>
            <Edit3 size={18} />
          </button>
        </div>

        <div className="card-body">
          <div className="card-avatar-wrapper">
            <img src={stats?.avatarUrl} alt="Avatar" className="card-avatar" />
            <div className="card-level-badge">Lv.{stats?.level}</div>
          </div>
          
          <div className="card-identity">
            <h1 className="card-name">{stats?.userName}</h1>
            <p className="card-username">@{stats?.guildUsername}</p>
            
            <div className="title-ribbon">
              <span>{stats?.title}</span>
            </div>
            
            <div className="card-bio-section">
              <span className="bio-quote">"</span>
              <p className="card-bio">{stats?.userBio}</p>
              <span className="bio-quote end">"</span>
            </div>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="card-xp-section">
          <div className="xp-labels">
            <span>Rank Progression</span>
            <span>{stats?.xp} / {stats?.requiredXp} XP</span>
          </div>
          <div className="xp-track">
            <motion.div 
              className="xp-fill"
              initial={{ width: 0 }}
              animate={{ width: `${(stats?.xp / stats?.requiredXp) * 100}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            ></motion.div>
          </div>
        </div>
      </div>

      {/* Guild Statistics Grid */}
      <div className="profile-stats-section">
        <div className="asset-container" style={{ padding: '1.5rem' }}>
          
          {/* Showcase Badges Section */}
          {user && updateProfile && useAuth().profile?.showcase_badges?.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 className="section-title" style={{ margin: 0, paddingBottom: '1rem', borderBottom: '1px solid var(--wood-light)' }}>Showcase Badges</h3>
              <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', paddingTop: '1.5rem' }}>
                {useAuth().profile.showcase_badges.map(badgeId => {
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
                <span className="ledger-value">{stats?.questsCompleted}</span>
                <span className="ledger-label">Quests Cleared</span>
              </div>
            </div>
            <div className="ledger-item">
              <Flame size={24} className="ledger-icon" color="#E53E3E" />
              <div className="ledger-data">
                <span className="ledger-value">{stats?.streak}</span>
                <span className="ledger-label">Day Streak</span>
              </div>
            </div>
            <div className="ledger-item full-width">
              <Clock size={20} className="ledger-icon" color="var(--ink-light)" />
              <div className="ledger-data row">
                <span className="ledger-label">Registered:</span>
                <span className="ledger-value small">{formattedDate}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Recent Adventures Log */}
      <h3 className="section-title">Recent Adventures</h3>
      <div className="adventure-log">
        {completedQuests && completedQuests.length > 0 ? (
          completedQuests.slice(0, 5).map((q, i) => (
            <div key={i} className="log-entry">
              <div className="log-header">
                <span className="log-title">{q.title}</span>
                <span className="log-xp">+{q.xpReward} XP</span>
              </div>
              <div className="log-footer">
                <span className={`log-rarity rarity-${q.rarity.toLowerCase()}`}>{q.rarity}</span>
                <span className="log-date">{new Date(q.completedAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-log">
            <p>No adventures recorded yet.</p>
            <span>Visit the Quest Board to start your journey!</span>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditing && (
          <motion.div 
            className="edit-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsEditing(false)}
          >
            <motion.div 
              className="edit-modal-content"
              initial={{ y: 50, scale: 0.95, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 50, scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="edit-modal-header">
                <h3>Update Guild Record</h3>
                <button className="close-btn" onClick={() => setIsEditing(false)}><X size={20} /></button>
              </div>
              
              <div className="edit-form-inner">
                {errorMsg && <div style={{ color: '#E53E3E', fontSize: '0.85rem', fontWeight: 'bold', background: '#FED7D7', padding: '0.5rem', borderRadius: '4px' }}>{errorMsg}</div>}
                
                <div className="form-group">
                  <label>Display Name</label>
                  <input 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    className="modal-input" 
                    placeholder="Your Adventurer Name"
                    maxLength={25}
                  />
                </div>

                <div className="form-group">
                  <label>Unique Guild Username</label>
                  <div className="input-with-icon">
                    <span className="input-icon" style={{ fontWeight: 'bold', color: 'var(--ink-light)' }}>@</span>
                    <input 
                      value={usernameInput} 
                      onChange={e => setUsernameInput(e.target.value.toLowerCase().replace(/\s/g, ''))} 
                      className="modal-input has-icon" 
                      placeholder="shadow_walker"
                      maxLength={30}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Update Avatar</label>
                  <div className="avatar-upload-wrapper">
                    {avatar && <img src={avatar} alt="Preview" className="avatar-preview" />}
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleImageUpload} 
                      className="modal-file-input" 
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Adventurer Bio</label>
                  <textarea 
                    value={bio} 
                    onChange={e => setBio(e.target.value)} 
                    className="modal-textarea" 
                    placeholder="Tell the guild about yourself..."
                    maxLength={120}
                  />
                </div>
                
                <button onClick={handleSave} className="btn-primary full-width-btn">
                  Seal Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
