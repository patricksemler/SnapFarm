import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthState, UserPreferences } from '../types';
import { simpleAuthService } from '../services/simpleAuthService';

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserPreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Default preferences removed - not used in current implementation

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Start with loading: true to check for existing session
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  });

  // Check for existing session on mount
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        console.log('🔍 Checking for existing session...');
        const user = await simpleAuthService.getCurrentUser();
        if (user) {
          console.log('✅ Restored session for:', user.email);
          setAuthState({
            user,
            loading: false,
            error: null
          });
        } else {
          console.log('👤 No existing session found');
          setAuthState({
            user: null,
            loading: false,
            error: null
          });
        }
      } catch (error) {
        console.error('❌ Error checking session:', error);
        setAuthState({
          user: null,
          loading: false,
          error: null
        });
      }
    };

    checkExistingSession();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔐 AuthContext: Starting sign in for', email);
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const user = await simpleAuthService.signIn(email, password);
      console.log('✅ AuthContext: Sign in successful for', user.email);
      
      setAuthState({
        user,
        loading: false,
        error: null
      });
    } catch (error: any) {
      console.error('❌ AuthContext: Sign in failed:', error.message);
      setAuthState(prev => ({ ...prev, error: error.message, loading: false }));
      throw error;
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      console.log('📝 AuthContext: Starting sign up for', email);
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const user = await simpleAuthService.signUp(email, password, displayName);
      console.log('✅ AuthContext: Sign up successful for', user.email);
      
      setAuthState({
        user,
        loading: false,
        error: null
      });
    } catch (error: any) {
      console.error('❌ AuthContext: Sign up failed:', error.message);
      setAuthState(prev => ({ ...prev, error: error.message, loading: false }));
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      console.log('🔐 AuthContext: Starting Google sign in');
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const user = await simpleAuthService.signInWithGoogle();
      console.log('✅ AuthContext: Google sign in successful');
      
      setAuthState({
        user,
        loading: false,
        error: null
      });
    } catch (error: any) {
      console.error('❌ AuthContext: Google sign in failed:', error.message);
      setAuthState(prev => ({ ...prev, error: error.message, loading: false }));
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 AuthContext: Starting logout');
      await simpleAuthService.signOut();
      setAuthState({
        user: null,
        loading: false,
        error: null
      });
      console.log('✅ AuthContext: Logout successful');
    } catch (error: any) {
      console.error('❌ AuthContext: Logout failed:', error.message);
      setAuthState(prev => ({ ...prev, error: error.message }));
      throw error;
    }
  };

  const updateUserPreferences = async (preferences: Partial<UserPreferences>) => {
    if (!authState.user) return;

    try {
      await simpleAuthService.updateUserPreferences(authState.user.id, preferences);
      
      const updatedPreferences = { ...authState.user.preferences, ...preferences };
      
      setAuthState(prev => ({
        ...prev,
        user: prev.user ? { ...prev.user, preferences: updatedPreferences } : null
      }));
    } catch (error: any) {
      console.error('Failed to update preferences:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    ...authState,
    signIn,
    signUp,
    signInWithGoogle,
    logout,
    updateUserPreferences
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};