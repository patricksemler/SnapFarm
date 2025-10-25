import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export const AuthDebug: React.FC = () => {
  const { user, loading, error } = useAuth();

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-2 rounded text-xs font-mono z-50">
      <div>Loading: {loading ? 'true' : 'false'}</div>
      <div>User: {user ? user.email : 'null'}</div>
      <div>Error: {error || 'null'}</div>
    </div>
  );
};