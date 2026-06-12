import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { BadgeGrid } from '../components/Badges';
import './QuestBag.css';

export default function QuestBag({ activeQuests, completedQuests, courageCount, stats, onComplete, onAbandon }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('active'); // 'active', 'completed', 'badges'
  const [selectedQuest, setSelectedQuest] = useState(null);

  const truncate = (str, n) => {
    return (str.length > n) ? str.slice(0, n-1) + '...' : str;
  };

  return (
    <div className="bag-container">
      {/* Inventory Tabs */}
      <div className="inventory-tabs">
        <button className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`} onClick={() => setActiveTab('active')}>Active Missions</button>
        <button className={`tab-btn ${activeTab === 'completed' ? 'active' : ''}`} onClick={() => setActiveTab('completed')}>Memories</button>
        <button className={`tab-btn ${activeTab === 'badges' ? 'active' : ''}`} onClick={() => setActiveTab('badges')}>Badges</button>
      </div>



      {/* Tab Content */}
      <div className="tab-content">
        
        {activeTab === 'active' && (
          <div className="active-quests-list">
            <AnimatePresence>
              {activeQuests.map(quest => (
                <motion.div
                  key={quest.id}
                  className="quest-card summary-card asset-container pinned-note"
                  layoutId={`quest-bag-${quest.id}`}
                  onClick={() => setSelectedQuest(quest)}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, x: 100 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <h3 className="quest-title-summary">{quest.title}</h3>
                  <div className={`quest-rarity-row rarity-${quest.rarity?.toLowerCase() || 'common'}`}>
                    <span className="rarity-dot"></span>{quest.rarity || 'Common'} Mission
                  </div>
                  
                  {/* Truncated view for the jist */}
                  <p className="quest-jist" style={{ margin: '0.5rem 0 0 0' }}>{truncate(quest.description, 60)}</p>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {activeQuests.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="empty-bag-state">
                <BookOpen size={80} strokeWidth={1.5} className="empty-bag-icon" />
                <h3>Your journal is empty!</h3>
                <p>A true adventurer never rests for long.</p>
                <button className="btn-primary" onClick={() => navigate('/')}>
                  Check Mission Board
                </button>
              </motion.div>
            )}
          </div>
        )}

        {activeTab === 'completed' && (
          <div className="completed-quests-list">
            {completedQuests.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--ink-dark)', padding: '2rem', fontWeight: 'bold', gridColumn: '1 / -1' }}>No history yet.</div>
            ) : (
              completedQuests.map(quest => (
                <div key={quest.id} className="post-card asset-container" style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 className="quest-title-summary" style={{ textDecoration: 'line-through', color: 'var(--ink-light)', marginBottom: '0.2rem' }}>{quest.title}</h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--ink-light)', fontWeight: 'bold' }}>{new Date(quest.completedAt).toLocaleString()}</p>
                    </div>
                    <span style={{ fontWeight: 800, color: 'var(--konoha-green)', background: 'rgba(56, 161, 105, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>+{quest.xpReward} XP</span>
                  </div>
                  
                  {quest.proofImage && (
                    <div style={{ width: '100%', background: '#000', borderRadius: '6px', overflow: 'hidden' }}>
                      <img src={quest.proofImage} alt="Quest Proof" style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', display: 'block' }} />
                    </div>
                  )}

                  {quest.reflection && (
                    <p style={{ fontStyle: 'italic', color: 'var(--ink-dark)', borderLeft: '4px solid var(--wood-medium)', paddingLeft: '0.8rem', marginTop: '0.5rem', wordBreak: 'break-word', overflowWrap: 'anywhere', minWidth: 0 }}>"{quest.reflection}"</p>
                  )}
                </div>
              ))
            )}
          </div>
        )}

          {activeTab === 'badges' && (
            <BadgeGrid completedQuests={completedQuests} courageCount={courageCount} />
          )}

      </div>

      {/* Detail Modal for Active Quests */}
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
              layoutId={`quest-bag-${selectedQuest.id}`}
              onClick={e => e.stopPropagation()}
            >
              <h3 className="quest-title-full">{selectedQuest.title}</h3>
              
              <div className={`quest-rarity-row rarity-${selectedQuest.rarity?.toLowerCase() || 'common'}`}>
                <span className="rarity-dot"></span>
                {selectedQuest.rarity || 'Common'} Mission
              </div>
              
              <p className="quest-desc-full">{selectedQuest.description}</p>

              <div className="quest-actions" style={{ justifyContent: 'space-between', marginTop: '1.5rem', gap: '0.5rem' }}>
                <button 
                  className="btn-secondary" 
                  style={{ color: '#E53E3E', borderColor: '#E53E3E', boxShadow: '4px 4px 0px #E53E3E', fontSize: '0.9rem' }}
                  onClick={() => {
                    onAbandon(selectedQuest);
                    setSelectedQuest(null);
                  }}
                >
                  Abandon
                </button>
                <button 
                  className="btn-primary" 
                  onClick={() => {
                    onComplete(selectedQuest);
                    setSelectedQuest(null);
                  }}
                >
                  Complete Mission
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
