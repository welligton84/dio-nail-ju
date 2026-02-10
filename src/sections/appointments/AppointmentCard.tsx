import type { Appointment, AppointmentStatus } from '../../types';
import { Clock, Scissors, User, DollarSign, MessageSquare, Trash2, Edit2 } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';
import { haptics } from '../../utils/haptics';

interface AppointmentCardProps {
    appointment: Appointment;
    onEdit: (apt: Appointment) => void;
    onStatusChange: (id: string, status: AppointmentStatus) => void;
    onDelete: (id: string) => void;
    onPay: (apt: Appointment) => void;
    onWhatsApp: (apt: Appointment) => void;
}

export function AppointmentCard({
    appointment,
    onEdit,
    onStatusChange,
    onDelete,
    onPay,
    onWhatsApp
}: AppointmentCardProps) {
    const getStatusColor = (status: AppointmentStatus) => {
        switch (status) {
            case 'scheduled': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
            case 'confirmed': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300';
            case 'completed': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
            case 'cancelled': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
            case 'no-show': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300';
            default: return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
        }
    };

    return (
        <div className={`bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-2xl border ${appointment.paid ? 'border-green-200 dark:border-green-800 bg-green-50/30 dark:bg-green-900/10' : 'border-gray-100 dark:border-gray-800'} shadow-sm hover:shadow-md transition-all group relative overflow-hidden`}>
            {appointment.paid && (
                <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-xl shadow-sm z-10">
                    PAGO
                </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                        <select
                            value={appointment.status}
                            onChange={(e) => {
                                haptics.light();
                                onStatusChange(appointment.id, e.target.value as AppointmentStatus);
                            }}
                            disabled={appointment.paid}
                            className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border-none focus:ring-2 focus:ring-offset-1 focus:ring-pink-300 cursor-pointer ${getStatusColor(appointment.status)} ${appointment.paid ? 'opacity-70 cursor-not-allowed' : ''} dark:bg-gray-800`}
                        >
                            <option value="scheduled" className="dark:bg-gray-900">Agendado</option>
                            <option value="confirmed" className="dark:bg-gray-900">Confirmado</option>
                            <option value="completed" className="dark:bg-gray-900">Concluído</option>
                            <option value="no-show" className="dark:bg-gray-900">Não compareceu</option>
                            <option value="cancelled" className="dark:bg-gray-900">Cancelado</option>
                        </select>

                        <div className="flex items-center gap-1 text-gray-400 dark:text-gray-500 text-sm font-medium">
                            <Clock className="w-4 h-4" />
                            {appointment.time}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-pink-600 transition-colors">
                            {appointment.clientName}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                            <Scissors className="w-4 h-4 text-pink-400" />
                            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                                {appointment.services.map(s => s.name).join(', ')}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4 pt-1">
                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-pink-300" />
                            <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tighter">
                                {appointment.staffName}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <DollarSign className={`w-4 h-4 ${appointment.paid ? 'text-green-600' : 'text-green-400'}`} />
                            <span className={`text-sm font-bold ${appointment.paid ? 'text-green-700' : 'text-green-600'}`}>
                                {formatCurrency(appointment.totalValue)}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-row sm:flex-col items-center gap-2 w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-gray-50 dark:border-gray-800">
                    <div className="flex items-center gap-2 flex-1 sm:flex-none">
                        {!appointment.paid && appointment.status === 'completed' && (
                            <button
                                onClick={() => onPay(appointment)}
                                className="p-2 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/20 bg-green-50 dark:bg-green-900/10 rounded-lg transition-colors border border-green-200 dark:border-green-800 shadow-sm"
                                title="Registrar Pagamento"
                            >
                                <DollarSign className="w-5 h-5" />
                            </button>
                        )}

                        {!appointment.paid && (
                            <>
                                <button
                                    onClick={() => { haptics.light(); onEdit(appointment); }}
                                    className="p-3 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors"
                                    title="Editar Agendamento"
                                >
                                    <Edit2 className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => { haptics.light(); onDelete(appointment.id); }}
                                    className="p-3 text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 rounded-xl transition-colors"
                                    title="Excluir"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </>
                        )}

                        <button
                            onClick={() => { haptics.light(); onWhatsApp(appointment); }}
                            className="p-3 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-xl transition-colors border border-green-100 dark:border-green-900/30 sm:border-0"
                            title="Enviar WhatsApp"
                        >
                            <MessageSquare className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
