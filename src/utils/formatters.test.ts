import { describe, it, expect } from 'vitest';

describe('PhoneInput formatting', () => {
    const formatPhone = (input: string): string => {
        const digits = input.replace(/\D/g, '');
        
        if (digits.length === 0) return '';
        if (digits.length <= 2) return `(${digits}`;
        if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
    };

    it('should format a valid phone number with 11 digits', () => {
        expect(formatPhone('11999998888')).toBe('(11) 99999-8888');
        expect(formatPhone('74988011730')).toBe('(74) 98801-1730');
    });

    it('should format a landline with 10 digits', () => {
        expect(formatPhone('1133334444')).toBe('(11) 33334-444');
    });

    it('should handle partial input', () => {
        expect(formatPhone('74')).toBe('(74');
        expect(formatPhone('749')).toBe('(74) 9');
        expect(formatPhone('74988')).toBe('(74) 988');
        expect(formatPhone('7498801')).toBe('(74) 98801');
    });

    it('should strip non-numeric characters', () => {
        expect(formatPhone('(74) 98801-1730')).toBe('(74) 98801-1730');
        expect(formatPhone('abc123def456')).toBe('(12) 3456');
    });

    it('should return empty string for non-numeric input', () => {
        expect(formatPhone('abcdef')).toBe('');
    });
});

describe('CurrencyInput formatting', () => {
    const formatCurrency = (input: string): string => {
        const digits = input.replace(/[^\d]/g, '');
        
        if (digits === '') return '';
        
        const cents = parseInt(digits) / 100;
        return cents.toFixed(2).replace('.', ',');
    };

    it('should format a valid currency value', () => {
        expect(formatCurrency('100')).toBe('1,00');
        expect(formatCurrency('1999')).toBe('19,99');
        expect(formatCurrency('123456')).toBe('1234,56');
    });

    it('should handle partial input', () => {
        expect(formatCurrency('1')).toBe('0,01');
        expect(formatCurrency('12')).toBe('0,12');
        expect(formatCurrency('123')).toBe('1,23');
    });

    it('should return empty string for empty input', () => {
        expect(formatCurrency('')).toBe('');
    });

    it('should handle string with dots and commas', () => {
        expect(formatCurrency('1.234,56')).toBe('1234,56');
    });
});
