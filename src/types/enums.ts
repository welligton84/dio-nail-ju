export const AppointmentStatus = {
    SCHEDULED: 'scheduled',
    CONFIRMED: 'confirmed',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    NOSHOW: 'no-show', // changed to 'no-show' to match the original types
    IN_PROGRESS: 'in_progress'
} as const;

export type AppointmentStatus = typeof AppointmentStatus[keyof typeof AppointmentStatus];

export const FinancialType = {
    INCOME: 'income',
    EXPENSE: 'expense'
} as const;

export type FinancialType = typeof FinancialType[keyof typeof FinancialType];

export const PaymentMethod = {
    PIX: 'pix',
    CREDIT_CARD: 'credit',
    DEBIT_CARD: 'debit',
    CASH: 'cash',
    TRANSFER: 'transfer'
} as const;

export type PaymentMethod = typeof PaymentMethod[keyof typeof PaymentMethod];
