import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';

// Demo user for when Firebase is not configured
const DEMO_USER: User = {
    id: 'demo-1',
    email: 'well@well.com',
    name: 'Well Admin',
    role: 'admin',
    active: true,
    createdAt: new Date().toISOString(),
};

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = 'studio_nail_user';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for saved session
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                setUser(JSON.parse(saved));
            } catch {
                localStorage.removeItem(STORAGE_KEY);
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string): Promise<boolean> => {
        // Demo authentication
        if (email === 'well@well.com' && password === '123456') {
            setUser(DEMO_USER);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_USER));
            return true;
        }
        return false;
    };

    const logout = async (): Promise<void> => {
        setUser(null);
        localStorage.removeItem(STORAGE_KEY);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
                <div className="text-center">
                    <div className="w-16 h-16 gradient-bg rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <span className="text-white text-2xl">✨</span>
                    </div>
                    <p className="text-gray-500">Carregando...</p>
                </div>
            </div>
        );
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
