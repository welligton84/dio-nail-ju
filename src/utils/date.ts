/**
 * Gets current date in YYYY-MM-DD format
 * @returns Current date string
 */
export function getCurrentDate(): string {
    const now = new Date();
    return formatDateToISO(now);
}

/**
 * Formats a Date object to YYYY-MM-DD format
 * @param date - Date object to format
 * @returns Formatted date string
 */
export function formatDateToISO(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Gets the first day of the current month in YYYY-MM-DD format
 * @returns First day of current month
 */
export function getFirstDayOfMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
}

/**
 * Gets the last day of the current month in YYYY-MM-DD format
 * @returns Last day of current month
 */
export function getLastDayOfMonth(): string {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return formatDateToISO(lastDay);
}

/**
 * Checks if a date string is in the current month
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns True if date is in current month
 */
export function isCurrentMonth(dateString: string): boolean {
    const date = new Date(dateString);
    const now = new Date();
    return date.getFullYear() === now.getFullYear() && 
           date.getMonth() === now.getMonth();
}

/**
 * Formats a date string to Brazilian format (DD/MM/YYYY)
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Formatted date string (DD/MM/YYYY)
 */
export function formatDateToBR(dateString: string): string {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
}

/**
 * Formats a date to a human-readable format
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Formatted date string (e.g., "15 de Janeiro de 2024")
 */
export function formatDateToReadable(dateString: string): string {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}
