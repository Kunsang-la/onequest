import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import './RightSidebar.css';

export default function RightSidebar({ activeQuests, onComplete }) {
  const location = useLocation();

  if (location.pathname === '/journal') {
    return null;
  }

  return (
    <aside className="right-sidebar">
      <div className="right-sidebar-header">
        Ongoing Quests
      </div>

      <div className="mini-quest-list">
        <AnimatePresence>
          {activeQuests.map(quest => (
            <motion.div
              key={quest.id}
              className="mini-quest-card"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <h4 className="mini-quest-title">{quest.title}</h4>
              <div className="mini-quest-meta">
                +{quest.xpReward} XP
              </div>
              <button 
                className="btn-primary" 
                style={{ width: '100%', padding: '0.4rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                onClick={() => onComplete(quest)}
              >
                <CheckCircle2 size={16} /> Finish
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {activeQuests.length === 0 && (
          <div className="empty-sidebar">
            No active quests.<br/>Check the Mission Board!
          </div>
        )}
      </div>
    </aside>
  );
}
