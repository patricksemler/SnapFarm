import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AppRouter } from './components/AppRouter';
import { fileAuthService } from './services/fileAuthService';

function App() {
  // Initialize app data on load
  React.useEffect(() => {
    const initializeApp = async () => {
      // Clear old localStorage data for fresh start
      localStorage.removeItem('snapfarm_diagnoses');
      localStorage.removeItem('snapfarm_chat_history');
      localStorage.removeItem('snapfarm_metrics');
      
      // Clear old auth data from previous localStorage system
      localStorage.removeItem('snapfarm_users_db');
      localStorage.removeItem('snapfarm_auth_tokens');
      localStorage.removeItem('snapfarm_current_token');
      
      console.log('🧹 Cleared old data for fresh start');
      
      // Initialize test user data
      try {
        await fileAuthService.initializeTestData();
      } catch (error) {
        console.error('Failed to initialize test data:', error);
      }
    };

    initializeApp();
  }, []);

  return (
    <AuthProvider>
      <ThemeProvider>
        <AppRouter />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;