import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  actualTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('light');
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');

  // Get system theme preference
  const getSystemTheme = (): 'light' | 'dark' => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  // Calculate actual theme based on preference
  const calculateActualTheme = (themePreference: Theme): 'light' | 'dark' => {
    if (themePreference === 'system') {
      return getSystemTheme();
    }
    return themePreference;
  };

  // Set theme and update user preferences
  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    // Save to localStorage
    localStorage.setItem('snapfarm-theme', newTheme);
  };

  // Toggle between light and dark (skip system)
  const toggleTheme = () => {
    const newTheme = actualTheme === 'light' ? 'dark' : 'light';
    console.log('Toggling theme from', actualTheme, 'to', newTheme);
    
    // Update state immediately
    setThemeState(newTheme);
    setActualTheme(newTheme);
    
    // Apply theme to DOM immediately
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(newTheme);
    
    // Update meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', newTheme === 'dark' ? '#1f2937' : '#10b981');
    }
    
    // Save preference
    localStorage.setItem('snapfarm-theme', newTheme);
  };

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('snapfarm-theme') as Theme;
    if (savedTheme) {
      setThemeState(savedTheme);
    } else {
      // Default to light theme
      setThemeState('light');
    }
  }, []);

  // Update actual theme when theme preference changes
  useEffect(() => {
    const newActualTheme = calculateActualTheme(theme);
    setActualTheme(newActualTheme);
    
    // Apply theme to document immediately
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(newActualTheme);
    
    // Update meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', newActualTheme === 'dark' ? '#1f2937' : '#10b981');
    }
  }, [theme]);

  // Apply initial theme on mount
  useEffect(() => {
    const initialTheme = calculateActualTheme(theme);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(initialTheme);
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (theme === 'system') {
        const newActualTheme = getSystemTheme();
        setActualTheme(newActualTheme);
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(newActualTheme);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const value: ThemeContextType = {
    theme,
    actualTheme,
    setTheme,
    toggleTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};