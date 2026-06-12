import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchOrCreateProfile(session.user);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchOrCreateProfile(session.user);
      } else {
        setProfile(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchOrCreateProfile = async (user) => {
    try {
      // Try to fetch existing profile
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, generate unique username
        const baseName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'adventurer';
        let base = baseName.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20);
        if (base.length < 3) base = base + '123';
        
        let isUnique = false;
        let currentUsername = base;
        let counter = 1;

        while (!isUnique) {
          const { data: existingUser } = await supabase.from('profiles').select('username').eq('username', currentUsername).maybeSingle();
          if (!existingUser) {
            isUnique = true;
          } else {
            currentUsername = `${base}_${counter}`;
            counter++;
          }
        }

        const newProfile = {
          id: user.id,
          email: user.email,
          username: currentUsername,
          display_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Adventurer',
          avatar_url: user.user_metadata?.avatar_url || '/anime_avatar.png',
          guild_rank: '🌱 New Arrival',
          coins: 0,
          xp: 0,
          is_admin: false
        };

        const { data: createdProfile, error: insertError } = await supabase
          .from('profiles')
          .upsert([newProfile], { onConflict: 'id' })
          .select()
          .single();

        if (insertError) throw insertError;
        setProfile(createdProfile);
      } else if (data) {
        // If the user isn't an admin, check if ANY admins exist. If not, make this user the admin.
        if (!data.is_admin) {
          const { count } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('is_admin', true);
            
          if (count === 0) {
            await supabase.from('profiles').update({ is_admin: true }).eq('id', user.id);
            data.is_admin = true;
          }
        }
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching/creating profile:', error.message);
      alert("CRITICAL ERROR: Failed to create your profile in the database! Reason: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates) => {
    if (!session?.user) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', session.user.id)
        .select();
      
      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error("Database rejected update. You likely need to add an 'UPDATE' policy for the profiles table in Supabase.");
      }
      setProfile(data[0]);
    } catch (error) {
      console.error('Error updating profile:', error.message);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) {
      console.error('Error logging in with Google:', error.message);
      throw error;
    }
  };

  const logout = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error logging out:', error.message);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{ session, profile, user: session?.user, isLoading, loginWithGoogle, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
