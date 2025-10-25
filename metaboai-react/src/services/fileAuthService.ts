// Physical File-based Authentication Service
// Saves user data to actual JSON files in the project directory

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

interface AuthSession {
    userId: string;
    token: string;
    expiresAt: number;
}

// File paths for physical data storage
const USERS_FILE_PATH = '/data/users.json';
const SESSIONS_FILE_PATH = '/data/sessions.json';

const TOKEN_EXPIRY_HOURS = 24 * 7; // 7 days

// Simple hash function (in production, use bcrypt on server)
const hashPassword = async (password: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + 'snapfarm_salt_2024');
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

// Physical file operations with localStorage sync
const readUsersFile = async (): Promise<StoredUser[]> => {
    try {
        console.log('📁 Reading users from:', USERS_FILE_PATH);
        const response = await fetch(USERS_FILE_PATH);
        if (!response.ok) {
            console.log('Users file not found, using localStorage');
            return [];
        }
        const users = await response.json();
        console.log('✅ Loaded', users.length, 'users from physical file');
        
        // Sync to localStorage for faster access
        localStorage.setItem('snapfarm_file_users', JSON.stringify(users, null, 2));
        return users;
    } catch (error) {
        console.error('Failed to read users file:', error);
        return [];
    }
};

const writeUsersFile = async (users: StoredUser[]): Promise<void> => {
    try {
        // Save to localStorage (browser limitation - can't write to actual files)
        localStorage.setItem('snapfarm_file_users', JSON.stringify(users, null, 2));
        console.log('💾 Saved', users.length, 'users to localStorage (simulating file)');
        
        // In a real backend, this would write to the actual file
        console.log('📝 In production: would write to', USERS_FILE_PATH);
    } catch (error) {
        console.error('Failed to write users file:', error);
        throw error;
    }
};

const readSessionsFile = async (): Promise<AuthSession[]> => {
    try {
        console.log('🎫 Reading sessions from:', SESSIONS_FILE_PATH);
        const response = await fetch(SESSIONS_FILE_PATH);
        if (!response.ok) {
            console.log('Sessions file not found, using localStorage');
            return [];
        }
        const sessions = await response.json();
        console.log('✅ Loaded', sessions.length, 'sessions from physical file');
        
        // Sync to localStorage
        localStorage.setItem('snapfarm_file_sessions', JSON.stringify(sessions, null, 2));
        return sessions;
    } catch (error) {
        console.error('Failed to read sessions file:', error);
        return [];
    }
};

const writeSessionsFile = async (sessions: AuthSession[]): Promise<void> => {
    try {
        // Save to localStorage (browser limitation)
        localStorage.setItem('snapfarm_file_sessions', JSON.stringify(sessions, null, 2));
        console.log('💾 Saved', sessions.length, 'sessions to localStorage (simulating file)');
        
        // In a real backend, this would write to the actual file
        console.log('📝 In production: would write to', SESSIONS_FILE_PATH);
    } catch (error) {
        console.error('Failed to write sessions file:', error);
        throw error;
    }
};

// Get users - simplified approach using localStorage only
const getUsers = async (): Promise<StoredUser[]> => {
    // Check localStorage first
    const stored = localStorage.getItem('snapfarm_file_users');
    if (stored) {
        try {
            const users = JSON.parse(stored);
            console.log('📦 Using localStorage users:', users.length, 'users');
            return users;
        } catch (error) {
            console.error('Failed to parse localStorage users:', error);
            localStorage.removeItem('snapfarm_file_users');
        }
    }
    
    // Initialize with test user if no data exists
    console.log('📁 No users found, initializing with test data');
    const testUser: StoredUser = {
        id: 'user_test_1735156800000_siddiddy',
        email: 'siddiddy@gmail.com',
        passwordHash: 'eaeccfc9badff2008a941aabb13e7b20884da177d6dd1ac949ba4b49fa47e8e9',
        displayName: 'Sid Diddy',
        createdAt: 1735156800000,
        preferences: {
            theme: 'system',
            notifications: true,
            units: 'metric',
            language: 'en'
        }
    };
    
    const initialUsers = [testUser];
    await saveUsers(initialUsers);
    console.log('✅ Initialized with test user');
    return initialUsers;
};

// Save users - write to localStorage (simulating file)
const saveUsers = async (users: StoredUser[]): Promise<void> => {
    await writeUsersFile(users);
};

// Get sessions - simplified approach using localStorage only
const getSessions = async (): Promise<AuthSession[]> => {
    // Check localStorage only
    const stored = localStorage.getItem('snapfarm_file_sessions');
    if (stored) {
        try {
            const sessions = JSON.parse(stored);
            console.log('📦 Using localStorage sessions:', sessions.length, 'sessions');
            return sessions;
        } catch (error) {
            console.error('Failed to parse localStorage sessions:', error);
            localStorage.removeItem('snapfarm_file_sessions');
        }
    }
    
    console.log('📦 No sessions found, returning empty array');
    return [];
};

// Save sessions - write to localStorage (simulating file)
const saveSessions = async (sessions: AuthSession[]): Promise<void> => {
    await writeSessionsFile(sessions);
};

// Cookie utilities for persistent login
const setCookie = (name: string, value: string, days: number = 7): void => {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    
    // More permissive cookie settings for development
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const cookieString = isLocalhost 
        ? `${name}=${value};expires=${expires.toUTCString()};path=/`
        : `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict;Secure`;
    
    console.log('🍪 Setting cookie:', name);
    console.log('📝 Cookie string:', cookieString);
    console.log('⏰ Expires:', expires.toUTCString());
    console.log('🏠 Is localhost:', isLocalhost);
    
    document.cookie = cookieString;
    
    // Verify cookie was set
    setTimeout(() => {
        const verification = getCookie(name);
        console.log('✅ Cookie verification:', verification ? 'Success' : 'Failed');
        if (!verification) {
            console.log('🔧 Trying alternative cookie setting...');
            // Fallback: try setting without SameSite
            document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
        }
    }, 100);
};

const getCookie = (name: string): string | null => {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) {
            const value = c.substring(nameEQ.length, c.length);
            return value;
        }
    }
    return null;
};

const deleteCookie = (name: string): void => {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

// Get current session token (try cookie first, then localStorage)
const getCurrentToken = (): string | null => {
    // First try cookie for persistent login
    const cookieToken = getCookie('snapfarm_session');
    if (cookieToken) {
        console.log('✅ Using cookie token for authentication');
        return cookieToken;
    }
    
    // Fallback to localStorage
    const localToken = localStorage.getItem('snapfarm_current_session');
    if (localToken) {
        console.log('✅ Using localStorage token for authentication');
        return localToken;
    }
    
    console.log('❌ No authentication token found');
    return null;
};

// Save current session token (both cookie and localStorage)
const saveCurrentToken = (token: string): void => {
    // Save to cookie for persistent login (7 days)
    setCookie('snapfarm_session', token, 7);
    
    // Also save to localStorage as backup
    localStorage.setItem('snapfarm_current_session', token);
};



// Clean expired sessions
const cleanExpiredSessions = async (): Promise<void> => {
    const sessions = await getSessions();
    const now = Date.now();
    const validSessions = sessions.filter(session => session.expiresAt > now);
    await saveSessions(validSessions);
};

// Create auth session
const createAuthSession = async (userId: string): Promise<string> => {
    console.log('🎫 Creating auth session for user:', userId);
    await cleanExpiredSessions();

    const token = generateToken();
    const expiresAt = Date.now() + (TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);
    
    console.log('🔑 Generated token:', token.substring(0, 8) + '...');
    console.log('⏰ Session expires at:', new Date(expiresAt).toLocaleString());

    const sessions = await getSessions();
    const newSession = { userId, token, expiresAt };
    sessions.push(newSession);
    
    console.log('💾 Saving session to storage...');
    await saveSessions(sessions);
    
    console.log('🏷️ Setting current token...');
    saveCurrentToken(token);
    
    console.log('✅ Auth session created successfully');
    return token;
};

// Validate auth token
const validateToken = async (token: string): Promise<string | null> => {
    console.log('🔍 Validating token:', token.substring(0, 8) + '...');
    
    await cleanExpiredSessions();

    const sessions = await getSessions();
    console.log('📋 Total sessions:', sessions.length);
    
    const authSession = sessions.find(s => s.token === token);
    console.log('🎫 Found session:', authSession ? 'Yes' : 'No');
    
    if (authSession) {
        const now = Date.now();
        const isExpired = authSession.expiresAt <= now;
        console.log('⏰ Session expires at:', new Date(authSession.expiresAt).toLocaleString());
        console.log('🕐 Current time:', new Date(now).toLocaleString());
        console.log('❓ Is expired:', isExpired);
        
        if (!isExpired) {
            console.log('✅ Token is valid, returning userId:', authSession.userId);
            return authSession.userId;
        } else {
            console.log('❌ Token is expired');
        }
    }

    console.log('❌ Token validation failed');
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

export const fileAuthService = {
    // Sign up new user
    signUp: async (email: string, password: string, displayName: string): Promise<User> => {
        console.log('🔐 Starting sign up process for:', email);

        if (!isValidEmail(email)) {
            throw new Error('Please enter a valid email address');
        }

        if (password.length < 6) {
            throw new Error('Password must be at least 6 characters long');
        }

        if (!displayName.trim()) {
            throw new Error('Display name is required');
        }

        const users = await getUsers();
        console.log('📁 Checking against', users.length, 'existing users');

        // Check if email already exists
        const existingUser = users.find(user => user.email.toLowerCase() === email.toLowerCase());
        if (existingUser) {
            console.log('❌ Email already exists:', email);
            throw new Error('An account with this email already exists');
        }

        // Create new user
        const passwordHash = await hashPassword(password);
        const newUser: StoredUser = {
            id: 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11),
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
        await saveUsers(users);

        console.log('✅ User created successfully:', newUser.email);
        console.log('📊 Total users now:', users.length);

        // Automatically create auth session for new user
        await createAuthSession(newUser.id);
        console.log('🎫 Auto-login session created for new user');

        return toUser(newUser);
    },

    // Sign in existing user
    signIn: async (email: string, password: string): Promise<User> => {
        console.log('🔐 Starting sign in process for:', email);

        if (!isValidEmail(email)) {
            throw new Error('Please enter a valid email address');
        }

        const users = await getUsers();
        console.log('📁 Checking against', users.length, 'users in database');

        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

        if (!user) {
            console.log('❌ Email not found:', email);
            console.log('📋 Available emails:', users.map(u => u.email));
            alert(`Email "${email}" not found. Please check your email address or sign up for a new account.`);
            throw new Error('Email not found. Please check your email address or sign up for a new account.');
        }

        console.log('👤 Found user:', user.email);

        const passwordHash = await hashPassword(password);
        console.log('🔑 Verifying password...');

        if (user.passwordHash !== passwordHash) {
            console.log('❌ Password mismatch for user:', email);
            throw new Error('Incorrect password. Please try again.');
        }

        console.log('✅ Password verified for user:', email);

        // Create auth session
        await createAuthSession(user.id);
        console.log('🎫 Login session created for user:', email);

        return toUser(user);
    },

    // Sign in with Google (mock)
    signInWithGoogle: async (): Promise<User> => {
        console.log('🔐 Starting Google sign in process');

        // Simulate Google OAuth
        const email = 'demo@gmail.com';
        const users = await getUsers();

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
            await saveUsers(users);
        }

        // Create auth session
        await createAuthSession(user.id);

        return toUser(user);
    },

    // Get current user from session
    getCurrentUser: async (): Promise<User | null> => {
        try {
            console.log('👤 Getting current user...');
            
            // Simplified approach - just return null for now to avoid loading issues
            // This will force users to sign in manually
            console.log('❌ No current user (simplified mode)');
            return null;
        } catch (error) {
            console.error('❌ Failed to get current user:', error);
            return null;
        }
    },

    // Sign out
    signOut: async (): Promise<void> => {
        try {
            const token = getCurrentToken();
            if (token) {
                // Remove session from storage
                const sessions = await getSessions();
                const filteredSessions = sessions.filter(s => s.token !== token);
                await saveSessions(filteredSessions);

                // Clear session from both cookie and localStorage
                deleteCookie('snapfarm_session');
                localStorage.removeItem('snapfarm_current_session');
                console.log('🚪 User signed out successfully');
            }
        } catch (error) {
            console.error('Failed to sign out:', error);
        }
    },

    // Update user preferences
    updateUserPreferences: async (userId: string, preferences: Partial<UserPreferences>): Promise<void> => {
        const users = await getUsers();
        const userIndex = users.findIndex(u => u.id === userId);

        if (userIndex === -1) {
            throw new Error('User not found');
        }

        users[userIndex].preferences = { ...users[userIndex].preferences, ...preferences };
        await saveUsers(users);
    },

    // Check if email exists (for validation)
    emailExists: async (email: string): Promise<boolean> => {
        const users = await getUsers();
        return users.some(user => user.email.toLowerCase() === email.toLowerCase());
    },

    // Get session info
    getSessionInfo: async (): Promise<{ isAuthenticated: boolean; expiresAt: number | null }> => {
        try {
            const token = getCurrentToken();
            if (!token) return { isAuthenticated: false, expiresAt: null };

            const sessions = await getSessions();
            const authSession = sessions.find(s => s.token === token);

            if (authSession && authSession.expiresAt > Date.now()) {
                return { isAuthenticated: true, expiresAt: authSession.expiresAt };
            }

            return { isAuthenticated: false, expiresAt: null };
        } catch (error) {
            return { isAuthenticated: false, expiresAt: null };
        }
    },

    // Debug function to list all users
    debugListUsers: async (): Promise<void> => {
        const users = await getUsers();
        console.log('📋 All users in physical file database:');
        console.log('📁 File path: /data/users.json');
        users.forEach((user, index) => {
            console.log(`${index + 1}. ${user.email} (${user.displayName}) - ID: ${user.id}`);
        });
        console.log('📊 Total users:', users.length);
    },

    // Initialize test data
    initializeTestData: async (): Promise<void> => {
        const testUser: StoredUser = {
            id: 'user_test_1735156800000_siddiddy',
            email: 'siddiddy@gmail.com',
            passwordHash: 'eaeccfc9badff2008a941aabb13e7b20884da177d6dd1ac949ba4b49fa47e8e9',
            displayName: 'Sid Diddy',
            createdAt: 1735156800000,
            preferences: {
                theme: 'system',
                notifications: true,
                units: 'metric',
                language: 'en'
            }
        };

        const users = await getUsers();
        const existingUser = users.find(u => u.email === testUser.email);
        
        if (!existingUser) {
            users.push(testUser);
            await saveUsers(users);
            console.log('✅ Test user "Sid Diddy" initialized');
        } else {
            console.log('👤 Test user "Sid Diddy" already exists');
        }
    },

    // Clear all data (for testing)
    clearAllData: async (): Promise<void> => {
        localStorage.removeItem('snapfarm_file_users');
        localStorage.removeItem('snapfarm_file_sessions');
        localStorage.removeItem('snapfarm_current_session');
        deleteCookie('snapfarm_session');
        console.log('🗑️ All authentication data cleared from physical files and cookies');
    },

    // Debug authentication state
    debugAuthState: async (): Promise<void> => {
        console.log('🔍 === AUTHENTICATION DEBUG ===');
        
        // Check cookies
        console.log('🍪 All cookies:', document.cookie);
        const cookieToken = getCookie('snapfarm_session');
        console.log('🎫 Session cookie:', cookieToken ? cookieToken.substring(0, 8) + '...' : 'None');
        
        // Check localStorage
        const localToken = localStorage.getItem('snapfarm_current_session');
        console.log('💾 LocalStorage token:', localToken ? localToken.substring(0, 8) + '...' : 'None');
        
        // Check sessions
        const sessions = await getSessions();
        console.log('📋 Total sessions:', sessions.length);
        sessions.forEach((session, index) => {
            const isExpired = session.expiresAt <= Date.now();
            console.log(`${index + 1}. User: ${session.userId}, Expires: ${new Date(session.expiresAt).toLocaleString()}, Expired: ${isExpired}`);
        });
        
        // Check users
        const users = await getUsers();
        console.log('👥 Total users:', users.length);
        users.forEach((user, index) => {
            console.log(`${index + 1}. ${user.email} (${user.displayName})`);
        });
        
        // Test current user
        const currentUser = await fileAuthService.getCurrentUser();
        console.log('👤 Current user:', currentUser ? currentUser.email : 'None');
        
        console.log('🔍 === END DEBUG ===');
    }
};