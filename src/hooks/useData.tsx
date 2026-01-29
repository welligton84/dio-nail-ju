import { createContext, useContext, useState, useEffect } from 'react';
import {
    collection,
    query,
    onSnapshot,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    orderBy
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { ReactNode } from 'react';
import type { Client, Service, Appointment, FinancialRecord, DashboardStats } from '../types';

interface DataContextType {
    clients: Client[];
    services: Service[];
    appointments: Appointment[];
    financialRecords: FinancialRecord[];
    dashboardStats: DashboardStats;
    addClient: (client: Omit<Client, 'id' | 'createdAt' | 'totalVisits'>) => Promise<void>;
    updateClient: (id: string, data: Partial<Client>) => Promise<void>;
    deleteClient: (id: string) => Promise<void>;
    addService: (service: Omit<Service, 'id'>) => Promise<void>;
    updateService: (id: string, data: Partial<Service>) => Promise<void>;
    deleteService: (id: string) => Promise<void>;
    addAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt'>) => Promise<void>;
    updateAppointment: (id: string, data: Partial<Appointment>) => Promise<void>;
    deleteAppointment: (id: string) => Promise<void>;
    getTodayAppointments: () => Appointment[];
    addFinancialRecord: (record: Omit<FinancialRecord, 'id' | 'createdAt'>) => Promise<void>;
    deleteFinancialRecord: (id: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
    const [clients, setClients] = useState<Client[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [financialRecords, setFinancialRecords] = useState<FinancialRecord[]>([]);

    useEffect(() => {
        if (!db) return;

        const handleError = (error: any, context: string) => {
            console.error(`Status Firestore [${context}]:`, error);
            if (error.code === 'permission-denied') {
                console.warn('Verifique as regras de segurança do Firestore no Console.');
            }
        };

        // Clients listener
        const qClients = query(collection(db, 'clients'), orderBy('name'));
        const unsubscribeClients = onSnapshot(qClients, (snapshot) => {
            setClients(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Client)));
        }, (err) => handleError(err, 'clientes'));

        // Services listener
        const qServices = query(collection(db, 'services'), orderBy('name'));
        const unsubscribeServices = onSnapshot(qServices, (snapshot) => {
            setServices(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Service)));
        }, (err) => handleError(err, 'serviços'));

        // Appointments listener
        const qAppointments = query(collection(db, 'appointments'), orderBy('date', 'desc'));
        const unsubscribeAppointments = onSnapshot(qAppointments, (snapshot) => {
            setAppointments(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Appointment)));
        }, (err) => handleError(err, 'agendamentos'));

        // Financial Records listener
        const qFinancial = query(collection(db, 'financialRecords'), orderBy('date', 'desc'));
        const unsubscribeFinancial = onSnapshot(qFinancial, (snapshot) => {
            setFinancialRecords(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as FinancialRecord)));
        }, (err) => handleError(err, 'financeiro'));

        return () => {
            unsubscribeClients();
            unsubscribeServices();
            unsubscribeAppointments();
            unsubscribeFinancial();
        };
    }, []);

    // Client actions
    const addClient = async (client: Omit<Client, 'id' | 'createdAt' | 'totalVisits'>) => {
        if (!db) return;
        await addDoc(collection(db, 'clients'), {
            ...client,
            totalVisits: 0,
            createdAt: new Date().toISOString().split('T')[0]
        });
    };

    const updateClient = async (id: string, data: Partial<Client>) => {
        if (!db) return;
        await updateDoc(doc(db, 'clients', id), data);
    };

    const deleteClient = async (id: string) => {
        if (!db) return;
        await deleteDoc(doc(db, 'clients', id));
    };

    // Service actions
    const addService = async (service: Omit<Service, 'id'>) => {
        if (!db) return;
        await addDoc(collection(db, 'services'), service);
    };

    const updateService = async (id: string, data: Partial<Service>) => {
        if (!db) return;
        await updateDoc(doc(db, 'services', id), data);
    };

    const deleteService = async (id: string) => {
        if (!db) return;
        await deleteDoc(doc(db, 'services', id));
    };

    // Appointment actions
    const addAppointment = async (appointment: Omit<Appointment, 'id' | 'createdAt'>) => {
        if (!db) return;
        await addDoc(collection(db, 'appointments'), {
            ...appointment,
            createdAt: new Date().toISOString().split('T')[0]
        });

        // Update client last visit
        await updateClient(appointment.clientId, { lastVisit: appointment.date });
    };

    const updateAppointment = async (id: string, data: Partial<Appointment>) => {
        if (!db) return;
        await updateDoc(doc(db, 'appointments', id), data);
    };

    const deleteAppointment = async (id: string) => {
        if (!db) return;
        await deleteDoc(doc(db, 'appointments', id));
    };

    const getTodayAppointments = (): Appointment[] => {
        const today = new Date().toISOString().split('T')[0];
        return appointments
            .filter(a => a.date === today)
            .sort((a, b) => a.time.localeCompare(b.time));
    };

    // Financial actions
    const addFinancialRecord = async (record: Omit<FinancialRecord, 'id' | 'createdAt'>) => {
        if (!db) return;
        await addDoc(collection(db, 'financialRecords'), {
            ...record,
            createdAt: new Date().toISOString().split('T')[0]
        });
    };

    const deleteFinancialRecord = async (id: string) => {
        if (!db) return;
        await deleteDoc(doc(db, 'financialRecords', id));
    };

    // Calculate dashboard stats
    const dashboardStats: DashboardStats = {
        totalClients: clients.length,
        totalAppointments: appointments.length,
        todayAppointments: getTodayAppointments().length,
        monthlyRevenue: financialRecords
            .filter(r => r.type === 'income')
            .reduce((sum, r) => sum + r.value, 0),
        monthlyExpenses: financialRecords
            .filter(r => r.type === 'expense')
            .reduce((sum, r) => sum + r.value, 0),
        get monthlyProfit() {
            return this.monthlyRevenue - this.monthlyExpenses;
        },
    };

    return (
        <DataContext.Provider
            value={{
                clients,
                services,
                appointments,
                financialRecords,
                dashboardStats,
                addClient,
                updateClient,
                deleteClient,
                addService,
                updateService,
                deleteService,
                addAppointment,
                updateAppointment,
                deleteAppointment,
                getTodayAppointments,
                addFinancialRecord,
                deleteFinancialRecord,
            }}
        >
            {children}
        </DataContext.Provider>
    );
}

export function useData(): DataContextType {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
}
