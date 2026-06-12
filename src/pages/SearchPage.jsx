import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Compass, Users, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import './SearchPage.css';

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [suggestedUsers, setSuggestedUsers] = useState([]);

  // Fetch random suggestions when the page loads
  useEffect(() => {
    const fetchSuggestions = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('display_name, username, avatar_url, xp')
        .order('xp', { ascending: false })
        .limit(10);
      
      if (data) setSuggestedUsers(data);
    };
    fetchSuggestions();
  }, []);

  // Debounced search query
  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.trim().length < 2) {
        setResults([]);
        setIsSearching(false);
        return;
      }
      setIsSearching(true);
      const { data } = await supabase
        .from('profiles')
        .select('display_name, username, avatar_url, xp')
        .or(`display_name.ilike.%${searchQuery}%,username.ilike.%${searchQuery}%`)
        .limit(20);
      
      if (data) setResults(data);
      setIsSearching(false);
    };
    
    const timeoutId = setTimeout(searchUsers, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const renderUserRow = (user) => (
    <motion.div 
      key={user.username}
      className="user-list-row"
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      onClick={() => navigate(`/user/${user.username}`)}
    >
      <img src={user.avatar_url || '/anime_avatar.png'} alt="Avatar" className="row-avatar" />
      <div className="row-info">
        <div className="row-name">{user.display_name}</div>
        <div className="row-username">@{user.username}</div>
      </div>
      <div className="row-xp">
        <Sparkles size={12} style={{ marginRight: '4px' }} /> {user.xp} XP
      </div>
    </motion.div>
  );

  return (
    <div className="search-page-container">
      
      {/* Floating Search Input (Styled like a Quest Card) */}
      <div className="search-input-wrapper quest-card summary-card asset-container" style={{ margin: '1rem auto 2rem auto', padding: '1.5rem', cursor: 'default', transform: 'none' }}>
        <h3 className="quest-title-summary" style={{ marginBottom: '1rem', textAlign: 'center', fontSize: '1.3rem' }}>Search Adventurers</h3>
        <div style={{ position: 'relative' }}>
          <input 
            type="text" 
            placeholder="Type a name or username..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input-field"
            style={{ borderRadius: '8px', border: '2px solid var(--wood-medium)' }}
          />
          <Search size={22} className="search-input-icon" />
        </div>
      </div>

      {/* Content Area */}
      <div>
        {searchQuery.trim().length >= 2 ? (
          <>
            <h3 className="section-label" style={{ fontSize: '1.2rem' }}>
              <Search size={18} color="var(--konoha-orange)" /> Search Results
            </h3>
            {isSearching ? (
              <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--ink-light)' }}>Scouting the realms...</div>
            ) : results.length > 0 ? (
              <div className="user-list-container">
                <AnimatePresence>
                  {results.map(renderUserRow)}
                </AnimatePresence>
              </div>
            ) : (
              <div className="empty-search-state">
                <h3>No adventurers found</h3>
                <p>Try searching for a different name or handle.</p>
              </div>
            )}
          </>
        ) : (
          <>
            <h3 className="section-label" style={{ fontSize: '1.2rem' }}>
              <Users size={18} color="var(--konoha-blue)" /> Top Adventurers
            </h3>
            {suggestedUsers.length > 0 ? (
              <div className="user-list-container">
                <AnimatePresence>
                  {suggestedUsers.map(renderUserRow)}
                </AnimatePresence>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--ink-light)' }}>Loading the registry...</div>
            )}
          </>
        )}
      </div>

    </div>
  );
}
