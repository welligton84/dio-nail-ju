import { describe, it, expect } from 'vitest';
import {
    formatCPF,
    formatPhone,
    formatCNPJ,
    formatCEP,
    formatDateBR,
    unformatNumber
} from './format';

describe('formatCPF', () => {
    it('should format a valid CPF with 11 digits', () => {
        expect(formatCPF('12345678900')).toBe('123.456.789-00');
    });

    it('should handle partial CPF input', () => {
        expect(formatCPF('123')).toBe('123');
        expect(formatCPF('123456')).toBe('123.456');
        expect(formatCPF('123456789')).toBe('123.456.789');
    });

    it('should strip non-numeric characters', () => {
        expect(formatCPF('123.456.789-00')).toBe('123.456.789-00');
        expect(formatCPF('abc123def456')).toBe('123.456');
    });

    it('should not exceed 14 characters (with formatting)', () => {
        expect(formatCPF('123456789001234567890')).toBe('123.456.789-00');
    });
});

describe('formatPhone', () => {
    it('should format a mobile phone with 11 digits', () => {
        expect(formatPhone('74988011730')).toBe('(74) 98801-1730');
        expect(formatPhone('11999998888')).toBe('(11) 99999-8888');
    });

    it('should format a landline with 10 digits', () => {
        expect(formatPhone('1133334444')).toBe('(11) 33334-444');
    });

    it('should handle partial input', () => {
        expect(formatPhone('74')).toBe('74');
        expect(formatPhone('749')).toBe('(74) 9');
        expect(formatPhone('74988')).toBe('(74) 988');
        expect(formatPhone('7498801')).toBe('(74) 98801');
    });

    it('should strip non-numeric characters', () => {
        expect(formatPhone('(74) 98801-1730')).toBe('(74) 98801-1730');
    });
});

describe('formatCNPJ', () => {
    it('should format a valid CNPJ with 14 digits', () => {
        expect(formatCNPJ('12345678000100')).toBe('12.345.678/0001-00');
    });

    it('should handle partial CNPJ input', () => {
        expect(formatCNPJ('12')).toBe('12');
        expect(formatCNPJ('12345')).toBe('12.345');
        expect(formatCNPJ('12345678')).toBe('12.345.678');
        expect(formatCNPJ('123456780001')).toBe('12.345.678/0001');
    });

    it('should strip non-numeric characters', () => {
        expect(formatCNPJ('12.345.678/0001-00')).toBe('12.345.678/0001-00');
    });
});

describe('formatCEP', () => {
    it('should format a valid CEP with 8 digits', () => {
        expect(formatCEP('12345678')).toBe('12345-678');
    });

    it('should handle partial CEP input', () => {
        expect(formatCEP('12345')).toBe('12345');
        expect(formatCEP('123456')).toBe('12345-6');
    });

    it('should strip non-numeric characters', () => {
        expect(formatCEP('12345-678')).toBe('12345-678');
    });
});

describe('formatDateBR', () => {
    it('should format ISO date to Brazilian format', () => {
        expect(formatDateBR('2024-01-15')).toBe('15/01/2024');
        expect(formatDateBR('2023-12-25')).toBe('25/12/2023');
    });

    it('should return empty string for empty input', () => {
        expect(formatDateBR('')).toBe('');
    });

    it('should handle different months correctly', () => {
        expect(formatDateBR('2024-06-01')).toBe('01/06/2024');
        expect(formatDateBR('2024-11-30')).toBe('30/11/2024');
    });
});

describe('unformatNumber', () => {
    it('should remove all non-digit characters', () => {
        expect(unformatNumber('(11) 99999-8888')).toBe('11999998888');
        expect(unformatNumber('123.456.789-00')).toBe('12345678900');
        expect(unformatNumber('12.345.678/0001-00')).toBe('12345678000100');
    });

    it('should return only digits from mixed input', () => {
        expect(unformatNumber('abc123def456')).toBe('123456');
    });

    it('should return empty string for non-numeric input', () => {
        expect(unformatNumber('abcdef')).toBe('');
    });
});
