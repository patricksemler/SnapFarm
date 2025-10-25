import React, { createContext, useContext, useState } from 'react';
import { User } from '../types';

interface MinimalAuthState {
  user: User | null;
  loading: boolean;
}

interface MinimalAuthContextType extends MinimalAuthState {
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
}

const MinimalAuthContext = createContext<MinimalAuthContextType | undefined>(undefined);

export const useMinimalAuth = () => {
  const context = useContext(MinimalAuthContext);
  if (context === undefined) {
    throw new Error('useMinimalAuth must be used within a MinimalAuthProvider');
  }
  return context;
};

export const MinimalAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Always start with loading: false to prevent loading screen
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const value: MinimalAuthContextType = {
    user,
    loading,
    setUser,
    setLoading
  };

  return (
    <MinimalAuthContext.Provider value={value}>
      {children}
    </MinimalAuthContext.Provider>
  );
};