
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  sendOTP: (email: string) => Promise<{ error: any; otp?: string }>;
  verifyOTP: (email: string, otp: string) => Promise<{ error: any }>;
  isOTPVerified: (email: string) => boolean;
  clearOTPData: () => void;
  updatePassword: (newPassword: string) => Promise<{ error: any }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile
          setTimeout(async () => {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            setProfile(profileData);
          }, 0);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: fullName ? { full_name: fullName } : undefined
      }
    });
    
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    const redirectUrl = `${window.location.origin}/reset-password`;
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl
    });
    
    return { error };
  };

  const sendOTP = async (email: string) => {
    try {
      // Use password recovery flow to send OTP for password reset
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: undefined, // Don't set redirectTo to get OTP instead of magic link
      });
      
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const verifyOTP = async (email: string, otp: string) => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email,
        token: otp,
        type: 'recovery' // Use 'recovery' type for password reset OTP
      });
      
      if (error) {
        return { error };
      }
      
      // Store verification in localStorage for password reset flow
      localStorage.setItem('otp_verified', JSON.stringify({
        email: email,
        verifiedAt: Date.now(),
        session: data.session
      }));
      
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const isOTPVerified = (email: string) => {
    try {
      const verifiedData = localStorage.getItem('otp_verified');
      if (!verifiedData) return false;
      
      const data = JSON.parse(verifiedData);
      // Check if verification is still valid (10 minutes)
      return data.email === email && (Date.now() - data.verifiedAt) < (10 * 60 * 1000);
    } catch {
      return false;
    }
  };

  const clearOTPData = () => {
    localStorage.removeItem('otp_verified');
  };

  const updatePassword = async (newPassword: string) => {
    try {
      // Get the session from OTP verification
      const verifiedData = localStorage.getItem('otp_verified');
      if (!verifiedData) {
        return { error: new Error('No verified session found. Please verify your OTP first.') };
      }
      
      const data = JSON.parse(verifiedData);
      if (!data.session) {
        return { error: new Error('Invalid session. Please verify your OTP again.') };
      }
      
      // Set the session first
      const { error: sessionError } = await supabase.auth.setSession(data.session);
      if (sessionError) {
        return { error: sessionError };
      }
      
      // Update password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('No user logged in') };

    const { error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (!error && profile) {
      setProfile({ ...profile, ...updates });
    }

    return { error };
  };

  const value = {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    sendOTP,
    verifyOTP,
    isOTPVerified,
    clearOTPData,
    updatePassword,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
