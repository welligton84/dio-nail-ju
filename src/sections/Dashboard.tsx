import { useState } from 'react';
import { useData } from '../contexts/DataContext';
import {
    Users,
    Calendar,
    TrendingUp,
    DollarSign,
    Clock,
    MessageSquare,
    Gift,
    Cake,
    MessageCircle
} from 'lucide-react';
import { StatCard } from '../components/shared/StatCard';
import { StatCardSkeleton } from '../components/shared/Skeleton';
import { formatCurrency } from '../utils/currency';
import { WhatsAppModal } from '../components/shared/WhatsAppModal';
import { isBirthdayToday } from '../utils/birthday';
import type { Appointment } from '../types';

export function Dashboard() {
    const { clients, dashboardStats, getTodayAppointments, loading, services, todayBirthdays, monthBirthdays } = useData();
    const todayAppointments = getTodayAppointments();

    const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
    const [whatsAppAppointment, setWhatsAppAppointment] = useState<Appointment | null>(null);
    const [whatsAppPhone, setWhatsAppPhone] = useState<string>('');
    const [whatsAppName, setWhatsAppName] = useState<string>('');
    const [isBirthdayMode, setIsBirthdayMode] = useState(false);

    const handleWhatsApp = (apt: Appointment) => {
        const client = clients.find(c => c.id === apt.clientId);
        if (client && client.phone) {
            setWhatsAppAppointment(apt);
            setWhatsAppPhone(client.phone);
            setWhatsAppName(client.name);
            setIsBirthdayMode(false);
            setShowWhatsAppModal(true);
        }
    };

    const handleBirthdayWhatsApp = (name: string, phone: string) => {
        setWhatsAppAppointment(null);
        setWhatsAppPhone(phone);
        setWhatsAppName(name);
        setIsBirthdayMode(true);
        setShowWhatsAppModal(true);
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
            </div>

            {/* Birthdays and Services */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                {/* Today's Birthdays */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Cake className="w-5 h-5 text-pink-500" />
                            Aniversariantes do Dia
                        </h2>
                        {todayBirthdays.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <Gift className="w-10 h-10 text-gray-200 mb-2" />
                                <p className="text-sm text-gray-400 font-medium">Ninguém faz aniversário hoje.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {todayBirthdays.map((client) => (
                                    <div key={client.id} className="flex items-center justify-between p-3 bg-pink-50 rounded-xl">
                                        <div>
                                            <p className="font-bold text-gray-900 text-sm">{client.name}</p>
                                            <p className="text-xs text-pink-600 font-medium tracking-tighter uppercase">Parabéns! 🎉</p>
                                        </div>
                                        <button
                                            onClick={() => handleBirthdayWhatsApp(client.name, client.phone)}
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
                            <div className="mt-6 pt-6 border-t border-gray-50">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">No mês</h3>
                                <div className="space-y-3 max-h-[150px] overflow-y-auto pr-1">
                                    {monthBirthdays.filter(c => !isBirthdayToday(c.birthDate!)).map(client => (
                                        <div key={client.id} className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600 font-medium">{client.name}</span>
                                            <span className="text-xs font-bold text-gray-400">
                                                {client.birthDate?.split('-')[2]}/{client.birthDate?.split('-')[1]}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Popular Services Mini List */}
                <div className="lg:col-span-2">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-green-500" />
                                Serviços Ativos
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {services.filter(s => s.active).slice(0, 6).map((service) => (
                                <div key={service.id} className="flex items-center justify-between p-3 border border-gray-50 rounded-xl hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: service.color }} />
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
                onClose={() => {
                    setShowWhatsAppModal(false);
                    setWhatsAppAppointment(null);
                    setIsBirthdayMode(false);
                }}
                appointment={whatsAppAppointment}
                clientPhone={whatsAppPhone}
                clientName={whatsAppName}
                isBirthday={isBirthdayMode}
            />
        </div>
    );
}
