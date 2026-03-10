import { describe, it, expect } from 'vitest';
import { 
    clientSchema, 
    serviceSchema, 
    appointmentSchema, 
    staffSchema, 
    financialRecordSchema,
    loginSchema
} from './validation';

describe('clientSchema', () => {
    it('should validate a valid client', () => {
        const validClient = {
            name: 'João Silva',
            phone: '(11) 99999-8888',
            email: 'joao@email.com'
        };
        expect(clientSchema.safeParse(validClient).success).toBe(true);
    });

    it('should reject short name', () => {
        const invalidClient = {
            name: 'J',
            phone: '(11) 99999-8888'
        };
        expect(clientSchema.safeParse(invalidClient).success).toBe(false);
    });

    it('should reject invalid email', () => {
        const invalidClient = {
            name: 'João Silva',
            phone: '(11) 99999-8888',
            email: 'invalid-email'
        };
        expect(clientSchema.safeParse(invalidClient).success).toBe(false);
    });
});

describe('serviceSchema', () => {
    it('should validate a valid service', () => {
        const validService = {
            name: 'Manicure',
            price: '50',
            duration: '30',
            category: 'Manicure' as const,
            color: '#EC4899',
            active: true,
            description: ''
        };
        expect(serviceSchema.safeParse(validService).success).toBe(true);
    });

    it('should reject negative price', () => {
        const invalidService = {
            name: 'Manicure',
            price: '-10',
            duration: '30',
            category: 'Manicure' as const,
            color: '#EC4899',
            active: true,
            description: ''
        };
        expect(serviceSchema.safeParse(invalidService).success).toBe(false);
    });

    it('should reject invalid category', () => {
        const invalidService = {
            name: 'Manicure',
            price: '50',
            duration: '30',
            category: 'InvalidCategory' as unknown as 'manicure' | 'pedicure' | ' design' | 'extensao' | 'outro',
            color: '#EC4899',
            active: true,
            description: ''
        };
        expect(serviceSchema.safeParse(invalidService).success).toBe(false);
    });
});

describe('appointmentSchema', () => {
    it('should validate a valid appointment', () => {
        const validAppointment = {
            clientId: 'client-123',
            date: '2024-01-15',
            time: '14:00',
            serviceIds: ['service-1'],
            staffId: 'staff-1',
            status: 'scheduled' as const
        };
        expect(appointmentSchema.safeParse(validAppointment).success).toBe(true);
    });

    it('should reject appointment without services', () => {
        const invalidAppointment = {
            clientId: 'client-123',
            date: '2024-01-15',
            time: '14:00',
            serviceIds: [],
            staffId: 'staff-1',
            status: 'scheduled' as const
        };
        expect(appointmentSchema.safeParse(invalidAppointment).success).toBe(false);
    });
});

describe('staffSchema', () => {
    it('should validate a valid staff member', () => {
        const validStaff = {
            name: 'Maria Santos',
            phone: '(11) 99999-8888',
            role: 'Manicure',
            commission: 15,
            active: true
        };
        expect(staffSchema.safeParse(validStaff).success).toBe(true);
    });

    it('should reject commission over 100', () => {
        const invalidStaff = {
            name: 'Maria Santos',
            phone: '(11) 99999-8888',
            role: 'Manicure',
            commission: 150,
            active: true
        };
        expect(staffSchema.safeParse(invalidStaff).success).toBe(false);
    });
});

describe('financialRecordSchema', () => {
    it('should validate a valid financial record', () => {
        const validRecord = {
            type: 'income' as const,
            category: 'Serviços',
            description: 'Atendimento manicure',
            value: '50',
            date: '2024-01-15',
            paymentMethod: 'pix' as const
        };
        expect(financialRecordSchema.safeParse(validRecord).success).toBe(true);
    });

    it('should reject negative value', () => {
        const invalidRecord = {
            type: 'income' as const,
            category: 'Serviços',
            description: 'Atendimento manicure',
            value: '-50',
            date: '2024-01-15',
            paymentMethod: 'pix' as const
        };
        expect(financialRecordSchema.safeParse(invalidRecord).success).toBe(false);
    });
});

describe('loginSchema', () => {
    it('should validate valid login credentials', () => {
        const validLogin = {
            email: 'test@example.com',
            password: '123456'
        };
        expect(loginSchema.safeParse(validLogin).success).toBe(true);
    });

    it('should reject short password', () => {
        const invalidLogin = {
            email: 'test@example.com',
            password: '123'
        };
        expect(loginSchema.safeParse(invalidLogin).success).toBe(false);
    });

    it('should reject invalid email', () => {
        const invalidLogin = {
            email: 'invalid-email',
            password: '123456'
        };
        expect(loginSchema.safeParse(invalidLogin).success).toBe(false);
    });
});
