import { Cake, Gift, MessageCircle } from 'lucide-react';
import { isBirthdayToday } from '../../utils/birthday';
import type { Client } from '../../types';

interface BirthdayWidgetProps {
    todayBirthdays: Client[];
    monthBirthdays: Client[];
    onSendWhatsApp: (name: string, phone: string) => void;
}

export function BirthdayWidget({ todayBirthdays, monthBirthdays, onSendWhatsApp }: BirthdayWidgetProps) {
    return (
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 h-full">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Cake className="w-5 h-5 text-pink-500" />
                Aniversariantes do Dia
            </h2>
            {todayBirthdays.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Gift className="w-10 h-10 text-gray-200 dark:text-gray-800 mb-2" />
                    <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">Ninguém faz aniversário hoje.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {todayBirthdays.map((client) => (
                        <div key={client.id} className="flex items-center justify-between p-3 bg-pink-50 dark:bg-pink-900/10 rounded-xl">
                            <div>
                                <p className="font-bold text-gray-900 dark:text-white text-sm">{client.name}</p>
                                <p className="text-xs text-pink-600 dark:text-pink-400 font-medium tracking-tighter uppercase">Parabéns! 🎉</p>
                            </div>
                            <button
                                aria-label={`Enviar parabéns por WhatsApp para ${client.name}`}
                                onClick={() => onSendWhatsApp(client.name, client.phone)}
                                className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-sm"
                                title="Enviar Parabéns"
                            >
                                <MessageCircle className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {monthBirthdays.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-50 dark:border-gray-800">
                    <h3 id="month-birthdays-heading" className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">No mês</h3>
                    <div className="space-y-3 max-h-[150px] overflow-y-auto pr-1" aria-labelledby="month-birthdays-heading" role="list">
                        {monthBirthdays.filter(c => !isBirthdayToday(c.birthDate!)).map(client => (
                            <div key={client.id} className="flex items-center justify-between" role="listitem">
                                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">{client.name}</span>
                                <span className="text-xs font-bold text-gray-400 dark:text-gray-500">
                                    {client.birthDate?.split('-')[2]}/{client.birthDate?.split('-')[1]}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
