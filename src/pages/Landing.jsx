import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sword, Map, Beer, Shield, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Landing.css';

// Google SVG Icon
const GoogleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.88 16.81 15.71 17.59V20.34H19.28C21.36 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4"/>
    <path d="M12 23C14.97 23 17.46 22.02 19.28 20.34L15.71 17.59C14.73 18.25 13.48 18.64 12 18.64C9.13 18.64 6.7 16.7 5.82 14.12H2.15V16.97C3.96 20.56 7.68 23 12 23Z" fill="#34A853"/>
    <path d="M5.82 14.12C5.6 13.46 5.47 12.75 5.47 12C5.47 11.25 5.6 10.54 5.82 9.88V7.03H2.15C1.4 8.52 0.97 10.21 0.97 12C0.97 13.79 1.4 15.48 2.15 16.97L5.82 14.12Z" fill="#FBBC05"/>
    <path d="M12 5.36C13.62 5.36 15.06 5.92 16.2 7.02L19.36 3.86C17.46 2.09 14.97 1 12 1C7.68 1 3.96 3.44 2.15 7.03L5.82 9.88C6.7 7.3 9.13 5.36 12 5.36Z" fill="#EA4335"/>
  </svg>
);

export default function Landing() {
  const { loginWithGoogle } = useAuth();
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [errorMsg, setErrorMsg] = useState('');

  const handleGoogleAuth = async () => {
    setIsProcessing(true);
    setErrorMsg('');
    try {
      await loginWithGoogle();
      // App.jsx will automatically handle the redirect because the session changes
    } catch (error) {
      setErrorMsg(error.message);
      setIsProcessing(false);
    }
  };

  const handleAuth = (e) => {
    e?.preventDefault();
    setErrorMsg("Currently, only 'Continue with Google' is fully supported. Please use the Google button above.");
  };

  return (
    <div className="landing-page">
      
      {/* Top Navbar */}
      <nav className="landing-nav">
        <div className="landing-logo">
          <Sword size={32} color="var(--konoha-orange)" />
          <div>ONE<span>QUEST</span></div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="landing-hero">
        <motion.div 
          className="hero-text"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="hero-headline">
            Turn Your Real Life <span>Into An RPG</span>
          </h1>
          <p className="hero-subheadline">
            Stop procrastinating and start leveling up. OneQuest transforms your daily habits, chores, and goals into epic bounties. Pick up missions, earn XP, and become the ultimate adventurer.
          </p>
        </motion.div>

        <motion.form 
          className="auth-card"
          onSubmit={handleAuth}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="auth-title">{authMode === 'login' ? 'Welcome Back' : 'Begin Journey'}</h2>
          
          <button 
            type="button" 
            className="google-btn" 
            onClick={handleGoogleAuth}
            disabled={isProcessing}
          >
            {isProcessing ? <Loader2 className="spinner" size={24} /> : <GoogleIcon />}
            {isProcessing ? 'Authenticating...' : 'Continue with Google'}
          </button>

          {errorMsg && (
            <div style={{ color: 'red', fontSize: '0.9rem', textAlign: 'center', marginTop: '0.5rem', fontFamily: "'Rubik', sans-serif" }}>
              {errorMsg}
            </div>
          )}

          <div className="auth-divider">OR</div>
          
          <AnimatePresence mode="popLayout">
            {authMode === 'signup' && (
              <motion.div 
                className="auth-input-group"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label>Adventurer Name</label>
                <input 
                  type="text" 
                  className="auth-input" 
                  placeholder="e.g. Naruto Uzumaki"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  required={authMode === 'signup'}
                  disabled={isProcessing}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="auth-input-group">
            <label>Email</label>
            <input 
              type="email" 
              className="auth-input" 
              placeholder="ninja@hiddenleaf.com"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              required
              disabled={isProcessing}
            />
          </div>

          <div className="auth-input-group">
            <label>Password</label>
            <input 
              type="password" 
              className="auth-input" 
              placeholder="••••••••"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
              required
              disabled={isProcessing}
            />
          </div>

          <button type="submit" className="btn-primary auth-btn" disabled={isProcessing}>
            {isProcessing ? <Loader2 className="spinner" style={{ margin: '0 auto' }} /> : (authMode === 'login' ? 'Log In' : 'Sign Up')}
          </button>

          <div className="switch-mode">
            {authMode === 'login' ? (
              <>New here? <span onClick={() => !isProcessing && setAuthMode('signup')}>Create an account</span></>
            ) : (
              <>Already an adventurer? <span onClick={() => !isProcessing && setAuthMode('login')}>Log in</span></>
            )}
          </div>
        </motion.form>
      </main>

      {/* Features Section */}
      <section className="landing-features">
        <div className="features-grid">
          
          <motion.div 
            className="feature-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <div className="feature-icon-wrapper">
              <Map size={40} />
            </div>
            <h3 className="feature-title">The Mission Board</h3>
            <p className="feature-desc">Browse bounties ranging from daily chores to epic long-term goals. Accept missions that challenge you and track your progress in your Satchel.</p>
          </motion.div>

          <motion.div 
            className="feature-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <div className="feature-icon-wrapper">
              <Shield size={40} />
            </div>
            <h3 className="feature-title">Earn XP & Badges</h3>
            <p className="feature-desc">Complete missions to earn Experience Points, level up your adventurer profile, and unlock rare legendary badges for your achievements.</p>
          </motion.div>

          <motion.div 
            className="feature-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <div className="feature-icon-wrapper">
              <Beer size={40} />
            </div>
            <h3 className="feature-title">The Tavern</h3>
            <p className="feature-desc">Relax at the Tavern and see what other adventurers are accomplishing. Share your victories, get inspired, and build camaraderie.</p>
          </motion.div>

        </div>
      </section>

    </div>
  );
}
