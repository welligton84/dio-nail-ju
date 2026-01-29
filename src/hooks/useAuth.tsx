import { createContext, useContext, useState, useEffect } from 'react';
import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updatePassword
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import type { ReactNode } from 'react';
import type { User } from '../types';

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

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!auth) {
            setIsLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                if (db) {
                    try {
                        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                        if (userDoc.exists()) {
                            const userData = userDoc.data() as User;
                            setUser({ ...userData, id: firebaseUser.uid, email: firebaseUser.email! });
                        } else {
                            setUser({
                                id: firebaseUser.uid,
                                email: firebaseUser.email!,
                                name: firebaseUser.displayName || 'Usuário',
                                role: 'employee',
                                active: true,
                                createdAt: new Date().toISOString()
                            });
                        }
                    } catch (error) {
                        console.error('Erro ao buscar dados do usuário:', error);
                    }
                }
            } else {
                setUser(null);
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = async (email: string, password: string): Promise<boolean> => {
        if (!auth) return false;
        try {
            await signInWithEmailAndPassword(auth, email, password);
            return true;
        } catch (error) {
            console.error('Erro ao fazer login:', error);
            return false;
        }
    };

    const logout = async (): Promise<void> => {
        if (!auth) return;
        await signOut(auth);
    };

    const addUser = async (newUser: Omit<User, 'id' | 'createdAt'>) => {
        alert('Para cadastrar novos usuários no Firebase Real, utilize o Console do Firebase ou uma Cloud Function para garantir a segurança.');
        console.log('Dados do novo usuário:', newUser);
    };

    const changePassword = async (newPassword: string) => {
        if (!auth?.currentUser) return;
        try {
            await updatePassword(auth.currentUser, newPassword);
            alert('Senha alterada com sucesso!');
        } catch (error) {
            console.error('Erro ao alterar senha:', error);
            alert('Erro ao alterar senha. Talvez seja necessário fazer login novamente.');
        }
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
