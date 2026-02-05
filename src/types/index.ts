// User types
export interface User {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'employee';
    active: boolean;
    createdAt: string;
}

// Staff types
export interface Staff {
    id: string;
    name: string;
    phone: string;
    role: string;
    commission: number; // percentage (0-100)
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
    cnpj?: string;
    birthDate?: string;
    totalVisits: number;
    createdAt: string;
    lastVisit?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    neighborhood?: string;
    addressNumber?: string;
    complement?: string;
    notes?: string;
    // Campos para NFS-e
    companyName?: string; // Razão Social (para PJ)
    stateRegistration?: string; // Inscrição Estadual
    cityRegistration?: string; // Inscrição Municipal
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
    staffId: string;
    staffName: string;
    createdAt: string;
    paid: boolean;
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
    paymentMethod: 'pix' | 'cash' | 'card';
}

export type PaymentMethod = 'pix' | 'cash' | 'card';

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
    cnpj?: string;
    birthDate: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    neighborhood?: string;
    addressNumber?: string;
    complement?: string;
    companyName?: string;
    stateRegistration?: string;
    cityRegistration?: string;
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
    staffId: string;
}

export interface StaffFormData {
    name: string;
    phone: string;
    role: string;
    commission: number;
    active: boolean;
}

export interface FinancialFormData {
    type: 'income' | 'expense';
    category: string;
    description: string;
    value: string;
    date: string;
    paymentMethod: 'pix' | 'cash' | 'card';
}
