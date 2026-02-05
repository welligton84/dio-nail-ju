/**
 * Formats a number to Brazilian currency (BRL)
 * @param value - The numeric value to format
 * @returns Formatted currency string (e.g., "R$ 1.234,56")
 */
export function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

/**
 * Parses a currency string to a number
 * @param value - The currency string to parse (e.g., "R$ 1.234,56" or "1234,56")
 * @returns The numeric value
 */
export function parseCurrency(value: string): number {
    const cleaned = value.replace(/[^\d,]/g, '').replace(',', '.');
    return parseFloat(cleaned) || 0;
}
