/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { ReactNode } from 'react';
import { useAuth } from './useAuth';

export interface CompanyData {
    name: string;
    cnpj: string;
    cpf: string;
    phone: string;
    email: string;
    address: string;
    number: string;
    city: string;
    state: string;
    zipCode: string;
    neighborhood: string;
    inscricaoMunicipal?: string;
    inscricaoEstadual?: string;
}

export interface NFSeConfig {
    enabled: boolean;
    provider: 'national' | 'national_homolog' | 'isss' | 'webiss_juazeiro' | 'focusnfe' | 'simplified' | 'plugnotas';
    environment?: 'homologacao' | 'producao';
    cityCode: string;
    serviceCode: string;
    cnaeCode: string;
    aliqIss: string;
    certificate: string | null;
    certificateName: string | null;
    certificatePassword?: string | null;
    apiKey: string | null;
}

export interface MessageTemplates {
    confirmation: string;
    reminder: string;
    birthday: string;
    thanks: string;
    cancellation: string;
    delay: string;
}

export interface TeamRole {
    id: string;
    name: string;
    permissions: string[];
}

export interface PaymentMethod {
    id: string;
    name: string;
    active: boolean;
}

export interface SystemSettings {
    businessHours: {
        start: string;
        end: string;
    };
    appointmentInterval: number;
    minAdvanceBooking: number;
    maxAdvanceBooking: number;
}

interface SettingsContextType {
    company: CompanyData;
    nfse: NFSeConfig;
    messages: MessageTemplates;
    roles: TeamRole[];
    paymentMethods: PaymentMethod[];
    system: SystemSettings;
    loading: boolean;
    updateCompany: (data: Partial<CompanyData>) => void;
    updateNFSe: (data: Partial<NFSeConfig>) => void;
    updateMessages: (data: Partial<MessageTemplates>) => void;
    updateRoles: (roles: TeamRole[]) => void;
    updatePaymentMethods: (methods: PaymentMethod[]) => void;
    updateSystem: (data: Partial<SystemSettings>) => void;
    saveSettings: () => Promise<void>;
}

const defaultCompany: CompanyData = {
    name: '',
    cnpj: '',
    cpf: '',
    phone: '',
    email: '',
    address: '',
    number: '',
    city: '',
    state: '',
    zipCode: '',
    neighborhood: '',
    inscricaoMunicipal: '',
    inscricaoEstadual: ''
};

const defaultNFSe: NFSeConfig = {
    enabled: false,
    provider: 'simplified',
    environment: 'producao',
    cityCode: '',
    serviceCode: '0104',
    cnaeCode: '9602',
    aliqIss: '5',
    certificate: null,
    certificateName: null,
    certificatePassword: null,
    apiKey: null
};

const defaultMessages: MessageTemplates = {
    confirmation: 'Olá {cliente}! ✨\nPassando para confirmar seu agendamento para {data} às {hora}.\nServiços: {servicos}.\n\nPodemos confirmar? 💅',
    reminder: 'Oie {cliente}! ⏰\nLembrete do seu horário hoje às {hora} no {estabelecimento}.\nEstamos te esperando! ✨',
    birthday: 'Feliz aniversário, {cliente}! 🎂🎉\n\nQue este novo ano de vida traga muita saúde e felicidades.\n\nAbraços do {estabelecimento}! 💖',
    thanks: 'Obrigada pela visita, {cliente}! 💖\nFoi um prazer te atender. Até a próxima!',
    cancellation: 'Olá {cliente}, recebemos seu pedido de cancelamento do agendamento para {data}.\n\nCaso precise remarcar, é só falar!',
    delay: 'Oi {cliente}, tudo bem? 🙏\nTivemos um pequeno atraso. Poderia vir 15 minutinhos mais tarde?\nDesculpe o transtorno!'
};

const defaultRoles: TeamRole[] = [
    { id: '1', name: 'Administrador', permissions: ['all'] },
    { id: '2', name: 'Manicure', permissions: ['appointments', 'clients', 'services'] },
    { id: '3', name: 'Pedicure', permissions: ['appointments', 'clients', 'services'] },
    { id: '4', name: 'Recepção', permissions: ['appointments', 'clients'] }
];

const defaultPaymentMethods: PaymentMethod[] = [
    { id: '1', name: 'Dinheiro', active: true },
    { id: '2', name: 'PIX', active: true },
    { id: '3', name: 'Débito', active: true },
    { id: '4', name: 'Crédito', active: true }
];

const defaultSystem: SystemSettings = {
    businessHours: { start: '07:00', end: '20:00' },
    appointmentInterval: 30,
    minAdvanceBooking: 1,
    maxAdvanceBooking: 60
};

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [company, setCompany] = useState<CompanyData>(defaultCompany);
    const [nfse, setNfse] = useState<NFSeConfig>(defaultNFSe);
    const [messages, setMessages] = useState<MessageTemplates>(defaultMessages);
    const [roles, setRoles] = useState<TeamRole[]>(defaultRoles);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(defaultPaymentMethods);
    const [system, setSystem] = useState<SystemSettings>(defaultSystem);
    const [loading, setLoading] = useState(true);
    const { isAuthenticated } = useAuth();

    // Load settings from Firebase on mount
    useEffect(() => {
        // If not authenticated, skip loading
        if (!db || !isAuthenticated) {
            return;
        }

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoading(true);

        const settingsRef = doc(db, 'settings', 'general');

        const unsubscribe = onSnapshot(settingsRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.company) setCompany(data.company);
                if (data.nfse) setNfse(data.nfse);
                if (data.messages) setMessages(data.messages);
                if (data.roles) setRoles(data.roles);
                if (data.paymentMethods) setPaymentMethods(data.paymentMethods);
                if (data.system) setSystem(data.system);
            }
            setLoading(false);
        }, (error) => {
            console.error('Error loading settings:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [isAuthenticated]);

    const updateCompany = (data: Partial<CompanyData>) => {
        setCompany(prev => ({ ...prev, ...data }));
    };

    const updateNFSe = (data: Partial<NFSeConfig>) => {
        setNfse(prev => ({ ...prev, ...data }));
    };

    const updateMessages = (data: Partial<MessageTemplates>) => {
        setMessages(prev => ({ ...prev, ...data }));
    };

    const updateRoles = (newRoles: TeamRole[]) => {
        setRoles(newRoles);
    };

    const updatePaymentMethods = (methods: PaymentMethod[]) => {
        setPaymentMethods(methods);
    };

    const updateSystem = (data: Partial<SystemSettings>) => {
        setSystem(prev => ({ ...prev, ...data }));
    };

    const saveSettings = async () => {
        if (!db) {
            console.error('Firebase not initialized');
            throw new Error('Firebase não está configurado');
        }

        try {
            const settingsRef = doc(db, 'settings', 'general');
            await setDoc(settingsRef, {
                company,
                nfse,
                messages,
                roles,
                paymentMethods,
                system,
                updatedAt: new Date().toISOString()
            }, { merge: true });
        } catch (error) {
            console.error('Error saving settings:', error);
            throw error;
        }
    };

    return (
        <SettingsContext.Provider value={{
            company,
            nfse,
            messages,
            roles,
            paymentMethods,
            system,
            loading,
            updateCompany,
            updateNFSe,
            updateMessages,
            updateRoles,
            updatePaymentMethods,
            updateSystem,
            saveSettings
        }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within SettingsProvider');
    }
    return context;
}
