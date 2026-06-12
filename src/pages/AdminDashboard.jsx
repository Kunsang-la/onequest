import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Users, Swords, Trash2, PlusCircle, AlertTriangle, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { generateQuestIdea } from '../lib/ai';
import './AdminDashboard.css';

export default function AdminDashboard({ stats, onQuestAdded }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('missions'); // 'missions' or 'roster'
  
  // Mission Control State
  const [quests, setQuests] = useState([]);
  const [isAddingQuest, setIsAddingQuest] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newQuest, setNewQuest] = useState({ title: '', quest_giver: '', description: '', photo_requirement: '', rarity: 'Common', xp_reward: 50, pace: 'Quick Win' });

  // Roster State
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Basic protection (App.jsx also protects this route, but double checking here)
    if (!stats?.isAdmin) {
      navigate('/');
    } else {
      fetchQuests();
      fetchUsers();
    }
  }, [stats]);

  const fetchQuests = async () => {
    const { data } = await supabase.from('quests').select('*').order('created_at', { ascending: false });
    if (data) setQuests(data);
  };

  const fetchUsers = async () => {
    const { data } = await supabase.from('profiles').select('*').order('xp', { ascending: false });
    if (data) setUsers(data);
  };

  const handleAddQuest = async () => {
    let finalDesc = newQuest.description;
    if (newQuest.photo_requirement) {
      finalDesc += `\n\n📸 Photo Requirement: ${newQuest.photo_requirement}`;
    }
    
    const questToSave = {
      title: newQuest.title,
      quest_giver: newQuest.quest_giver,
      description: finalDesc,
      rarity: newQuest.rarity,
      xp_reward: newQuest.xp_reward,
      pace: newQuest.pace
    };

    const { error } = await supabase.from('quests').insert([questToSave]);
    if (!error) {
      setIsAddingQuest(false);
      setNewQuest({ title: '', quest_giver: '', description: '', photo_requirement: '', rarity: 'Common', xp_reward: 50, pace: 'Quick Win' });
      fetchQuests();
      if (onQuestAdded) onQuestAdded();
      alert("Quest dispatched successfully!");
    } else {
      alert("Error adding quest: " + error.message);
    }
  };

  const handleAutoGenerate = async () => {
    setIsGenerating(true);
    try {
      const generatedArray = await generateQuestIdea();
      
      if (!Array.isArray(generatedArray)) {
        throw new Error("AI did not return an array of quests.");
      }

      const questsToInsert = generatedArray.map(q => ({
        title: q.title || 'Mysterious Task',
        quest_giver: q.quest_giver || 'Unknown Stranger',
        description: q.description || '',
        rarity: q.rarity || 'Common',
        xp_reward: q.xp_reward || 50,
        pace: q.pace || 'Quick Win'
      }));

      const { error } = await supabase.from('quests').insert(questsToInsert);

      if (!error) {
        fetchQuests();
        if (onQuestAdded) onQuestAdded();
        alert(`Successfully generated and published ${questsToInsert.length} new quests!`);
        setIsAddingQuest(false); // Close the draft form since we just auto-published
      } else {
        alert("Error saving batch quests: " + error.message);
      }
    } catch (error) {
      alert("Failed to generate quests: " + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteQuest = async (id) => {
    if (window.confirm("Are you sure you want to delete this quest? It will be removed from the global board immediately.")) {
      const { error } = await supabase.from('quests').delete().eq('id', id);
      
      if (error) {
        alert("Failed to delete quest! Error: " + error.message);
        console.error("Delete Quest Error:", error);
      } else {
        fetchQuests();
        if (onQuestAdded) onQuestAdded();
      }
    }
  };

  return (
    <div className="admin-container" style={{ maxWidth: '900px', margin: '0 auto', padding: '1rem' }}>
      
      {/* Admin Header */}
      <div className="admin-header-banner" style={{ background: 'var(--ink-dark)', color: 'white', padding: '2rem', borderRadius: '12px', marginBottom: '2rem', border: '4px solid #E53E3E', position: 'relative', overflow: 'hidden' }}>
        <h1 style={{ fontFamily: "'Kanit', sans-serif", fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#E53E3E', margin: 0 }}>
          <ShieldAlert size={32} />
          Guild Master Dashboard
        </h1>
        <p style={{ opacity: 0.8, marginTop: '0.5rem' }}>With great power comes great responsibility.</p>
        <ShieldAlert size={120} style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.05, transform: 'rotate(15deg)' }} />
      </div>

      {/* Admin Tabs */}
      <div className="admin-tabs" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          className={`admin-tab-btn ${activeTab === 'missions' ? 'active' : ''}`}
          onClick={() => setActiveTab('missions')}
          style={{ flex: 1, padding: '1rem', fontSize: '1.1rem', fontWeight: 'bold', border: '2px solid var(--ink-dark)', borderRadius: '8px', background: activeTab === 'missions' ? 'var(--ink-dark)' : 'white', color: activeTab === 'missions' ? 'white' : 'var(--ink-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
        >
          <Swords size={20} /> Mission Control
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'roster' ? 'active' : ''}`}
          onClick={() => setActiveTab('roster')}
          style={{ flex: 1, padding: '1rem', fontSize: '1.1rem', fontWeight: 'bold', border: '2px solid var(--ink-dark)', borderRadius: '8px', background: activeTab === 'roster' ? 'var(--ink-dark)' : 'white', color: activeTab === 'roster' ? 'white' : 'var(--ink-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
        >
          <Users size={20} /> Guild Roster
        </button>
      </div>

      {/* Tab Content */}
      <div className="admin-content">
        
        {/* Missions Tab */}
        {activeTab === 'missions' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontFamily: "'Kanit', sans-serif" }}>Active Global Quests</h2>
              <button className="btn-primary" onClick={() => setIsAddingQuest(!isAddingQuest)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {isAddingQuest ? 'Cancel' : <><PlusCircle size={18} /> Post New Quest</>}
              </button>
            </div>

            <AnimatePresence>
              {isAddingQuest && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }} 
                  animate={{ height: 'auto', opacity: 1 }} 
                  exit={{ height: 0, opacity: 0 }}
                  style={{ overflow: 'hidden', marginBottom: '2rem' }}
                >
                  <div className="asset-container" style={{ padding: '2rem', background: '#F7FAFC' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h3 style={{ color: 'var(--konoha-orange)', margin: 0 }}>Draft New Mission</h3>
                      <button 
                        onClick={handleAutoGenerate} 
                        disabled={isGenerating}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'linear-gradient(135deg, #ECC94B, #D69E2E)', color: 'white', padding: '0.5rem 1rem', borderRadius: '20px', fontWeight: 'bold', border: '2px solid var(--ink-dark)', boxShadow: '2px 2px 0px var(--ink-dark)', cursor: isGenerating ? 'wait' : 'pointer', opacity: isGenerating ? 0.7 : 1 }}
                      >
                        <Sparkles size={16} />
                        {isGenerating ? 'Consulting the Oracle...' : 'Auto-Generate Batch (10)'}
                      </button>
                    </div>
                    
                    <div style={{ display: 'grid', gap: '1rem', opacity: isGenerating ? 0.5 : 1, pointerEvents: isGenerating ? 'none' : 'auto' }}>
                      <input type="text" placeholder="Quest Title" value={newQuest.title} onChange={e => setNewQuest({...newQuest, title: e.target.value})} style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc' }} />
                      <input type="text" placeholder="Quest Giver (e.g. Village Elder)" value={newQuest.quest_giver} onChange={e => setNewQuest({...newQuest, quest_giver: e.target.value})} style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc' }} />
                      <textarea placeholder="Quest Description" value={newQuest.description} onChange={e => setNewQuest({...newQuest, description: e.target.value})} style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc', minHeight: '100px' }} />
                      <input type="text" placeholder="Photo Requirement (e.g. Snap a pic of your clean desk)" value={newQuest.photo_requirement} onChange={e => setNewQuest({...newQuest, photo_requirement: e.target.value})} style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc' }} />
                      
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <select value={newQuest.rarity} onChange={e => setNewQuest({...newQuest, rarity: e.target.value})} style={{ flex: 1, padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc' }}>
                          <option value="Common">Common</option>
                          <option value="Rare">Rare</option>
                          <option value="Epic">Epic</option>
                          <option value="Legendary">Legendary</option>
                        </select>
                        <input type="number" placeholder="XP Reward" value={newQuest.xp_reward} onChange={e => setNewQuest({...newQuest, xp_reward: parseInt(e.target.value)})} style={{ flex: 1, padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc' }} />
                        <input type="text" placeholder="Pace (e.g. Quick Win, Relaxed, Deep Focus)" value={newQuest.pace} onChange={e => setNewQuest({...newQuest, pace: e.target.value})} style={{ flex: 1, padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc' }} />
                      </div>
                      
                      <button className="btn-primary" onClick={handleAddQuest} style={{ marginTop: '0.5rem', padding: '1rem', fontSize: '1.1rem' }}>Publish to Mission Board</button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="admin-quest-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {quests.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '8px', border: '2px dashed var(--wood-light)' }}>No active quests on the board.</div>
              ) : (
                <div className="asset-container" style={{ overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: 'var(--wood-light)' }}>
                      <tr>
                        <th style={{ padding: '1rem', borderBottom: '2px solid var(--wood-medium)' }}>Title</th>
                        <th style={{ padding: '1rem', borderBottom: '2px solid var(--wood-medium)' }}>Rarity</th>
                        <th style={{ padding: '1rem', borderBottom: '2px solid var(--wood-medium)' }}>Pace</th>
                        <th style={{ padding: '1rem', borderBottom: '2px solid var(--wood-medium)' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quests.map(quest => (
                        <tr key={quest.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                          <td style={{ padding: '1rem' }}>{quest.title}</td>
                          <td style={{ padding: '1rem' }}><span className={`rarity-badge rarity-${quest.rarity.toLowerCase()}`}>{quest.rarity}</span></td>
                          <td style={{ padding: '1rem' }}>{quest.pace}</td>
                          <td style={{ padding: '1rem' }}>
                            <button onClick={() => handleDeleteQuest(quest.id)} style={{ color: '#E53E3E', background: '#FED7D7', padding: '0.5rem', borderRadius: '4px' }}>
                              <Trash2 size={20} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Roster Tab */}
        {activeTab === 'roster' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontFamily: "'Kanit', sans-serif", margin: 0 }}>Registered Adventurers</h2>
              <div style={{ background: 'var(--wood-light)', padding: '0.4rem 1rem', borderRadius: '20px', fontWeight: 'bold', color: 'var(--ink-dark)', border: '2px solid var(--wood-medium)' }}>
                Total: {users.length}
              </div>
            </div>
            <div className="asset-container" style={{ overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ background: 'var(--wood-light)' }}>
                  <tr>
                    <th style={{ padding: '1rem', borderBottom: '2px solid var(--wood-medium)' }}>Adventurer</th>
                    <th style={{ padding: '1rem', borderBottom: '2px solid var(--wood-medium)' }}>Total XP</th>
                    <th style={{ padding: '1rem', borderBottom: '2px solid var(--wood-medium)' }}>Quests Done</th>
                    <th style={{ padding: '1rem', borderBottom: '2px solid var(--wood-medium)' }}>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--wood-light)' }}>
                      <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <img src={u.avatar_url || '/anime_avatar.png'} alt="avatar" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                        <div>
                          <div style={{ fontWeight: 'bold' }}>{u.display_name}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--ink-light)' }}>@{u.username}</div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem', fontWeight: 'bold', color: 'var(--konoha-blue)' }}>{u.xp}</td>
                      <td style={{ padding: '1rem' }}>{u.quests_completed || 0}</td>
                      <td style={{ padding: '1rem' }}>
                        {u.is_admin ? <span style={{ background: '#FED7D7', color: '#C53030', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>Admin</span> : 'User'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
