import type { Appointment, AppointmentStatus } from '../../types';
import { Clock, Scissors, User, DollarSign, MessageSquare, Trash2, Edit2 } from 'lucide-react';

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
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const getStatusColor = (status: AppointmentStatus) => {
        switch (status) {
            case 'scheduled': return 'bg-blue-100 text-blue-700';
            case 'confirmed': return 'bg-purple-100 text-purple-700';
            case 'completed': return 'bg-green-100 text-green-700';
            case 'cancelled': return 'bg-red-100 text-red-700';
            case 'no-show': return 'bg-orange-100 text-orange-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className={`bg-white p-4 sm:p-6 rounded-2xl border ${appointment.paid ? 'border-green-200 bg-green-50/30' : 'border-gray-100'} shadow-sm hover:shadow-md transition-all group relative overflow-hidden`}>
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
                            onChange={(e) => onStatusChange(appointment.id, e.target.value as AppointmentStatus)}
                            disabled={appointment.paid}
                            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border-none focus:ring-2 focus:ring-offset-1 focus:ring-pink-300 cursor-pointer ${getStatusColor(appointment.status)} ${appointment.paid ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            <option value="scheduled">Agendado</option>
                            <option value="confirmed">Confirmado</option>
                            <option value="completed">Concluído</option>
                            <option value="no-show">Não compareceu</option>
                            <option value="cancelled">Cancelado</option>
                        </select>

                        <div className="flex items-center gap-1 text-gray-400 text-sm font-medium">
                            <Clock className="w-4 h-4" />
                            {appointment.time}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-pink-600 transition-colors">
                            {appointment.clientName}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                            <Scissors className="w-4 h-4 text-pink-400" />
                            <span className="text-sm text-gray-500 font-medium">
                                {appointment.services.map(s => s.name).join(', ')}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4 pt-1">
                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-pink-300" />
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">
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

                <div className="flex flex-row sm:flex-col items-center gap-2 w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-gray-50">
                    <div className="flex items-center gap-2 flex-1 sm:flex-none">
                        {!appointment.paid && appointment.status === 'completed' && (
                            <button
                                onClick={() => onPay(appointment)}
                                className="p-2 text-green-600 hover:bg-green-100 bg-green-50 rounded-lg transition-colors border border-green-200 shadow-sm"
                                title="Registrar Pagamento"
                            >
                                <DollarSign className="w-5 h-5" />
                            </button>
                        )}

                        {!appointment.paid && (
                            <>
                                <button
                                    onClick={() => onEdit(appointment)}
                                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Editar Agendamento"
                                >
                                    <Edit2 className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => onDelete(appointment.id)}
                                    className="p-2 text-gray-300 hover:text-red-500 rounded-lg transition-colors"
                                    title="Excluir"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </>
                        )}

                        <button
                            onClick={() => onWhatsApp(appointment)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-green-100 sm:border-0"
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
