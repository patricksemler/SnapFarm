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
        id: 'user_test_siddiddy',
        email: 'siddiddy@gmail.com',
        passwordHash: '401ea01207177232ead63b34e321cfd84e04f926936ea3c9ea3bceb2d18f4d4f',
        displayName: 'Sid Diddy',
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
    // Get current user - always returns null to force fresh sign-ins
    getCurrentUser: async (): Promise<User | null> => {
        console.log('👤 getCurrentUser: returning null (no persistent sessions)');
        return null;
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

        return toUser(user);
    },

    // Sign out
    signOut: async (): Promise<void> => {
        console.log('🚪 User signed out');
        // No persistent sessions to clear
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
        console.log('🗑️ Cleared localStorage, test user will be recreated on next getUsers() call');
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