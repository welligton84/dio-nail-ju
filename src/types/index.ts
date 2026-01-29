// User types
export interface User {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'employee';
    active: boolean;
    createdAt: string;
}

// Client types
export interface Client {
    id: string;
    name: string;
    phone: string;
    email?: string;
    cpf?: string;
    birthDate?: string;
    totalVisits: number;
    createdAt: string;
    lastVisit?: string;
    notes?: string;
}

// Service types
export interface Service {
    id: string;
    name: string;
    description?: string;
    price: number;
    duration: number; // in minutes
    category: ServiceCategory;
    active: boolean;
    color: string;
}

export type ServiceCategory =
    | 'Manicure'
    | 'Pedicure'
    | 'Alongamento'
    | 'Decoração'
    | 'Spa'
    | 'Outros';

// Appointment types
export interface Appointment {
    id: string;
    clientId: string;
    clientName: string;
    services: Service[];
    date: string; // YYYY-MM-DD
    time: string; // HH:mm
    duration: number; // total duration in minutes
    status: AppointmentStatus;
    notes?: string;
    totalValue: number;
    createdAt: string;
}

export type AppointmentStatus =
    | 'scheduled'
    | 'confirmed'
    | 'completed'
    | 'cancelled'
    | 'no-show';

// Financial record types
export interface FinancialRecord {
    id: string;
    type: 'income' | 'expense';
    category: string;
    description: string;
    value: number;
    date: string;
    createdAt: string;
    appointmentId?: string; // Link to appointment if income from service
}

export const INCOME_CATEGORIES = ['Serviços', 'Produtos', 'Outros'] as const;
export const EXPENSE_CATEGORIES = ['Produtos', 'Aluguel', 'Contas', 'Equipamentos', 'Marketing', 'Outros'] as const;

// Dashboard stats
export interface DashboardStats {
    totalClients: number;
    totalAppointments: number;
    todayAppointments: number;
    monthlyRevenue: number;
    monthlyExpenses: number;
    monthlyProfit: number;
}

// Form data types
export interface ClientFormData {
    name: string;
    phone: string;
    email: string;
    cpf?: string;
    birthDate: string;
}

export interface ServiceFormData {
    name: string;
    description: string;
    price: string;
    duration: string;
    category: ServiceCategory;
    color: string;
    active: boolean;
}

export interface AppointmentFormData {
    clientId: string;
    date: string;
    time: string;
    serviceIds: string[];
    notes: string;
    status: AppointmentStatus;
}

export interface FinancialFormData {
    category: string;
    description: string;
    value: string;
    date: string;
}
