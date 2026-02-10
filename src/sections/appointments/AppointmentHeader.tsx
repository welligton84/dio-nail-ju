import { Plus } from 'lucide-react';

interface AppointmentHeaderProps {
    onNewAppointment: () => void;
}

export function AppointmentHeader({ onNewAppointment }: AppointmentHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Agendamentos</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Gerencie os horários do studio</p>
            </div>
            <button
                onClick={onNewAppointment}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 gradient-bg text-white rounded-xl hover:opacity-90 transition-all shadow-lg font-bold"
            >
                <Plus className="w-5 h-5" />
                Novo Agendamento
            </button>
        </div>
    );
}
