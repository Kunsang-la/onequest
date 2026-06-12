import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Sparkles, ScrollText } from 'lucide-react';
import './QuestBoard.css';

export default function QuestBoard({ quests, onAccept, isAdmin }) {
  const [selectedQuest, setSelectedQuest] = useState(null);

  const truncate = (str, n) => {
    return (str.length > n) ? str.slice(0, n-1) + '...' : str;
  };

  return (
    <div className="board-container">
      
      <div className="board-header">
        <div className="page-title-banner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ScrollText size={32} />
            Daily Missions
          </div>
          {isAdmin && (
            <button 
              onClick={() => {
                localStorage.removeItem('onequest_daily_assignment');
                window.location.reload();
              }}
              style={{ fontSize: '0.7rem', padding: '0.4rem', background: 'transparent', border: '1px solid var(--wood-medium)', color: 'var(--ink-light)', cursor: 'pointer', borderRadius: '4px' }}
            >
              Dev Reroll
            </button>
          )}
        </div>
        <p className="page-subtitle">"Your personalized quests for today. Check back tomorrow for more!"</p>
      </div>

      <div className="quests-grid">
        <AnimatePresence>
          {quests.map(quest => (
            <motion.div
              key={quest.id}
              className="quest-card summary-card asset-container pinned-note"
              layoutId={`quest-board-${quest.id}`}
              onClick={() => setSelectedQuest(quest)}
              initial={{ opacity: 0, scale: 0.8, rotate: Math.random() * 10 - 5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1, y: -50, transition: { duration: 0.2 } }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <h3 className="quest-title-summary">{quest.title}</h3>
              
              <div className={`quest-rarity-row rarity-${quest.rarity?.toLowerCase() || 'common'}`}>
                <span className="rarity-dot"></span>
                {quest.rarity || 'Common'} Rank
              </div>
              
              <p className="quest-jist">{truncate(quest.description, 60)}</p>
              
              <div className="quest-meta-simple">
                <span style={{ color: 'var(--konoha-green)' }}>+{quest.xpReward} XP</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {quests.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '3rem 1rem', textAlign: 'center', gridColumn: '1 / -1' }}>
            <p style={{ fontWeight: 'bold', color: 'var(--ink-light)', fontSize: '1.2rem' }}>"You've cleared the board for today. Rest well, Adventurer."</p>
          </motion.div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedQuest && (
          <motion.div 
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedQuest(null)}
          >
            <motion.div 
              className="quest-detail-modal asset-container"
              layoutId={`quest-board-${selectedQuest.id}`}
              onClick={e => e.stopPropagation()}
            >
              <h3 className="quest-title-full">{selectedQuest.title}</h3>
              
              <div className={`quest-rarity-row rarity-${selectedQuest.rarity?.toLowerCase() || 'common'}`}>
                <span className="rarity-dot"></span>
                {selectedQuest.rarity || 'Common'} Mission
              </div>
              
              <p className="quest-desc-full">{selectedQuest.description}</p>
              
              <div className="quest-meta-full">
                <div className="meta-group">
                  <div className="meta-item" style={{ color: 'var(--konoha-green)' }}>
                    <Sparkles size={16} />
                    {selectedQuest.xpReward} XP
                  </div>
                </div>
                <div className="meta-item">
                  <Activity size={16} />
                  {selectedQuest.pace}
                </div>
              </div>

              <div className="quest-actions">
                <button className="btn-secondary" onClick={() => setSelectedQuest(null)}>
                  Cancel
                </button>
                <button 
                  className="btn-primary" 
                  onClick={() => {
                    onAccept(selectedQuest);
                    setSelectedQuest(null);
                  }}
                >
                  Accept Mission
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
