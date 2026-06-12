import React, { useState, useMemo } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Coins, Sparkles, Camera, UploadCloud, MapPin, CheckCircle2 } from 'lucide-react'
import TopNav from './components/TopNav'
import BottomNav from './components/BottomNav'
import SideNav from './components/SideNav'
import RightSidebar from './components/RightSidebar'
import MissionReportModal from './components/MissionReportModal'
import Landing from './pages/Landing'
import QuestBoard from './pages/QuestBoard'
import TavernFeed from './pages/TavernFeed'
import SearchPage from './pages/SearchPage'
import QuestBag from './pages/QuestBag'
import Profile from './pages/Profile'
import PublicProfile from './pages/PublicProfile'
import AdminDashboard from './pages/AdminDashboard'
import { useAuth } from './context/AuthContext'
import { supabase } from './lib/supabase'
import { calculateProgression } from './lib/rpgLogic'
import { deterministicShuffle } from './lib/prng'
import './index.css'

const INITIAL_QUESTS = [
  { 
    id: 1, 
    title: 'The Solitary Brew', 
    questGiver: 'Guild Master Aris',
    description: 'Several villagers have reported an alarming shortage of brave souls willing to drink coffee alone. Head to the local tavern, secure a table for one, and hold your ground for 15 minutes.', 
    rarity: 'Common', 
    xpReward: 50,
    pace: 'Relaxed' 
  },
  { 
    id: 2, 
    title: 'Expedition into the Wilds', 
    questGiver: 'Ranger Lyra',
    description: 'The ancient paths need patrolling. Take a 30-minute trek in a local park or nature reserve all by yourself. Keep an eye out for interesting flora.', 
    rarity: 'Rare', 
    xpReward: 150,
    pace: 'Active' 
  },
  { 
    id: 3, 
    title: 'The Silent Spectacle', 
    questGiver: 'Bard Jaskier',
    description: 'A traveling troupe is putting on a show, but the front rows are empty! Go to a movie theater and watch a film alone. Appreciate the art without distractions.', 
    rarity: 'Epic', 
    xpReward: 300,
    pace: 'Deep Focus' 
  }
];

function App() {
  const { session, profile, isLoading, updateProfile } = useAuth();
  const [globalQuests, setGlobalQuests] = useState([]);
  const [dailyAssignedIds, setDailyAssignedIds] = useState(null);
  const [activeQuests, setActiveQuests] = useState(() => {
    const saved = localStorage.getItem('onequest_active');
    return saved ? JSON.parse(saved) : [];
  });
  const [completedQuests, setCompletedQuests] = useState([]);
  const [courageCount, setCourageCount] = useState(0);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  
  // Mission Report States
  const [reportingQuest, setReportingQuest] = useState(null);
  const [proofImage, setProofImage] = useState('');
  const [reflection, setReflection] = useState('');
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [isLocating, setIsLocating] = useState(false);

  // Fetch Global Quests
  const fetchGlobalQuests = async () => {
    const { data, error } = await supabase
      .from('quests')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (!error && data) {
      const mappedQuests = data.map(q => ({
        id: q.id,
        title: q.title,
        questGiver: q.quest_giver,
        description: q.description,
        rarity: q.rarity,
        xpReward: q.xp_reward,
        pace: q.pace
      }));
      setGlobalQuests(mappedQuests);
    }
  };

  React.useEffect(() => {
    fetchGlobalQuests();
  }, []);

  // Fetch Quest History on Load
  React.useEffect(() => {
    if (!session?.user) return;
    
    const fetchHistory = async () => {
      if (!session?.user) return;
      
      const { data, error } = await supabase
        .from('user_quests')
        .select('*')
        .eq('user_id', session.user.id)
        .order('completed_at', { ascending: false });

      if (!error && data) {
        // Map database schema back to app UI schema
        const loadedQuests = data.map(q => ({
          id: q.quest_id,
          title: q.quest_title,
          rarity: q.quest_rarity,
          xpReward: q.xp_earned,
          completedAt: q.completed_at,
          proofImage: q.proof_image,
          reflection: q.reflection
        }));
        setCompletedQuests(loadedQuests);
      }
      
      // Fetch courage sent count
      const { count, error: courageError } = await supabase
        .from('post_courage')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.user.id);
        
      if (!courageError) {
        setCourageCount(count || 0);
      }

      setHistoryLoaded(true);
    };
    
    fetchHistory();
  }, [session]);
  
  // Persist Active Quests to LocalStorage
  React.useEffect(() => {
    localStorage.setItem('onequest_active', JSON.stringify(activeQuests));
  }, [activeQuests]);

  // Deterministic Daily Selection (Resets at 3 AM Local Time)
  React.useEffect(() => {
    if (!session?.user || globalQuests.length === 0 || !historyLoaded || dailyAssignedIds) return;
    
    const now = new Date();
    now.setHours(now.getHours() - 3); // Shift by 3 hours so 2 AM counts as yesterday
    const localSeedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    
    // Check if we already have today's assignments locked in
    const savedAssignment = localStorage.getItem('onequest_daily_assignment');
    if (savedAssignment) {
      try {
        const parsed = JSON.parse(savedAssignment);
        if (parsed.date === localSeedDate && parsed.userId === session.user.id) {
          setDailyAssignedIds(parsed.ids);
          return;
        } else {
          // New day has started! Clear yesterday's active quests.
          setActiveQuests([]);
          localStorage.removeItem('onequest_active');
        }
      } catch (e) {
        console.error("Failed to parse saved daily assignment");
      }
    } else {
      // No saved assignment means we are generating for the first time, clear active quests just in case.
      setActiveQuests([]);
      localStorage.removeItem('onequest_active');
    }

    const seedStr = session.user.id + localSeedDate;
    
    // Exclude quests completed before today (simplified: just exclude all completed)
    const uncompleted = globalQuests.filter(gq => !completedQuests.some(cq => cq.id === gq.id));
    
    // Sort and shuffle
    const common = uncompleted.filter(q => q.rarity?.toLowerCase() === 'common');
    const rare = uncompleted.filter(q => q.rarity?.toLowerCase() === 'rare');
    const epicLegendary = uncompleted.filter(q => ['epic', 'legendary'].includes(q.rarity?.toLowerCase()));
    
    const selected = [
      ...deterministicShuffle(common, seedStr).slice(0, 2),
      ...deterministicShuffle(rare, seedStr).slice(0, 1),
      ...deterministicShuffle(epicLegendary, seedStr).slice(0, 1)
    ];
    
    // Fallback if there aren't enough of specific rarities
    if (selected.length < 4) {
       const missing = 4 - selected.length;
       const unused = deterministicShuffle(uncompleted, seedStr).filter(q => !selected.includes(q));
       selected.push(...unused.slice(0, missing));
    }
    
    const ids = selected.map(q => q.id);
    setDailyAssignedIds(ids);
    
    // Lock it in for the day
    localStorage.setItem('onequest_daily_assignment', JSON.stringify({
      date: localSeedDate,
      userId: session.user.id,
      ids: ids
    }));
  }, [globalQuests, historyLoaded, session, dailyAssignedIds, completedQuests]);

  const availableQuests = useMemo(() => {
    if (!dailyAssignedIds) return [];
    return globalQuests.filter(q => 
      dailyAssignedIds.includes(q.id) &&
      !activeQuests.some(aq => aq.id === q.id) &&
      !completedQuests.some(cq => cq.id === q.id)
    );
  }, [globalQuests, dailyAssignedIds, activeQuests, completedQuests]);

  const progression = profile ? calculateProgression(profile.xp) : calculateProgression(0);

  // Create stats object from the Supabase profile if it exists
  const stats = profile ? {
    level: progression.level,
    userName: profile.display_name,
    guildUsername: profile.username || 'adventurer',
    userBio: profile.bio || 'Ready for the next quest!',
    title: progression.rank,
    avatarUrl: profile.avatar_url,
    xp: progression.currentXp,
    requiredXp: progression.requiredXp,
    totalXp: profile.xp,
    isAdmin: profile.is_admin || false,
    streak: 0,
    questsCompleted: profile.quests_completed || 0,
    memberSince: profile.created_at || new Date().toISOString()
  } : {
    level: 1,
    userName: 'Adventurer',
    guildUsername: 'adventurer',
    userBio: 'Ready for the next quest!',
    title: '🌱 New Arrival',
    avatarUrl: '/anime_avatar.png',
    xp: 0,
    requiredXp: 100,
    totalXp: 0,
    isAdmin: false,
    streak: 0,
    questsCompleted: 0,
    memberSince: new Date().toISOString()
  };


  const handleAcceptQuest = (quest) => {
    setActiveQuests([...activeQuests, quest]);
  };

  const handleInitiateCompletion = (quest) => {
    setReportingQuest(quest);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 500;
        const MAX_HEIGHT = 500;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
        } else {
          if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
        setProofImage(dataUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleCheckIn = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        setIsLocating(false);
      },
      (error) => {
        alert("Failed to get location: " + error.message);
        setIsLocating(false);
      }
    );
  };

  const submitReport = (proofImage, reflection) => {
    finalizeCompleteQuest(reportingQuest, proofImage, reflection, null, null);
    // Removed setReportingQuest(null) here so the modal can show its Success screen before closing itself!
  };

  const finalizeCompleteQuest = async (quest, proofImage, reflection, lat, lng) => {
    setActiveQuests(activeQuests.filter(q => q.id !== quest.id));
    setCompletedQuests([{ ...quest, completedAt: new Date().toISOString() }, ...completedQuests]);
    
    if (session?.user) {
      // 1. Insert into history table
      const { error } = await supabase
        .from('user_quests')
        .insert([{
          user_id: session.user.id,
          quest_id: quest.id,
          quest_title: quest.title,
          quest_rarity: quest.rarity,
          xp_earned: quest.xpReward,
          proof_image: proofImage || null,
          reflection: reflection || null,
          latitude: lat || null,
          longitude: lng || null
        }]);
        
      if (error) console.error("Error saving quest history:", error);

      // 2. Grant XP and save to profile database
      if (profile) {
        const newTotalXp = profile.xp + quest.xpReward;
        const newQuestsCount = (profile.quests_completed || 0) + 1;
        await updateProfile({ xp: newTotalXp, quests_completed: newQuestsCount });
      }
    }
  };

  const handleAbandonQuest = (questToAbandon) => {
    setActiveQuests(activeQuests.filter(q => q.id !== questToAbandon.id));
  };

  if (isLoading) {
    return (
      <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#F9FAFB' }}>
        <h2 style={{ fontFamily: "'Kanit', sans-serif", color: 'var(--konoha-blue)' }}>Loading World...</h2>
      </div>
    );
  }

  if (!session) {
    return <Landing />;
  }

  return (
    <Router>
      <div className="app-layout">
        <SideNav stats={stats} />
        
        <div className="main-content">
          <TopNav stats={stats} />
          
          <div style={{ padding: '1rem', paddingBottom: '5rem' }}>
            <Routes>
              <Route path="/" element={<QuestBoard quests={availableQuests} onAccept={handleAcceptQuest} isAdmin={stats.isAdmin} />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/tavern" element={<TavernFeed />} />
              <Route path="/user/:username" element={<PublicProfile />} />
              <Route path="/admin" element={<AdminDashboard stats={stats} onQuestAdded={fetchGlobalQuests} />} />
              <Route path="/journal" element={<QuestBag activeQuests={activeQuests} completedQuests={completedQuests} courageCount={courageCount} stats={stats} onComplete={handleInitiateCompletion} onAbandon={handleAbandonQuest} />} />
              <Route path="/profile" element={<Profile stats={stats} completedQuests={completedQuests} />} />
            </Routes>
          </div>
          
          <BottomNav />
        </div>

        <RightSidebar activeQuests={activeQuests} onComplete={handleInitiateCompletion} />
      </div>

      {/* Global Mission Report Modal */}
      <AnimatePresence>
        {reportingQuest && (
          <MissionReportModal 
            key={`modal-${reportingQuest.id}`}
            reportingQuest={reportingQuest}
            onClose={() => setReportingQuest(null)}
            onSubmit={submitReport}
          />
        )}
      </AnimatePresence>

    </Router>
  )
}

export default App
