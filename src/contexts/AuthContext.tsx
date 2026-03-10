import { createContext, useState, useEffect } from 'react';
import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updatePassword
} from 'firebase/auth';
import { doc, getDoc, setDoc, collection, getDocs, limit, query } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { functions } from '../lib/firebase';
import { httpsCallable } from 'firebase/functions';
import { getAuthErrorMessage, getFirebaseErrorCode } from '../utils/firebase-error';
import { toast } from 'sonner';
import type { ReactNode } from 'react';
import type { User } from '../types';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    addUser: (newUser: Omit<User, 'id' | 'createdAt'>, password?: string) => Promise<void>;
    changePassword: (newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);
export { AuthContext };

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(!!auth);

    useEffect(() => {
        if (!auth) return;

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                if (db) {
                    try {
                        const userRef = doc(db, 'users', firebaseUser.uid);
                        const userDoc = await getDoc(userRef);

                        if (userDoc.exists()) {
                            const userData = userDoc.data() as User;
                            
                            // Check if user is active
                            if (!userData.active) {
                                toast.error('Usuário inativo. Entre em contato com o administrador.');
                                if (auth) {
                                    await signOut(auth);
                                }
                                setUser(null);
                                return;
                            }
                            
                            setUser({ ...userData, id: firebaseUser.uid, email: firebaseUser.email! });
                        } else {
                            // First time login, user exists in Auth but not in Firestore 'users' collection
                            // Securely determine if this is the bootstrap user (Admin)
                            const usersQuery = query(collection(db, 'users'), limit(1));
                            const usersSnapshot = await getDocs(usersQuery);
                            const isFirstUser = usersSnapshot.empty;

                            // If it's the first user, they become Admin. Subsequent users default to Employee.
                            const newProfile: User = {
                                id: firebaseUser.uid,
                                email: firebaseUser.email!,
                                name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Novo Usuário',
                                role: isFirstUser ? 'admin' : 'employee',
                                active: true,
                                createdAt: new Date().toISOString()
                            };

                            // Only proceed if we successfully determined the first user status
                            await setDoc(userRef, newProfile);
                            setUser(newProfile);

                            if (isFirstUser) {
                                toast.success('Bem-vindo! Você foi configurado como administrador do sistema.');
                            }
                        }
                    } catch (error) {
                        console.error('Erro ao sincronizar perfil do usuário:', error);
                        // Fallback logic
                        setUser({
                            id: firebaseUser.uid,
                            email: firebaseUser.email!,
                            name: 'Usuário',
                            role: 'employee',
                            active: true,
                            createdAt: new Date().toISOString()
                        });

                        if (getFirebaseErrorCode(error) === 'permission-denied') {
                            toast.error('Erro de permissão no Firestore. Verifique as regras no Console.');
                        }
                    }
                }
            } else {
                setUser(null);
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        if (!auth) return { success: false, error: 'Firebase não inicializado' };
        try {
            await signInWithEmailAndPassword(auth, email, password);
            return { success: true };
        } catch (error) {
            console.error('Erro ao fazer login:', error);
            return { success: false, error: getAuthErrorMessage(error) };
        }
    };

    const logout = async (): Promise<void> => {
        if (!auth) return;
        await signOut(auth);
    };

    const addUser = async (newUser: Omit<User, 'id' | 'createdAt'>, password?: string) => {
        if (!db || !functions) return;
        
        if (!user || (user.role !== 'admin' && user.role !== 'Administrador')) {
            toast.error('Apenas administradores podem criar novos usuários.');
            return;
        }

        if (!password || password.length < 6) {
            toast.error('Senha é obrigatória e deve ter no mínimo 6 caracteres.');
            return;
        }

        try {
            const existingUsersQuery = query(collection(db, 'users'), limit(100));
            const snapshot = await getDocs(existingUsersQuery);
            const existingUser = snapshot.docs.find(doc => doc.data().email === newUser.email);
            
            if (existingUser) {
                toast.error('Já existe um usuário cadastrado com este e-mail.');
                return;
            }

            // P0.1: Use Cloud Function to create user without logging out admin
            const createUserAuth = httpsCallable(functions, 'createUserAuth');
            const result = await createUserAuth({
                email: newUser.email,
                password: password,
                name: newUser.name,
                role: newUser.role || 'employee'
            });

            if (result.data && typeof result.data === 'object' && 'success' in result.data && result.data.success) {
                toast.success('Usuário criado com sucesso!');
            } else {
                throw new Error(result.data && typeof result.data === 'object' && 'error' in result.data 
                    ? String(result.data.error) 
                    : 'Erro desconhecido');
            }
        } catch (error: unknown) {
            console.error('Erro ao adicionar usuário:', error);
            const errorMsg = error instanceof Error ? error.message : getAuthErrorMessage(error);
            toast.error(errorMsg);
        }
    };

    const changePassword = async (newPassword: string) => {
        if (!auth?.currentUser) return;
        try {
            await updatePassword(auth.currentUser, newPassword);
            toast.success('Senha alterada com sucesso!');
        } catch (error) {
            console.error('Erro ao alterar senha:', error);
            toast.error('Erro ao alterar senha. Talvez seja necessário fazer login novamente.');
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
