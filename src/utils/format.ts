/**
 * Formatting utilities for Brazilian documents and data
 * @module utils/format
 */

/**
 * Formats a CPF (Brazilian individual taxpayer ID)
 * @example formatCPF('12345678900') => '123.456.789-00'
 */
export function formatCPF(value: string): string {
    return value
        .replace(/\D/g, '')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1');
}

/**
 * Formats a Brazilian phone number
 * @example formatPhone('11999998888') => '(11) 99999-8888'
 */
export function formatPhone(value: string): string {
    return value
        .replace(/\D/g, '')
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .replace(/(-\d{4})\d+?$/, '$1');
}

/**
 * Formats a CNPJ (Brazilian company taxpayer ID)
 * @example formatCNPJ('12345678000100') => '12.345.678/0001-00'
 */
export function formatCNPJ(value: string): string {
    return value
        .replace(/\D/g, '')
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1');
}

/**
 * Formats a Brazilian CEP (postal code)
 * @example formatCEP('12345678') => '12345-678'
 */
export function formatCEP(value: string): string {
    return value
        .replace(/\D/g, '')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .replace(/(-\d{3})\d+?$/, '$1');
}

/**
 * Formats an ISO date string to Brazilian format (dd/mm/yyyy)
 * @example formatDateBR('2024-01-15') => '15/01/2024'
 */
export function formatDateBR(dateStr: string): string {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('pt-BR');
}

/**
 * Removes all non-digit characters from a string
 * @example unformatNumber('(11) 99999-8888') => '11999998888'
 */
export function unformatNumber(value: string): string {
    return value.replace(/\D/g, '');
}
