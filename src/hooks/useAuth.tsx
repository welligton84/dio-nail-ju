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
    addUser: (newUser: Omit<User, 'id' | 'createdAt'>) => Promise<void>;
    changePassword: (newPassword: string) => Promise<void>;
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
        // For demo, check against a stored list or the default admin
        const usersJson = localStorage.getItem('studio_nail_users_list');
        const users: User[] = usersJson ? JSON.parse(usersJson) : [DEMO_USER];

        const foundUser = users.find(u => u.email === email && u.active);
        // Simple demo password check (in real app, use secure auth)
        if (foundUser && password === '123456') {
            setUser(foundUser);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(foundUser));
            return true;
        }
        return false;
    };

    const logout = async (): Promise<void> => {
        setUser(null);
        localStorage.removeItem(STORAGE_KEY);
    };

    const addUser = async (newUser: Omit<User, 'id' | 'createdAt'>) => {
        const usersJson = localStorage.getItem('studio_nail_users_list');
        const users: User[] = usersJson ? JSON.parse(usersJson) : [DEMO_USER];

        const userToAdd: User = {
            ...newUser,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
        };

        const updatedUsers = [...users, userToAdd];
        localStorage.setItem('studio_nail_users_list', JSON.stringify(updatedUsers));
        alert('Usuário cadastrado com sucesso!');
    };

    const changePassword = async (newPassword: string) => {
        // In a real app, this would call a backend/firebase
        console.log('Senha alterada para:', newPassword);
        alert('Senha alterada com sucesso!');
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
                addUser,
                changePassword,
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
