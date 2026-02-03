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

    useEffect(() => {
        if (!db) return;

        let loadedCount = 0;
        const totalCollections = 5;

        const checkLoading = () => {
            loadedCount++;
            if (loadedCount >= totalCollections) {
                setLoading(false);
            }
        };

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
            if (loading) checkLoading();
        }, (err) => handleError(err, 'clientes'));

        // Services listener
        const qServices = query(collection(db, 'services'), orderBy('name'));
        const unsubscribeServices = onSnapshot(qServices, (snapshot) => {
            setServices(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Service)));
            if (loading) checkLoading();
        }, (err) => handleError(err, 'serviços'));

        // Appointments listener
        const qAppointments = query(collection(db, 'appointments'), orderBy('date', 'desc'));
        const unsubscribeAppointments = onSnapshot(qAppointments, (snapshot) => {
            setAppointments(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Appointment)));
            if (loading) checkLoading();
        }, (err) => handleError(err, 'agendamentos'));

        // Financial Records listener
        const qFinancial = query(collection(db, 'financialRecords'), orderBy('date', 'desc'));
        const unsubscribeFinancial = onSnapshot(qFinancial, (snapshot) => {
            setFinancialRecords(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as FinancialRecord)));
            if (loading) checkLoading();
        }, (err) => handleError(err, 'financeiro'));

        // Staff listener
        const qStaff = query(collection(db, 'staff'), orderBy('name'));
        const unsubscribeStaff = onSnapshot(qStaff, (snapshot) => {
            setStaff(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Staff)));
            if (loading) checkLoading();
        }, (err) => handleError(err, 'profissionais'));

        return () => {
            unsubscribeClients();
            unsubscribeServices();
            unsubscribeAppointments();
            unsubscribeFinancial();
            unsubscribeStaff();
        };
    }, []);

    // Client actions
    const addClient = async (client: Omit<Client, 'id' | 'createdAt' | 'totalVisits'>) => {
        if (!db) return;
        await addDoc(collection(db, 'clients'), {
            ...client,
            totalVisits: 0,
            createdAt: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`
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
            createdAt: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`
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
        const now = new Date();
        const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        return appointments
            .filter(a => a.date === today)
            .sort((a, b) => a.time.localeCompare(b.time));
    };

    // Financial actions
    const addFinancialRecord = async (record: Omit<FinancialRecord, 'id' | 'createdAt'>) => {
        if (!db) return;
        await addDoc(collection(db, 'financialRecords'), {
            ...record,
            createdAt: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`
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

            const appointments = appointmentsQuery.docs.map(doc => doc.data());
            const clients = clientsQuery.docs;

            // 2. Update each client
            for (const clientDoc of clients) {
                const clientId = clientDoc.id;
                const visitCount = appointments.filter(a => a.clientId === clientId).length;

                await updateDoc(doc(db, 'clients', clientId), {
                    totalVisits: visitCount
                });
            }
            alert('Visitas sincronizadas com sucesso!');
        } catch (error) {
            console.error('Erro ao sincronizar visitas:', error);
            alert('Erro ao sincronizar visitas.');
        }
    };

    // Staff actions
    const addStaff = async (staffMember: Omit<Staff, 'id' | 'createdAt'>) => {
        if (!db) return;
        await addDoc(collection(db, 'staff'), {
            ...staffMember,
            createdAt: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`
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
        const now = new Date();
        const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

        const todayAppointments = appointments.filter(a => a.date === today);

        const monthlyRevenue = financialRecords
            .filter(r => r.type === 'income')
            .reduce((sum, r) => sum + r.value, 0);

        const monthlyExpenses = financialRecords
            .filter(r => r.type === 'expense')
            .reduce((sum, r) => sum + r.value, 0);

        return {
            totalClients: clients.length,
            totalAppointments: appointments.length,
            todayAppointments: todayAppointments.length,
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
