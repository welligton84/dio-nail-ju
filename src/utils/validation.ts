import { z } from 'zod';

// Client validation schema
export const clientSchema = z.object({
    name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
    phone: z.string()
        .min(10, 'Telefone inválido')
        .regex(/^\(?[1-9]{2}\)?\s?9?\d{4}-?\d{4}$/, 'Formato de telefone inválido'),
    email: z.string().email('E-mail inválido').optional().or(z.literal('')),
    cpf: z.string()
        .regex(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/, 'CPF inválido')
        .optional()
        .or(z.literal('')),
    birthDate: z.string().optional().or(z.literal('')),
    address: z.string().optional().or(z.literal('')),
});

export type ClientFormValidation = z.infer<typeof clientSchema>;

// Service validation schema
export const serviceSchema = z.object({
    name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
    description: z.string().optional().or(z.literal('')),
    price: z.string()
        .refine((val) => !isNaN(parseFloat(val)), 'Preço deve ser um número válido')
        .refine((val) => parseFloat(val) > 0, 'Preço deve ser maior que zero'),
    duration: z.string()
        .refine((val) => !isNaN(parseInt(val)), 'Duração deve ser um número válido')
        .refine((val) => parseInt(val) > 0, 'Duração deve ser maior que zero'),
    category: z.enum(['Manicure', 'Pedicure', 'Alongamento', 'Decoração', 'Spa', 'Outros'] as const),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor deve ser um código hexadecimal válido'),
    active: z.boolean(),
});

export type ServiceFormValidation = z.infer<typeof serviceSchema>;

// Appointment validation schema
export const appointmentSchema = z.object({
    clientId: z.string().min(1, 'Selecione um cliente'),
    date: z.string().min(1, 'Data é obrigatória'),
    time: z.string()
        .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:mm)'),
    serviceIds: z.array(z.string()).min(1, 'Selecione pelo menos um serviço'),
    notes: z.string().optional().or(z.literal('')),
    status: z.enum(['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show'] as const),
    staffId: z.string().min(1, 'Selecione um profissional'),
});

export type AppointmentFormValidation = z.infer<typeof appointmentSchema>;

// Staff validation schema
export const staffSchema = z.object({
    name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
    phone: z.string()
        .min(10, 'Telefone inválido')
        .regex(/^\(?[1-9]{2}\)?\s?9?\d{4}-?\d{4}$/, 'Formato de telefone inválido'),
    role: z.string().min(2, 'Função/cargo é obrigatório'),
    commission: z.number()
        .min(0, 'Comissão não pode ser negativa')
        .max(100, 'Comissão não pode ser maior que 100%'),
    active: z.boolean(),
});

export type StaffFormValidation = z.infer<typeof staffSchema>;

// Financial Record validation schema
export const financialRecordSchema = z.object({
    type: z.enum(['income', 'expense'] as const),
    category: z.string().min(1, 'Categoria é obrigatória'),
    description: z.string().min(3, 'Descrição deve ter no mínimo 3 caracteres'),
    value: z.string()
        .refine((val) => !isNaN(parseFloat(val)), 'Valor deve ser um número válido')
        .refine((val) => parseFloat(val) > 0, 'Valor deve ser maior que zero'),
    date: z.string().min(1, 'Data é obrigatória'),
    paymentMethod: z.enum(['pix', 'cash', 'card'] as const),
});

export type FinancialRecordFormValidation = z.infer<typeof financialRecordSchema>;

// User validation schema
export const userSchema = z.object({
    name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
    email: z.string().email('E-mail inválido'),
    role: z.enum(['admin', 'employee'] as const),
    password: z.string()
        .min(6, 'Senha deve ter no mínimo 6 caracteres')
        .optional(),
    active: z.boolean(),
});

export type UserFormValidation = z.infer<typeof userSchema>;

// Login validation schema
export const loginSchema = z.object({
    email: z.string().email('E-mail inválido'),
    password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

export type LoginFormValidation = z.infer<typeof loginSchema>;
