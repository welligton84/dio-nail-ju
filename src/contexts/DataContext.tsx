import { createContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
    where,
    writeBatch,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { toast } from 'sonner';
import { getFirebaseErrorCode } from '../utils/firebase-error';
import { getCurrentDate, isCurrentMonth } from '../utils/date';
import { isBirthdayToday, isBirthdayThisMonth } from '../utils/birthday';
import { useAuth } from './useAuth';
import type { ReactNode } from 'react';
import { AppointmentStatus, FinancialType } from '../types/enums';
import type { Client, Service, Appointment, FinancialRecord, DashboardStats, Staff, NFSeRecord } from '../types';

interface DataContextType {
    clients: Client[];
    services: Service[];
    appointments: Appointment[];
    financialRecords: FinancialRecord[];
    nfseRecords: NFSeRecord[];
    dashboardStats: DashboardStats;
    staff: Staff[];
    loading: boolean;
    error: string | null;
    clearError: () => void;
    todayBirthdays: Client[];
    monthBirthdays: Client[];
    loadFinancialByPeriod: (startDate: string, endDate: string) => void;
    loadNfseByPeriod: (startDate: string, endDate: string) => void;
    loadAppointmentsByPeriod: (startDate: string, endDate: string) => void;
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
    updateFinancialRecord: (id: string, data: Partial<FinancialRecord>) => Promise<void>;
    deleteFinancialRecord: (id: string) => Promise<void>;
    addNFSeRecord: (record: Omit<NFSeRecord, 'id' | 'issuedAt'>) => Promise<void>;
    syncVisitCounts: () => Promise<void>;
    addStaff: (staff: Omit<Staff, 'id' | 'createdAt'>) => Promise<void>;
    updateStaff: (id: string, data: Partial<Staff>) => Promise<void>;
    deleteStaff: (id: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);
export { DataContext };

export function DataProvider({ children }: { children: ReactNode }) {
    const [clients, setClients] = useState<Client[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [financialRecords, setFinancialRecords] = useState<FinancialRecord[]>([]);
    const [nfseRecords, setNfseRecords] = useState<NFSeRecord[]>([]);
    const [staff, setStaff] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { isAuthenticated, user } = useAuth();

    // Track lazy-loaded collection subscriptions
    const currentFinPeriodRef = useRef<{ start: string, end: string } | null>(null);
    const finUnsubRef = useRef<(() => void) | null>(null);
    const currentNfsePeriodRef = useRef<{ start: string, end: string } | null>(null);
    const nfseUnsubRef = useRef<(() => void) | null>(null);
    const currentAptPeriodRef = useRef<{ start: string, end: string } | null>(null);
    const aptUnsubRef = useRef<(() => void) | null>(null);
    const lazyUnsubsRef = useRef<(() => void)[]>([]);

    const clearError = () => setError(null);

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

        const handleError = (error: unknown, context: string) => {
            console.error(`Status Firestore [${context}]:`, error);
            const errorCode = getFirebaseErrorCode(error);
            if (errorCode === 'permission-denied') {
                console.warn('Verifique as regras de segurança do Firestore no Console.');
                setError('Permissão negada. Verifique as regras de segurança do Firestore.');
            } else {
                setError(`Erro ao carregar ${context}. Tente novamente mais tarde.`);
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

        // Initial Appointments listener (last 30 days by default)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const startDateStr = thirtyDaysAgo.toISOString().split('T')[0];

        const qAppointments = query(
            collection(db, 'appointments'),
            where('date', '>=', startDateStr),
            orderBy('date', 'desc')
        );

        const unsubscribeAppointments = onSnapshot(qAppointments, (snapshot) => {
            const newApts = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Appointment));
            setAppointments(newApts);
            checkLoading('agendamentos');
        }, (err) => handleError(err, 'agendamentos'));

        // Staff listener
        const qStaff = query(collection(db, 'staff'), orderBy('name'));
        const unsubscribeStaff = onSnapshot(qStaff, (snapshot) => {
            setStaff(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Staff)));
            checkLoading('profissionais');
        }, (err) => handleError(err, 'profissionais'));

        // Financial records listener (current month - needed for dashboardStats)
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
        const qFinancial = query(
            collection(db, 'financialRecords'),
            where('date', '>=', firstDayOfMonth),
            where('date', '<=', lastDayOfMonth),
            orderBy('date', 'desc')
        );
        const unsubscribeFinancial = onSnapshot(qFinancial, (snapshot) => {
            setFinancialRecords(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as FinancialRecord)));
            checkLoading('financeiro');
        }, (err) => handleError(err, 'financeiro'));

        return () => {
            unsubscribeClients();
            unsubscribeServices();
            unsubscribeAppointments();
            unsubscribeStaff();
            unsubscribeFinancial();
            // Copy ref to avoid stale closure - this is the correct pattern
            // eslint-disable-next-line react-hooks/exhaustive-deps
            const lazyUnsubs = lazyUnsubsRef.current;
            lazyUnsubs.forEach(unsub => unsub());
        };
    }, [isAuthenticated]);

    // Load financial records for a specific period (Busca Sob Demanda)
    const loadFinancialByPeriod = useCallback((startDate: string, endDate: string) => {
        if (!db || !isAuthenticated) return;

        // Skip if same period already being watched
        if (currentFinPeriodRef.current?.start === startDate && currentFinPeriodRef.current?.end === endDate) {
            return;
        }

        // Unsubscribe from previous period if any
        if (finUnsubRef.current) {
            finUnsubRef.current();
        }

        currentFinPeriodRef.current = { start: startDate, end: endDate };

        const q = query(
            collection(db, 'financialRecords'),
            where('date', '>=', startDate),
            where('date', '<=', endDate),
            orderBy('date', 'desc')
        );

        const unsub = onSnapshot(q, (snapshot) => {
            setFinancialRecords(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as FinancialRecord)));
        }, (err) => console.error('Firestore [financeiro-periodo]:', err));

        finUnsubRef.current = unsub;
    }, [isAuthenticated]);

    // Load NFSe records for a specific period (Busca Sob Demanda)
    const loadNfseByPeriod = useCallback((startDate: string, endDate: string) => {
        if (!db || !isAuthenticated) return;

        // Skip if same period already being watched
        if (currentNfsePeriodRef.current?.start === startDate && currentNfsePeriodRef.current?.end === endDate) {
            return;
        }

        // Unsubscribe from previous period if any
        if (nfseUnsubRef.current) {
            nfseUnsubRef.current();
        }

        currentNfsePeriodRef.current = { start: startDate, end: endDate };

        // NFSe usually uses issuedAt which is ISO string with time
        // We'll use where with ISO strings for the period
        const q = query(
            collection(db, 'nfseRecords'),
            where('issuedAt', '>=', startDate),
            where('issuedAt', '<=', endDate + 'T23:59:59Z'),
            orderBy('issuedAt', 'desc')
        );

        const unsub = onSnapshot(q, (snapshot) => {
            setNfseRecords(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as NFSeRecord)));
        }, (err) => console.error('Firestore [nfse-periodo]:', err));

        nfseUnsubRef.current = unsub;
    }, [isAuthenticated]);

    // Load appointments for a specific period (Busca Sob Demanda)
    const loadAppointmentsByPeriod = useCallback((startDate: string, endDate: string) => {
        if (!db || !isAuthenticated) return;

        // Skip if same period already being watched
        if (currentAptPeriodRef.current?.start === startDate && currentAptPeriodRef.current?.end === endDate) {
            return;
        }

        // Unsubscribe from previous period if any
        if (aptUnsubRef.current) {
            aptUnsubRef.current();
        }

        currentAptPeriodRef.current = { start: startDate, end: endDate };

        const q = query(
            collection(db, 'appointments'),
            where('date', '>=', startDate),
            where('date', '<=', endDate),
            orderBy('date', 'desc')
        );

        const unsub = onSnapshot(q, (snapshot) => {
            const periodApts = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Appointment));
            // Merging with existing state to avoid losing data if other periods were loaded
            // But actually for "Busca Sob Demanda" in calendar, we might want to replace
            // Let's replace for now as the calendar usually views one month at a time
            setAppointments(periodApts);
        }, (err) => console.error('Firestore [agendamentos-periodo]:', err));

        aptUnsubRef.current = unsub;
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
            createdAt: getCurrentDate(),
            createdBy: user?.id
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

        await updateDoc(doc(db, 'appointments', id), {
            ...data,
            updatedBy: user?.id
        });
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
            .filter(a => a.date === today && a.status !== AppointmentStatus.CANCELLED)
            .sort((a, b) => a.time.localeCompare(b.time));
    };

    // Financial actions
    const addFinancialRecord = async (record: Omit<FinancialRecord, 'id' | 'createdAt'>) => {
        if (!db) return;
        await addDoc(collection(db, 'financialRecords'), {
            ...record,
            createdAt: getCurrentDate(),
            createdBy: user?.id
        });
    };

    const deleteFinancialRecord = async (id: string) => {
        if (!db) return;
        await deleteDoc(doc(db, 'financialRecords', id));
    };

    const updateFinancialRecord = async (id: string, data: Partial<FinancialRecord>) => {
        if (!db) return;
        await updateDoc(doc(db, 'financialRecords', id), {
            ...data,
            updatedBy: user?.id
        });
    };

    // NFSe actions
    const addNFSeRecord = async (record: Omit<NFSeRecord, 'id' | 'issuedAt'>) => {
        if (!db) return;
        await addDoc(collection(db, 'nfseRecords'), {
            ...record,
            issuedAt: new Date().toISOString()
        });
    };

    const syncVisitCounts = async () => {
        if (!db) return;
        try {
            const appointmentsQuery = await getDocs(collection(db, 'appointments'));
            const clientsQuery = await getDocs(collection(db, 'clients'));

            // Pre-compute visit counts per client in a single pass
            const visitMap = new Map<string, number>();
            for (const aptDoc of appointmentsQuery.docs) {
                const data = aptDoc.data();
                if (data.status !== AppointmentStatus.CANCELLED) {
                    visitMap.set(data.clientId, (visitMap.get(data.clientId) || 0) + 1);
                }
            }

            // Batched writes instead of sequential updateDoc calls
            const batch = writeBatch(db);
            for (const clientDoc of clientsQuery.docs) {
                const visitCount = visitMap.get(clientDoc.id) || 0;
                batch.update(doc(db, 'clients', clientDoc.id), { totalVisits: visitCount });
            }
            await batch.commit();

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
            createdAt: getCurrentDate(),
            createdBy: user?.id
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

    // Calculate dashboard stats — single loop over financialRecords
    const dashboardStats: DashboardStats = useMemo(() => {
        const today = getCurrentDate();
        const activeToday = appointments.filter(a => a.date === today && a.status !== AppointmentStatus.CANCELLED);

        let monthlyRevenue = 0;
        let monthlyExpenses = 0;
        for (const r of financialRecords) {
            if (!isCurrentMonth(r.date)) continue;
            if (r.type === FinancialType.INCOME) {
                monthlyRevenue += r.value;
            } else if (r.type === FinancialType.EXPENSE) {
                monthlyExpenses += r.value;
            }
        }

        return {
            totalClients: clients.length,
            totalAppointments: appointments.length,
            todayAppointments: activeToday.length,
            monthlyRevenue,
            monthlyExpenses,
            monthlyProfit: monthlyRevenue - monthlyExpenses
        };
    }, [clients.length, appointments, financialRecords]);

    // Calculate birthdays
    const todayBirthdays = useMemo(() => {
        return clients.filter(c => c.birthDate && isBirthdayToday(c.birthDate));
    }, [clients]);

    const monthBirthdays = useMemo(() => {
        return clients.filter(c => c.birthDate && isBirthdayThisMonth(c.birthDate));
    }, [clients]);

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
                updateFinancialRecord,
                deleteFinancialRecord,
                addNFSeRecord,
                syncVisitCounts,
                staff,
                addStaff,
                updateStaff,
                deleteStaff,
                loading,
                error,
                clearError,
                todayBirthdays,
                monthBirthdays,
                nfseRecords,
                loadFinancialByPeriod,
                loadNfseByPeriod,
                loadAppointmentsByPeriod,
            }}
        >
            {children}
        </DataContext.Provider>
    );
}
