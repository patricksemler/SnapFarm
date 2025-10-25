// Simple Authentication Service - No file dependencies
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

// Simple hash function
const hashPassword = async (password: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + 'snapfarm_salt_2024');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// Validate email format
const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Get users from localStorage
const getUsers = (): StoredUser[] => {
    try {
        const stored = localStorage.getItem('snapfarm_users');
        if (stored) {
            const users = JSON.parse(stored);
            console.log('📦 Found existing users in localStorage:', users.length);
            return users;
        }
    } catch (error) {
        console.error('Failed to parse users:', error);
        localStorage.removeItem('snapfarm_users');
    }
    
    // Initialize with test user (password: "password")
    const testUser: StoredUser = {
        id: 'user_test_testuser',
        email: 'testuser@gmail.com',
        passwordHash: '401ea01207177232ead63b34e321cfd84e04f926936ea3c9ea3bceb2d18f4d4f',
        displayName: 'test user',
        createdAt: Date.now(),
        preferences: {
            theme: 'system',
            notifications: true,
            units: 'metric',
            language: 'en'
        }
    };
    
    const users = [testUser];
    localStorage.setItem('snapfarm_users', JSON.stringify(users));
    return users;
};

// Save users to localStorage
const saveUsers = (users: StoredUser[]): void => {
    localStorage.setItem('snapfarm_users', JSON.stringify(users));
};

// Cookie utilities for persistent login
const setCookie = (name: string, value: string, days: number = 7): void => {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
    console.log('🍪 Cookie set:', name);
};

const getCookie = (name: string): string | null => {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) {
            return c.substring(nameEQ.length, c.length);
        }
    }
    return null;
};

const deleteCookie = (name: string): void => {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
    console.log('🗑️ Cookie deleted:', name);
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

export const simpleAuthService = {
    // Get current user from session cookie
    getCurrentUser: async (): Promise<User | null> => {
        const sessionId = getCookie('snapfarm_session');
        if (!sessionId) {
            console.log('👤 No session cookie found');
            return null;
        }

        try {
            const users = getUsers();
            const user = users.find(u => u.id === sessionId);
            if (user) {
                console.log('👤 Restored user from session:', user.email);
                return toUser(user);
            } else {
                console.log('👤 Session user not found, clearing cookie');
                deleteCookie('snapfarm_session');
                return null;
            }
        } catch (error) {
            console.error('👤 Error restoring session:', error);
            deleteCookie('snapfarm_session');
            return null;
        }
    },

    // Sign in
    signIn: async (email: string, password: string): Promise<User> => {
        console.log('🔐 Starting sign in for:', email);
        console.log('🔐 Password provided:', password);

        if (!isValidEmail(email)) {
            throw new Error('Please enter a valid email address');
        }

        const users = getUsers();
        console.log('👥 Available users:', users.map(u => ({ email: u.email, id: u.id })));
        
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        console.log('🔍 Found user:', user ? 'Yes' : 'No');

        if (!user) {
            console.log('❌ Email not found. Available emails:', users.map(u => u.email));
            throw new Error('Email not found. Please check your email address or sign up.');
        }

        const passwordHash = await hashPassword(password);
        console.log('🔑 Generated hash:', passwordHash);
        console.log('🔑 Stored hash:', user.passwordHash);
        console.log('🔑 Hashes match:', passwordHash === user.passwordHash);

        if (user.passwordHash !== passwordHash) {
            throw new Error('Incorrect password. Please try again.');
        }

        // Set session cookie for persistent login
        setCookie('snapfarm_session', user.id, 7); // 7 days
        
        console.log('✅ Sign in successful for:', user.email);
        return toUser(user);
    },

    // Sign up
    signUp: async (email: string, password: string, displayName: string): Promise<User> => {
        console.log('📝 Starting sign up for:', email);

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
        const existingUser = users.find(user => user.email.toLowerCase() === email.toLowerCase());
        
        if (existingUser) {
            throw new Error('An account with this email already exists');
        }

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
        saveUsers(users);

        // Set session cookie for persistent login
        setCookie('snapfarm_session', newUser.id, 7); // 7 days
        
        console.log('✅ User created successfully:', newUser.email);
        return toUser(newUser);
    },

    // Sign in with Google (mock)
    signInWithGoogle: async (): Promise<User> => {
        console.log('🔐 Starting Google sign in');

        const email = 'demo@gmail.com';
        const users = getUsers();
        let user = users.find(u => u.email === email);

        if (!user) {
            user = {
                id: 'google_user_' + Date.now(),
                email,
                passwordHash: '',
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

        // Set session cookie for persistent login
        setCookie('snapfarm_session', user.id, 7); // 7 days

        return toUser(user);
    },

    // Sign out
    signOut: async (): Promise<void> => {
        deleteCookie('snapfarm_session');
        console.log('🚪 User signed out and session cleared');
    },

    // Update user preferences
    updateUserPreferences: async (userId: string, preferences: Partial<UserPreferences>): Promise<void> => {
        const users = getUsers();
        const userIndex = users.findIndex(u => u.id === userId);

        if (userIndex === -1) {
            throw new Error('User not found');
        }

        users[userIndex].preferences = { ...users[userIndex].preferences, ...preferences };
        saveUsers(users);
    },

    // Debug: Clear all data and reset test user
    resetTestData: (): void => {
        localStorage.removeItem('snapfarm_users');
        deleteCookie('snapfarm_session');
        console.log('🗑️ Cleared localStorage and cookies, test user will be recreated on next getUsers() call');
        // Force recreation of test user
        getUsers();
    },

    // Force reset to new test user (removes old siddiddy data)
    forceResetToTestUser: (): void => {
        localStorage.removeItem('snapfarm_users');
        deleteCookie('snapfarm_session');
        
        // Create fresh test user
        const testUser: StoredUser = {
            id: 'user_test_testuser',
            email: 'testuser@gmail.com',
            passwordHash: '401ea01207177232ead63b34e321cfd84e04f926936ea3c9ea3bceb2d18f4d4f',
            displayName: 'test user',
            createdAt: Date.now(),
            preferences: {
                theme: 'system',
                notifications: true,
                units: 'metric',
                language: 'en'
            }
        };
        
        localStorage.setItem('snapfarm_users', JSON.stringify([testUser]));
        console.log('✅ Force reset complete - only test user exists now');
        console.log('📧 Login with: testuser@gmail.com / password');
    },

    // Debug: Show current localStorage data
    debugUsers: (): void => {
        const users = getUsers();
        console.log('🔍 === USER DEBUG ===');
        console.log('Total users:', users.length);
        users.forEach((user, index) => {
            console.log(`${index + 1}. Email: ${user.email}, ID: ${user.id}`);
        });
        console.log('🔍 === END DEBUG ===');
    }
};

// Expose debug functions globally for easier debugging
if (typeof window !== 'undefined') {
    (window as any).simpleAuthService = simpleAuthService;
    (window as any).resetToTestUser = simpleAuthService.forceResetToTestUser;
    
    // Also expose diagnosis debug functions
    import('../utils/diagnosisRecorder').then(module => {
        (window as any).diagnosisDebug = {
            clearAll: module.clearDiagnosisRecords,
            removeDuplicates: module.removeDuplicateDiagnoses,
            getRecords: module.getDiagnosisRecords,
            getDashboard: module.getDashboardData,
            // Quick clear function
            clearAndRefresh: () => {
                module.clearDiagnosisRecords();
                window.location.reload();
            }
        };
    });
}