import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AppRouter } from './components/AppRouter';
function App() {
  // Simple initialization
  React.useEffect(() => {
    console.log('🚀 SnapFarm app initialized');
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