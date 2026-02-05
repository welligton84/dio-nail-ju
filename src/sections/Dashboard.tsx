import { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Users, Calendar, TrendingUp, DollarSign, Clock, MessageSquare } from 'lucide-react';
import { StatCard } from '../components/shared/StatCard';
import { StatCardSkeleton } from '../components/shared/Skeleton';
import { formatCurrency } from '../utils/currency';
import { WhatsAppModal } from '../components/shared/WhatsAppModal';
import type { Appointment } from '../types';

export function Dashboard() {
    const { clients, dashboardStats, getTodayAppointments, loading, services } = useData();
    const todayAppointments = getTodayAppointments();

    const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
    const [whatsAppAppointment, setWhatsAppAppointment] = useState<Appointment | null>(null);
    const [whatsAppPhone, setWhatsAppPhone] = useState<string>('');

    const handleWhatsApp = (apt: Appointment) => {
        const client = clients.find(c => c.id === apt.clientId);
        if (client && client.phone) {
            setWhatsAppAppointment(apt);
            setWhatsAppPhone(client.phone);
            setShowWhatsAppModal(true);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Olá, Juliana!</h1>
                    <p className="text-gray-500 mt-1">Veja o que está acontecendo hoje no studio.</p>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {loading ? (
                    <>
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                    </>
                ) : (
                    <>
                        <StatCard
                            title="Total de Clientes"
                            value={dashboardStats.totalClients}
                            icon={Users}
                            color="bg-blue-500"
                        />
                        <StatCard
                            title="Hoje"
                            value={dashboardStats.todayAppointments}
                            icon={Calendar}
                            color="bg-purple-500"
                        />
                        <StatCard
                            title="Receita / Mês"
                            value={formatCurrency(dashboardStats.monthlyRevenue)}
                            icon={TrendingUp}
                            color="bg-green-500"
                        />
                        <StatCard
                            title="Lucro / Mês"
                            value={formatCurrency(dashboardStats.monthlyProfit)}
                            icon={DollarSign}
                            color="bg-pink-500"
                        />
                    </>
                )}
            </div>

            {/* Today's Appointments */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-pink-500" />
                                Próximos Atendimentos
                            </h2>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Hoje</span>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {todayAppointments.length === 0 ? (
                                <div className="p-12 text-center">
                                    <Calendar className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                                    <p className="text-gray-500 font-medium">Nenhum agendamento para hoje.</p>
                                </div>
                            ) : (
                                todayAppointments.map((apt) => (
                                    <div key={apt.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="flex items-start gap-4">
                                                <div className="bg-pink-50 text-pink-600 px-3 py-2 rounded-xl text-center min-w-[70px]">
                                                    <span className="block text-sm font-bold uppercase">{apt.time}</span>
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-900">{apt.clientName}</h3>
                                                    <p className="text-sm text-gray-500">
                                                        {apt.services.map(s => s.name).join(', ')}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-xs font-medium text-gray-400">Profissional:</span>
                                                        <span className="text-xs font-bold text-pink-400 uppercase tracking-tighter">{apt.staffName}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                                                <span className="text-lg font-bold text-green-600 sm:mr-4">
                                                    {formatCurrency(apt.totalValue)}
                                                </span>
                                                <button
                                                    onClick={() => handleWhatsApp(apt)}
                                                    className="flex items-center gap-2 px-4 py-2 text-green-600 hover:bg-green-50 rounded-xl transition-colors font-semibold border border-green-100"
                                                >
                                                    <MessageSquare className="w-4 h-4" />
                                                    <span className="text-sm sm:inline">WhatsApp</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Popular Services Mini List */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-green-500" />
                            Serviços Ativos
                        </h2>
                        <div className="space-y-4">
                            {services.filter(s => s.active).slice(0, 4).map((service) => (
                                <div key={service.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: service.color }} />
                                        <span className="text-sm font-medium text-gray-700">{service.name}</span>
                                    </div>
                                    <span className="text-sm font-bold text-gray-900">{formatCurrency(service.price)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* WhatsApp Modal */}
            <WhatsAppModal
                isOpen={showWhatsAppModal}
                onClose={() => setShowWhatsAppModal(false)}
                appointment={whatsAppAppointment}
                clientPhone={whatsAppPhone}
            />
        </div>
    );
}
