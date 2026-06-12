import React, { useState } from 'react';
import { BADGE_DEFINITIONS } from '../lib/badges';
import { Lock, Pin, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import './Badges.css';

export const BadgeIcon = ({ badge, color, isUnlocked = true }) => {
  const Icon = badge.icon;
  const actualColor = isUnlocked ? color || badge.color : '#A0AEC0';
  
  return (
    <svg width="100%" height="100%" viewBox="0 0 100 100" className="badge-svg" style={{ filter: isUnlocked ? 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' : 'none' }}>
      {/* Solid flat color with thick dark border for Gym Badge aesthetic */}
      {badge.shape === 'shield' && (
        <path d="M50 10 L85 25 L85 60 C85 80 65 90 50 95 C35 90 15 80 15 60 L15 25 Z" fill={actualColor} stroke="#1A1A1A" strokeWidth="4" />
      )}
      {badge.shape === 'circle' && (
        <circle cx="50" cy="50" r="40" fill={actualColor} stroke="#1A1A1A" strokeWidth="4" />
      )}
      {badge.shape === 'hexagon' && (
        <polygon points="50 10, 85 30, 85 70, 50 90, 15 70, 15 30" fill={actualColor} stroke="#1A1A1A" strokeWidth="4" />
      )}

      {/* Inner detail line for extra pop */}
      {badge.shape === 'shield' && (
        <path d="M50 16 L80 29 L80 58 C80 75 63 84 50 88 C37 84 20 75 20 58 L20 29 Z" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
      )}
      {badge.shape === 'circle' && (
        <circle cx="50" cy="50" r="34" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
      )}
      {badge.shape === 'hexagon' && (
        <polygon points="50 18, 78 35, 78 65, 50 82, 22 65, 22 35" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
      )}

      {/* Icon rendering */}
      <foreignObject x="26" y="26" width="48" height="48">
        <div style={{ color: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
          {isUnlocked ? <Icon size={28} strokeWidth={3} /> : <Lock size={28} strokeWidth={2} />}
        </div>
      </foreignObject>
    </svg>
  );
};

export const BadgeGrid = ({ completedQuests, courageCount }) => {
  const { profile, updateProfile } = useAuth();
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [showWarning, setShowWarning] = useState(false);
  const [isPinning, setIsPinning] = useState(false);

  const pinnedBadges = profile?.showcase_badges || [];
  const isSelectedPinned = selectedBadge && pinnedBadges.includes(selectedBadge.id);

  const handlePinToggle = async () => {
    if (!selectedBadge || isPinning) return;
    setIsPinning(true);

    let newPins = [...pinnedBadges];
    if (isSelectedPinned) {
      newPins = newPins.filter(id => id !== selectedBadge.id);
    } else {
      if (newPins.length >= 3) {
        setShowWarning(true);
        setIsPinning(false);
        return;
      }
      newPins.push(selectedBadge.id);
    }

    await updateProfile({ showcase_badges: newPins });
    setIsPinning(false);
  };

  const handleConfirmReplace = async () => {
    setIsPinning(true);
    let newPins = [...pinnedBadges];
    // Remove oldest (first item) and add new one
    newPins.shift();
    newPins.push(selectedBadge.id);
    
    await updateProfile({ showcase_badges: newPins });
    setShowWarning(false);
    setIsPinning(false);
  };

  return (
    <>
      <div className="badges-grid">
        {BADGE_DEFINITIONS.map(badge => {
          const isUnlocked = badge.evaluate(completedQuests, courageCount);
          const Icon = badge.icon;
          const color = isUnlocked ? badge.color : '#A0AEC0'; // Gray if locked
          const opacity = isUnlocked ? 1 : 0.4;
          
          return (
            <div 
              key={badge.id} 
              className="badge-container" 
              style={{ cursor: 'pointer', opacity, width: '100%', maxWidth: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
              onClick={() => setSelectedBadge({ ...badge, isUnlocked })}
            >
              <div style={{ width: '100%', aspectRatio: '1/1' }}>
                <BadgeIcon badge={badge} isUnlocked={isUnlocked} />
              </div>
              <span className="badge-label" style={{ color: 'var(--text-main)', marginTop: '0.5rem', display: 'block', textAlign: 'center', fontWeight: 'bold', fontSize: '0.85rem' }}>
                {isUnlocked ? badge.label : '???'}
              </span>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedBadge && (
          <motion.div 
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedBadge(null)}
          >
            <motion.div 
              className="quest-detail-modal asset-container"
              onClick={e => e.stopPropagation()}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              style={{ textAlign: 'center', maxWidth: '350px' }}
            >
              <h2 style={{ color: selectedBadge.isUnlocked ? selectedBadge.color : 'var(--ink-light)', marginBottom: '1rem' }}>
                {selectedBadge.isUnlocked ? selectedBadge.label : 'Locked Badge'}
              </h2>
              
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', opacity: selectedBadge.isUnlocked ? 1 : 0.3 }}>
                <selectedBadge.icon size={64} color={selectedBadge.isUnlocked ? selectedBadge.color : '#000'} />
              </div>

              <p style={{ fontWeight: 'bold', color: 'var(--ink-dark)', marginBottom: '0.5rem' }}>
                {selectedBadge.isUnlocked ? 'Requirement Met:' : 'How to unlock:'}
              </p>
              <p style={{ color: 'var(--ink-light)', fontStyle: 'italic', marginBottom: selectedBadge.isUnlocked ? '1.5rem' : '0' }}>
                {selectedBadge.description}
              </p>

              {selectedBadge.isUnlocked && (
                <button 
                  onClick={handlePinToggle}
                  disabled={isPinning}
                  style={{ 
                    width: '100%', padding: '0.8rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    background: isSelectedPinned ? 'var(--konoha-blue)' : 'var(--wood-light)',
                    color: isSelectedPinned ? '#fff' : 'var(--ink-dark)',
                    border: '2px solid var(--ink-dark)'
                  }}
                >
                  <Pin size={18} fill={isSelectedPinned ? '#fff' : 'none'} />
                  {isSelectedPinned ? 'Unpin from Profile' : 'Pin to Profile Showcase'}
                </button>
              )}

              <button className="btn-secondary" onClick={() => setSelectedBadge(null)} style={{ marginTop: '1rem', width: '100%' }}>
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Replacement Warning Modal */}
      <AnimatePresence>
        {showWarning && (
          <motion.div 
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ zIndex: 1100 }}
          >
            <motion.div 
              className="quest-detail-modal asset-container"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{ textAlign: 'center', maxWidth: '300px' }}
            >
              <AlertTriangle size={48} color="var(--konoha-orange)" style={{ margin: '0 auto 1rem auto' }} />
              <h3 style={{ color: 'var(--ink-dark)', marginBottom: '0.5rem' }}>Showcase Full</h3>
              <p style={{ color: 'var(--ink-light)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                You can only showcase 3 badges at a time. Do you want to replace your oldest pinned badge with this one?
              </p>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="btn-secondary" onClick={() => setShowWarning(false)} style={{ flex: 1 }}>Cancel</button>
                <button className="btn-primary" onClick={handleConfirmReplace} disabled={isPinning} style={{ flex: 1, background: 'var(--konoha-orange)', borderColor: 'var(--ink-dark)' }}>Replace</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
