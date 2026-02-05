import { createContext, useContext, useState, useEffect } from 'react';
import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updatePassword
} from 'firebase/auth';
import { doc, getDoc, setDoc, collection, getDocs, limit, query } from 'firebase/firestore';
import { auth, db, functions } from '../lib/firebase';
import { httpsCallable } from 'firebase/functions';
<<<<<<< HEAD
=======
import { toast } from 'sonner';
>>>>>>> b507692 (feat: rebrand to Juliana Miranda Concept, add Vitest, fix routing and finance filters)
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
                        const userRef = doc(db, 'users', firebaseUser.uid);
                        const userDoc = await getDoc(userRef);

                        if (userDoc.exists()) {
                            const userData = userDoc.data() as User;
                            setUser({ ...userData, id: firebaseUser.uid, email: firebaseUser.email! });
                        } else {
                            // First time login, user exists in Auth but not in Firestore 'users' collection
                            // Check if there are any other users. If not, this is the first user (Admin)
                            const usersQuery = query(collection(db, 'users'), limit(1));
                            const usersSnapshot = await getDocs(usersQuery);
                            const isFirstUser = usersSnapshot.empty;

                            const newProfile: User = {
                                id: firebaseUser.uid,
                                email: firebaseUser.email!,
                                name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuário',
                                role: isFirstUser ? 'admin' : 'employee',
                                active: true,
                                createdAt: new Date().toISOString()
                            };

                            await setDoc(userRef, newProfile);
                            setUser(newProfile);
                        }
                    } catch (error: any) {
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

                        if (error.code === 'permission-denied') {
<<<<<<< HEAD
                            alert('Erro de permissão no Firestore. Verifique as regras no Console.');
=======
                            toast.error('Erro de permissão no Firestore. Verifique as regras no Console.');
>>>>>>> b507692 (feat: rebrand to Juliana Miranda Concept, add Vitest, fix routing and finance filters)
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
        } catch (error: any) {
            console.error('Erro ao fazer login:', error);
            let message = 'E-mail ou senha incorretos';
            if (error.code === 'auth/user-not-found') message = 'Usuário não encontrado';
            if (error.code === 'auth/wrong-password') message = 'Senha incorreta';
            if (error.code === 'auth/network-request-failed') message = 'Erro de conexão com o servidor';
            return { success: false, error: message };
        }
    };

    const logout = async (): Promise<void> => {
        if (!auth) return;
        await signOut(auth);
    };

    const addUser = async (newUser: Omit<User, 'id' | 'createdAt'>, password?: string) => {
        if (!functions) return;
        try {
            const createUserAuth = httpsCallable(functions, 'createUserAuth');
            await createUserAuth({
                ...newUser,
                password: password || '123456' // Default if not provided
            });
<<<<<<< HEAD
            alert('Usuário criado com sucesso no Authentication e no Banco de Dados!');
        } catch (error: any) {
            console.error('Erro ao adicionar usuário via Cloud Function:', error);
            alert(`Erro ao criar usuário: ${error.message}`);
=======
            toast.success('Usuário criado com sucesso no Authentication e no Banco de Dados!');
        } catch (error: any) {
            console.error('Erro ao adicionar usuário via Cloud Function:', error);
            toast.error(`Erro ao criar usuário: ${error.message}`);
>>>>>>> b507692 (feat: rebrand to Juliana Miranda Concept, add Vitest, fix routing and finance filters)
        }
    };

    const changePassword = async (newPassword: string) => {
        if (!auth?.currentUser) return;
        try {
            await updatePassword(auth.currentUser, newPassword);
<<<<<<< HEAD
            alert('Senha alterada com sucesso!');
        } catch (error) {
            console.error('Erro ao alterar senha:', error);
            alert('Erro ao alterar senha. Talvez seja necessário fazer login novamente.');
=======
            toast.success('Senha alterada com sucesso!');
        } catch (error) {
            console.error('Erro ao alterar senha:', error);
            toast.error('Erro ao alterar senha. Talvez seja necessário fazer login novamente.');
>>>>>>> b507692 (feat: rebrand to Juliana Miranda Concept, add Vitest, fix routing and finance filters)
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
