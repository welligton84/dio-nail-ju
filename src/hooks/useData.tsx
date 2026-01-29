import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Client, Service, Appointment, FinancialRecord, DashboardStats } from '../types';

// Initial demo data
const INITIAL_SERVICES: Service[] = [
    { id: '1', name: 'Manicure Simples', description: 'Corte, lixamento e esmaltação', price: 35, duration: 45, category: 'Manicure', active: true, color: '#F472B6' },
    { id: '2', name: 'Pedicure Simples', description: 'Corte, lixamento e esmaltação', price: 40, duration: 50, category: 'Pedicure', active: true, color: '#A78BFA' },
    { id: '3', name: 'Alongamento em Gel', description: 'Alongamento com gel na tips ou molde', price: 120, duration: 120, category: 'Alongamento', active: true, color: '#60A5FA' },
    { id: '4', name: 'Manutenção de Gel', description: 'Manutenção do alongamento', price: 80, duration: 90, category: 'Alongamento', active: true, color: '#34D399' },
    { id: '5', name: 'Nail Art', description: 'Decoração artística das unhas', price: 25, duration: 30, category: 'Decoração', active: true, color: '#FBBF24' },
    { id: '6', name: 'Spa dos Pés', description: 'Hidratação e cuidados especiais', price: 55, duration: 60, category: 'Spa', active: true, color: '#F87171' },
];

const INITIAL_CLIENTS: Client[] = [
    { id: '1', name: 'Maria Silva', phone: '(11) 98765-4321', email: 'maria@email.com', cpf: '123.456.789-00', address: 'Rua das Flores, 123', birthDate: '1990-05-15', totalVisits: 15, createdAt: '2024-01-01', lastVisit: '2024-01-20' },
    { id: '2', name: 'Ana Paula', phone: '(11) 91234-5678', email: 'ana@email.com', cpf: '234.567.890-11', address: 'Av. Paulista, 1500', totalVisits: 8, createdAt: '2024-01-05', lastVisit: '2024-01-18' },
    { id: '3', name: 'Juliana Costa', phone: '(11) 99876-5432', cpf: '345.678.901-22', address: 'Rua Augusta, 500', totalVisits: 22, createdAt: '2023-12-01', lastVisit: '2024-01-22' },
    { id: '4', name: 'Fernanda Lima', phone: '(11) 93456-7890', cpf: '456.789.012-33', address: 'Rua Oscar Freire, 1000', totalVisits: 5, createdAt: '2024-01-10', lastVisit: '2024-01-15' },
    { id: '5', name: 'Carolina Souza', phone: '(11) 94567-8901', cpf: '567.890.123-44', address: 'Rua Haddock Lobo, 800', totalVisits: 12, createdAt: '2023-11-15', lastVisit: '2024-01-19' },
];

interface DataContextType {
    // Data
    clients: Client[];
    services: Service[];
    appointments: Appointment[];
    financialRecords: FinancialRecord[];
    dashboardStats: DashboardStats;

    // Client actions
    addClient: (client: Omit<Client, 'id' | 'createdAt' | 'totalVisits'>) => void;
    updateClient: (id: string, data: Partial<Client>) => void;
    deleteClient: (id: string) => void;

    // Service actions
    addService: (service: Omit<Service, 'id'>) => void;
    updateService: (id: string, data: Partial<Service>) => void;
    deleteService: (id: string) => void;

    // Appointment actions
    addAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt'>) => void;
    updateAppointment: (id: string, data: Partial<Appointment>) => void;
    deleteAppointment: (id: string) => void;
    getTodayAppointments: () => Appointment[];

    // Financial actions
    addFinancialRecord: (record: Omit<FinancialRecord, 'id' | 'createdAt'>) => void;
    deleteFinancialRecord: (id: string) => void;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
    const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
    const [services, setServices] = useState<Service[]>(INITIAL_SERVICES);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [financialRecords, setFinancialRecords] = useState<FinancialRecord[]>([]);

    // Client actions
    const addClient = (client: Omit<Client, 'id' | 'createdAt' | 'totalVisits'>) => {
        const newClient: Client = {
            ...client,
            id: Date.now().toString(),
            createdAt: new Date().toISOString().split('T')[0],
            totalVisits: 0,
        };
        setClients(prev => [...prev, newClient]);
    };

    const updateClient = (id: string, data: Partial<Client>) => {
        setClients(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
    };

    const deleteClient = (id: string) => {
        setClients(prev => prev.filter(c => c.id !== id));
    };

    // Service actions
    const addService = (service: Omit<Service, 'id'>) => {
        const newService: Service = {
            ...service,
            id: Date.now().toString(),
        };
        setServices(prev => [...prev, newService]);
    };

    const updateService = (id: string, data: Partial<Service>) => {
        setServices(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
    };

    const deleteService = (id: string) => {
        setServices(prev => prev.filter(s => s.id !== id));
    };

    // Appointment actions
    const addAppointment = (appointment: Omit<Appointment, 'id' | 'createdAt'>) => {
        const newAppointment: Appointment = {
            ...appointment,
            id: Date.now().toString(),
            createdAt: new Date().toISOString().split('T')[0],
        };
        setAppointments(prev => [...prev, newAppointment]);

        // Update client last visit
        updateClient(appointment.clientId, { lastVisit: appointment.date });
    };

    const updateAppointment = (id: string, data: Partial<Appointment>) => {
        setAppointments(prev => prev.map(a => {
            if (a.id === id) {
                const updated = { ...a, ...data };

                // If status changed to confirmed, simulate notification
                if (data.status === 'confirmed' && a.status !== 'confirmed') {
                    console.log(`[NOTIFICAÇÃO] Enviando SMS e E-mail para ${a.clientName}...`);
                    console.log(`Mensagem: Olá ${a.clientName}, seu agendamento para o dia ${a.date} às ${a.time} foi confirmado!`);
                    alert(`✅ Notificações enviadas para ${a.clientName} (Email & SMS)`);
                }

                return updated;
            }
            return a;
        }));
    };

    const deleteAppointment = (id: string) => {
        setAppointments(prev => prev.filter(a => a.id !== id));
    };

    const getTodayAppointments = (): Appointment[] => {
        const today = new Date().toISOString().split('T')[0];
        return appointments
            .filter(a => a.date === today)
            .sort((a, b) => a.time.localeCompare(b.time));
    };

    // Financial actions
    const addFinancialRecord = (record: Omit<FinancialRecord, 'id' | 'createdAt'>) => {
        const newRecord: FinancialRecord = {
            ...record,
            id: Date.now().toString(),
            createdAt: new Date().toISOString().split('T')[0],
        };
        setFinancialRecords(prev => [...prev, newRecord]);
    };

    const deleteFinancialRecord = (id: string) => {
        setFinancialRecords(prev => prev.filter(r => r.id !== id));
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
