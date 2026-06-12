import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Beer } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import './TavernFeed.css';

function PostCard({ post, session }) {
  const initialLiked = post.post_courage?.some(c => c.user_id === session?.user?.id);
  const initialCount = post.post_courage?.length || 0;
  
  const [courage, setCourage] = useState(initialCount);
  const [hasLiked, setHasLiked] = useState(initialLiked);
  const [sparks, setSparks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendCourage = async () => {
    if (!session?.user || isLoading) return;
    setIsLoading(true);

    if (hasLiked) {
      // Unlike
      setCourage(c => Math.max(0, c - 1));
      setHasLiked(false);
      
      await supabase
        .from('post_courage')
        .delete()
        .match({ post_id: post.id, user_id: session.user.id });
        
    } else {
      // Like
      setCourage(c => c + 1);
      setHasLiked(true);
      
      const newSpark = { id: Date.now() };
      setSparks(current => [...current, newSpark]);
      setTimeout(() => {
        setSparks(current => current.filter(s => s.id !== newSpark.id));
      }, 1000);
      
      await supabase
        .from('post_courage')
        .insert([{ post_id: post.id, user_id: session.user.id }]);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="post-card asset-container">
      <div className="post-header">
        <Link to={`/user/${post.profiles?.username}`} className="avatar-container" style={{ textDecoration: 'none' }}>
          <img src={post.profiles?.avatar_url || '/anime_avatar.png'} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
        </Link>
        <div>
          <Link to={`/user/${post.profiles?.username}`} style={{ textDecoration: 'none' }}>
            <p className="post-user" style={{ cursor: 'pointer' }}>{post.profiles?.display_name || 'Unknown Adventurer'}</p>
          </Link>
          <p className="post-meta">Completed: {post.quest_title} • {new Date(post.completed_at).toLocaleString()}</p>
        </div>
      </div>

      {post.proof_image && (
        <div className="proof-container">
          <img src={post.proof_image} alt="Quest Proof" className="proof-image" />
        </div>
      )}

      {post.reflection && (
        <p className="post-reflection" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere', minWidth: 0 }}>"{post.reflection}"</p>
      )}

      <div className="post-actions">
        <button 
          className="courage-btn" 
          onClick={handleSendCourage}
          disabled={isLoading}
          style={{ 
            background: hasLiked ? 'rgba(255, 112, 0, 0.1)' : 'transparent',
            borderColor: hasLiked ? 'var(--konoha-orange)' : 'var(--wood-medium)',
            color: hasLiked ? 'var(--konoha-orange)' : 'var(--ink-light)'
          }}
        >
          <Sparkles size={18} fill={hasLiked ? 'var(--konoha-orange)' : 'none'} />
          {hasLiked ? 'Courage Sent' : 'Send Courage'} ({courage})
        </button>

        <div className="sparks-container">
          <AnimatePresence>
            {sparks.map(spark => (
              <motion.div
                key={spark.id}
                initial={{ opacity: 1, y: 0, scale: 0.5 }}
                animate={{ opacity: 0, y: -50, scale: 1.5 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={{ position: 'absolute', color: 'var(--konoha-orange)' }}
              >
                <Sparkles size={24} fill="var(--konoha-orange)" />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default function TavernFeed() {
  const { session } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeed = async () => {
      let query = supabase
        .from('user_quests')
        .select(`
          *,
          profiles (display_name, avatar_url, username),
          post_courage (user_id)
        `)
        .not('proof_image', 'is', null)
        .order('completed_at', { ascending: false });
        
      if (session?.user?.id) {
        query = query.neq('user_id', session.user.id);
      }

      const { data, error } = await query;
        
      if (!error && data) {
        setPosts(data);
      }
      setLoading(false);
    };

    fetchFeed();
  }, []);

  return (
    <div className="tavern-container">
      <div className="tavern-header" style={{ marginBottom: '2rem' }}>
        <div className="page-title-banner">
          <Beer size={32} />
          The Tavern
        </div>
        <p className="page-subtitle">Celebrate victories and send courage to fellow questers.</p>
      </div>

      <div className="feed-list">
        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--ink-light)' }}>Loading the tavern bulletin...</p>
        ) : posts.length > 0 ? (
          posts.map(post => (
            <PostCard key={post.id} post={post} session={session} />
          ))
        ) : (
          <div style={{ 
            gridColumn: '1 / -1', 
            maxWidth: '600px', 
            margin: '2rem auto', 
            textAlign: 'center', 
            padding: '4rem 2rem', 
            background: 'rgba(0,0,0,0.02)', 
            borderRadius: '12px', 
            border: '2px dashed var(--ink-light)' 
          }}>
            <p style={{ fontWeight: 'bold', color: 'var(--ink-dark)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>The tavern wall is empty.</p>
            <p style={{ color: 'var(--ink-light)', fontSize: '0.95rem' }}>Be the first to complete a quest and post a Mission Report!</p>
          </div>
        )}
      </div>
    </div>
  );
}
