import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    onSnapshot,
    query,
    orderBy,
    doc,
    getDocs,
    increment,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { toast } from 'sonner';
import { getCurrentDate, isCurrentMonth } from '../utils/date';
import { useAuth } from './AuthContext';
import type { ReactNode } from 'react';
import type { Client, Service, Appointment, FinancialRecord, DashboardStats, Staff } from '../types';

interface DataContextType {
    clients: Client[];
    services: Service[];
    appointments: Appointment[];
    financialRecords: FinancialRecord[];
    dashboardStats: DashboardStats;
    staff: Staff[];
    loading: boolean;
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
    syncVisitCounts: () => Promise<void>;
    addStaff: (staff: Omit<Staff, 'id' | 'createdAt'>) => Promise<void>;
    updateStaff: (id: string, data: Partial<Staff>) => Promise<void>;
    deleteStaff: (id: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
    const [clients, setClients] = useState<Client[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [financialRecords, setFinancialRecords] = useState<FinancialRecord[]>([]);
    const [staff, setStaff] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(true);
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        if (!db || !isAuthenticated) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const totalCollections = 5;
        const loadedCollections = new Set<string>();

        const checkLoading = (collectionName: string) => {
            loadedCollections.add(collectionName);
            if (loadedCollections.size >= totalCollections) {
                setLoading(false);
            }
        };

        const handleError = (error: any, context: string) => {
            console.error(`Status Firestore [${context}]:`, error);
            if (error.code === 'permission-denied') {
                console.warn('Verifique as regras de segurança do Firestore no Console.');
            }
            // Even if error, mark as loaded to prevent stuck spinner if rules block one collection
            checkLoading(context);
        };

        // Clients listener
        const qClients = query(collection(db, 'clients'), orderBy('name'));
        const unsubscribeClients = onSnapshot(qClients, (snapshot) => {
            setClients(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Client)));
            checkLoading('clientes');
        }, (err) => handleError(err, 'clientes'));

        // Services listener
        const qServices = query(collection(db, 'services'), orderBy('name'));
        const unsubscribeServices = onSnapshot(qServices, (snapshot) => {
            setServices(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Service)));
            checkLoading('serviços');
        }, (err) => handleError(err, 'serviços'));

        // Appointments listener
        const qAppointments = query(collection(db, 'appointments'), orderBy('date', 'desc'));
        const unsubscribeAppointments = onSnapshot(qAppointments, (snapshot) => {
            setAppointments(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Appointment)));
            checkLoading('agendamentos');
        }, (err) => handleError(err, 'agendamentos'));

        // Financial Records listener
        const qFinancial = query(collection(db, 'financialRecords'), orderBy('date', 'desc'));
        const unsubscribeFinancial = onSnapshot(qFinancial, (snapshot) => {
            setFinancialRecords(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as FinancialRecord)));
            checkLoading('financeiro');
        }, (err) => handleError(err, 'financeiro'));

        // Staff listener
        const qStaff = query(collection(db, 'staff'), orderBy('name'));
        const unsubscribeStaff = onSnapshot(qStaff, (snapshot) => {
            setStaff(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Staff)));
            checkLoading('profissionais');
        }, (err) => handleError(err, 'profissionais'));

        return () => {
            unsubscribeClients();
            unsubscribeServices();
            unsubscribeAppointments();
            unsubscribeFinancial();
            unsubscribeStaff();
        };
    }, [isAuthenticated]);

    // Client actions
    const addClient = async (client: Omit<Client, 'id' | 'createdAt' | 'totalVisits'>) => {
        if (!db) return;
        await addDoc(collection(db, 'clients'), {
            ...client,
            totalVisits: 0,
            createdAt: getCurrentDate()
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
            createdAt: getCurrentDate()
        });

        // Update client last visit and increment visits
        await updateDoc(doc(db, 'clients', appointment.clientId), {
            lastVisit: appointment.date,
            totalVisits: increment(1)
        });
    };

    const updateAppointment = async (id: string, data: Partial<Appointment>) => {
        if (!db) return;

        const oldApt = appointments.find(a => a.id === id);

        // Handle client change for visit counts
        if (oldApt && data.clientId && data.clientId !== oldApt.clientId) {
            // Decrement old client
            await updateDoc(doc(db, 'clients', oldApt.clientId), {
                totalVisits: increment(-1)
            });
            // Increment new client
            await updateDoc(doc(db, 'clients', data.clientId), {
                totalVisits: increment(1)
            });
        }

        await updateDoc(doc(db, 'appointments', id), data);
    };

    const deleteAppointment = async (id: string) => {
        if (!db) return;
        const apt = appointments.find(a => a.id === id);
        if (apt) {
            await updateDoc(doc(db, 'clients', apt.clientId), {
                totalVisits: increment(-1)
            });
        }
        await deleteDoc(doc(db, 'appointments', id));
    };

    const getTodayAppointments = (): Appointment[] => {
        const today = getCurrentDate();
        return appointments
            .filter(a => a.date === today && a.status !== 'cancelled')
            .sort((a, b) => a.time.localeCompare(b.time));
    };

    // Financial actions
    const addFinancialRecord = async (record: Omit<FinancialRecord, 'id' | 'createdAt'>) => {
        if (!db) return;
        await addDoc(collection(db, 'financialRecords'), {
            ...record,
            createdAt: getCurrentDate()
        });
    };

    const deleteFinancialRecord = async (id: string) => {
        if (!db) return;
        await deleteDoc(doc(db, 'financialRecords', id));
    };

    const syncVisitCounts = async () => {
        if (!db) return;
        try {
            // 1. Get all appointments and clients
            const appointmentsQuery = await getDocs(collection(db, 'appointments'));
            const clientsQuery = await getDocs(collection(db, 'clients'));

            const appointmentsData = appointmentsQuery.docs.map(doc => doc.data());
            const clientsDocs = clientsQuery.docs;

            // 2. Update each client
            for (const clientDoc of clientsDocs) {
                const clientId = clientDoc.id;
                const visitCount = appointmentsData.filter(a => a.clientId === clientId && a.status !== 'cancelled').length;

                await updateDoc(doc(db, 'clients', clientId), {
                    totalVisits: visitCount
                });
            }
            toast.success('Visitas sincronizadas com sucesso!');
        } catch (error) {
            console.error('Erro ao sincronizar visitas:', error);
            toast.error('Erro ao sincronizar visitas.');
        }
    };

    // Staff actions
    const addStaff = async (staffMember: Omit<Staff, 'id' | 'createdAt'>) => {
        if (!db) return;
        await addDoc(collection(db, 'staff'), {
            ...staffMember,
            createdAt: getCurrentDate()
        });
    };

    const updateStaff = async (id: string, data: Partial<Staff>) => {
        if (!db) return;
        await updateDoc(doc(db, 'staff', id), data);
    };

    const deleteStaff = async (id: string) => {
        if (!db) return;
        await deleteDoc(doc(db, 'staff', id));
    };

    // Calculate dashboard stats
    const dashboardStats: DashboardStats = useMemo(() => {
        const today = getCurrentDate();

        const activeToday = appointments.filter(a => a.date === today && a.status !== 'cancelled');

        // Filter financial records by current month
        const monthlyRevenue = financialRecords
            .filter(r => r.type === 'income' && isCurrentMonth(r.date))
            .reduce((sum, r) => sum + r.value, 0);

        const monthlyExpenses = financialRecords
            .filter(r => r.type === 'expense' && isCurrentMonth(r.date))
            .reduce((sum, r) => sum + r.value, 0);

        return {
            totalClients: clients.length,
            totalAppointments: appointments.length,
            todayAppointments: activeToday.length,
            monthlyRevenue,
            monthlyExpenses,
            monthlyProfit: monthlyRevenue - monthlyExpenses
        };
    }, [clients, appointments, financialRecords]);

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
                syncVisitCounts,
                staff,
                addStaff,
                updateStaff,
                deleteStaff,
                loading,
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
