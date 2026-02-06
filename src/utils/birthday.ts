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
    return `✨ Feliz Aniversário, ${clientName}! ✨\n\nTodo novo ano é um novo ciclo, um convite para se reconectar com seus propósitos e continuar se escolhendo. Que esta fase venha com leveza, clareza e muito autocuidado. 🤍\n\nQue este novo ano venha com mais clareza, leveza e momentos que façam sentido para a sua história. Que você continue se escolhendo, se priorizando e celebrando cada conquista, por menor que pareça.\n\nE para celebrar, durante todo o mês do seu aniversário, você ganha 10% de desconto em todos os procedimentos realizados conosco. 🎁\n\nAproveite esse presente. Você merece! 💫\n\nCom carinho, Juliana Miranda Concept 💅✨`;
}
