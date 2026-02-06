/**
 * Checks if a birth date (YYYY-MM-DD) matches today's day and month.
 * @param birthDate - The birth date string in YYYY-MM-DD format
 * @returns True if today is the birthday
 */
export function isBirthdayToday(birthDate: string): boolean {
    if (!birthDate) return false;

    const today = new Date();
    const parts = birthDate.split('-');
    const month = Number(parts[1]);
    const day = Number(parts[2]);

    return today.getDate() === day && (today.getMonth() + 1) === month;
}

/**
 * Checks if a birth date (YYYY-MM-DD) is in the current month.
 * @param birthDate - The birth date string in YYYY-MM-DD format
 * @returns True if the birthday is in the current month
 */
export function isBirthdayThisMonth(birthDate: string): boolean {
    if (!birthDate) return false;

    const today = new Date();
    const parts = birthDate.split('-');
    const month = Number(parts[1]);

    return (today.getMonth() + 1) === month;
}

/**
 * Gets a formatted birthday message for WhatsApp.
 * @param clientName - The name of the client
 * @returns A friendly birthday message
 */
export function getBirthdayMessage(clientName: string): string {
    return `Parabéns, ${clientName}! ✨\n\nDesejamos um dia maravilhoso, repleto de alegria e muita beleza. Que seu novo ciclo seja incrível!\n\nCom carinho, Juliana Miranda Concept 💅✨`;
}
