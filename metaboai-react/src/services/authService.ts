// Local Authentication Service
// Simulates SQLite database using localStorage with proper validation and tokens

import { User, UserPreferences } from '../types';

interface StoredUser {
  id: string;
  email: string;
  passwordHash: string;
  displayName: string;
  photoURL?: string;
  createdAt: number;
  preferences: UserPreferences;
}

interface AuthToken {
  userId: string;
  token: string;
  expiresAt: number;
}

const STORAGE_KEYS = {
  USERS: 'snapfarm_users_db',
  TOKENS: 'snapfarm_auth_tokens',
  CURRENT_TOKEN: 'snapfarm_current_token'
} as const;

const TOKEN_EXPIRY_HOURS = 24 * 7; // 7 days

// Simple hash function (in production, use bcrypt on server)
const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'snapfarm_salt');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// Generate secure token
const generateToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Validate email format
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Get all users from localStorage
const getUsers = (): StoredUser[] => {
  try {
    const users = localStorage.getItem(STORAGE_KEYS.USERS);
    return users ? JSON.parse(users) : [];
  } catch {
    return [];
  }
};

// Save users to localStorage
const saveUsers = (users: StoredUser[]): void => {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
};

// Get auth tokens
const getTokens = (): AuthToken[] => {
  try {
    const tokens = localStorage.getItem(STORAGE_KEYS.TOKENS);
    return tokens ? JSON.parse(tokens) : [];
  } catch {
    return [];
  }
};

// Save auth tokens
const saveTokens = (tokens: AuthToken[]): void => {
  localStorage.setItem(STORAGE_KEYS.TOKENS, JSON.stringify(tokens));
};

// Clean expired tokens
const cleanExpiredTokens = (): void => {
  const tokens = getTokens();
  const now = Date.now();
  const validTokens = tokens.filter(token => token.expiresAt > now);
  saveTokens(validTokens);
};

// Create auth token
const createAuthToken = (userId: string): string => {
  cleanExpiredTokens();
  
  const token = generateToken();
  const expiresAt = Date.now() + (TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);
  
  const tokens = getTokens();
  tokens.push({ userId, token, expiresAt });
  saveTokens(tokens);
  
  localStorage.setItem(STORAGE_KEYS.CURRENT_TOKEN, token);
  return token;
};

// Validate auth token
const validateToken = (token: string): string | null => {
  cleanExpiredTokens();
  
  const tokens = getTokens();
  const authToken = tokens.find(t => t.token === token);
  
  if (authToken && authToken.expiresAt > Date.now()) {
    return authToken.userId;
  }
  
  return null;
};

// Convert StoredUser to User
const toUser = (storedUser: StoredUser): User => ({
  id: storedUser.id,
  email: storedUser.email,
  displayName: storedUser.displayName,
  photoURL: storedUser.photoURL,
  createdAt: storedUser.createdAt,
  preferences: storedUser.preferences
});

export const authService = {
  // Sign up new user
  async signUp(email: string, password: string, displayName: string): Promise<User> {
    if (!isValidEmail(email)) {
      throw new Error('Please enter a valid email address');
    }
    
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }
    
    if (!displayName.trim()) {
      throw new Error('Display name is required');
    }
    
    const users = getUsers();
    
    // Check if email already exists
    if (users.some(user => user.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('An account with this email already exists');
    }
    
    // Create new user
    const passwordHash = await hashPassword(password);
    const newUser: StoredUser = {
      id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      email: email.toLowerCase(),
      passwordHash,
      displayName: displayName.trim(),
      createdAt: Date.now(),
      preferences: {
        theme: 'system',
        notifications: true,
        units: 'metric',
        language: 'en'
      }
    };
    
    users.push(newUser);
    saveUsers(users);
    
    // Create auth token
    createAuthToken(newUser.id);
    
    return toUser(newUser);
  },

  // Sign in existing user
  async signIn(email: string, password: string): Promise<User> {
    if (!isValidEmail(email)) {
      throw new Error('Please enter a valid email address');
    }
    
    const users = getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      throw new Error('No account found with this email address');
    }
    
    const passwordHash = await hashPassword(password);
    if (user.passwordHash !== passwordHash) {
      throw new Error('Incorrect password');
    }
    
    // Create auth token
    createAuthToken(user.id);
    
    return toUser(user);
  },

  // Sign in with Google (mock)
  async signInWithGoogle(): Promise<User> {
    // Simulate Google OAuth
    const email = 'demo@gmail.com';
    const users = getUsers();
    
    let user = users.find(u => u.email === email);
    
    if (!user) {
      // Create new Google user
      user = {
        id: 'google_user_' + Date.now(),
        email,
        passwordHash: '', // No password for OAuth users
        displayName: 'Demo User',
        photoURL: 'https://via.placeholder.com/40',
        createdAt: Date.now(),
        preferences: {
          theme: 'system',
          notifications: true,
          units: 'metric',
          language: 'en'
        }
      };
      
      users.push(user);
      saveUsers(users);
    }
    
    // Create auth token
    createAuthToken(user.id);
    
    return toUser(user);
  },

  // Get current user from token
  async getCurrentUser(): Promise<User | null> {
    const token = localStorage.getItem(STORAGE_KEYS.CURRENT_TOKEN);
    if (!token) return null;
    
    const userId = validateToken(token);
    if (!userId) {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_TOKEN);
      return null;
    }
    
    const users = getUsers();
    const user = users.find(u => u.id === userId);
    
    return user ? toUser(user) : null;
  },

  // Sign out
  async signOut(): Promise<void> {
    const token = localStorage.getItem(STORAGE_KEYS.CURRENT_TOKEN);
    if (token) {
      // Remove token from storage
      const tokens = getTokens();
      const filteredTokens = tokens.filter(t => t.token !== token);
      saveTokens(filteredTokens);
      
      localStorage.removeItem(STORAGE_KEYS.CURRENT_TOKEN);
    }
  },

  // Update user preferences
  async updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<void> {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    users[userIndex].preferences = { ...users[userIndex].preferences, ...preferences };
    saveUsers(users);
  },

  // Check if email exists (for validation)
  async emailExists(email: string): Promise<boolean> {
    const users = getUsers();
    return users.some(user => user.email.toLowerCase() === email.toLowerCase());
  },

  // Get session info
  getSessionInfo(): { isAuthenticated: boolean; expiresAt: number | null } {
    const token = localStorage.getItem(STORAGE_KEYS.CURRENT_TOKEN);
    if (!token) return { isAuthenticated: false, expiresAt: null };
    
    const tokens = getTokens();
    const authToken = tokens.find(t => t.token === token);
    
    if (authToken && authToken.expiresAt > Date.now()) {
      return { isAuthenticated: true, expiresAt: authToken.expiresAt };
    }
    
    return { isAuthenticated: false, expiresAt: null };
  }
};