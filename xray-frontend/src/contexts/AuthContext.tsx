import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (authUserId: string, authEmail: string | null | undefined) => {
    if (!supabase) {
      setUser({
        id: authUserId,
        email: authEmail || '',
        name: authEmail || 'X-Insight User',
        avatar: ''
      });
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('id,email,name,avatar_url')
      .eq('id', authUserId)
      .single();

    if (!error && data) {
      setUser({
        id: data.id,
        email: data.email,
        name: data.name || authEmail || 'X-Insight User',
        avatar: data.avatar_url || ''
      });
      return;
    }

    setUser({
      id: authUserId,
      email: authEmail || '',
      name: authEmail || 'X-Insight User',
      avatar: ''
    });
  };

  useEffect(() => {
    const initializeAuth = async () => {
      if (!supabase) {
        setLoading(false);
        return;
      }

      const { data } = await supabase.auth.getSession();
      const authUser = data.session?.user;
      if (authUser) {
        await loadProfile(authUser.id, authUser.email);
      }
      setLoading(false);
    };

    initializeAuth();

    if (!supabase) {
      return;
    }

    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      if (session?.user) {
        loadProfile(session.user.id, session.user.email);
      } else {
        setUser(null);
      }
    });

    return () => {
      authListener.subscription?.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    if (!supabase) {
      throw new Error('Supabase client is not initialized. Please configure REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY.');
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      throw error;
    }
    return true;
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    if (!supabase) {
      throw new Error('Supabase client is not initialized. Please configure REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY.');
    }
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      throw error;
    }

    if (data.user) {
      await supabase.from('profiles').upsert({ id: data.user.id, email, name });
      return true;
    }

    throw new Error('Unable to create account.');
  };

  const logout = async () => {
    if (!supabase) {
      setUser(null);
      return;
    }
    await supabase.auth.signOut();
    setUser(null);
  };

  const value = {
    user,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}