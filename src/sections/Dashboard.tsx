import { useData } from '../hooks/useData';
import { Users, Calendar, CalendarCheck, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

export function Dashboard() {
    const { dashboardStats, getTodayAppointments, services } = useData();
    const todayAppointments = getTodayAppointments();

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    };

    const formatDate = () => {
        return new Date().toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    const statsCards = [
        {
            title: 'Total de Clientes',
            value: dashboardStats.totalClients,
            icon: Users,
            color: 'bg-blue-500',
            bgLight: 'bg-blue-50',
        },
        {
            title: 'Agendamentos Hoje',
            value: dashboardStats.todayAppointments,
            icon: CalendarCheck,
            color: 'bg-green-500',
            bgLight: 'bg-green-50',
        },
        {
            title: 'Total de Agendamentos',
            value: dashboardStats.totalAppointments,
            icon: Calendar,
            color: 'bg-purple-500',
            bgLight: 'bg-purple-50',
        },
        {
            title: 'Receita do Mês',
            value: formatCurrency(dashboardStats.monthlyRevenue),
            icon: TrendingUp,
            color: 'bg-emerald-500',
            bgLight: 'bg-emerald-50',
        },
        {
            title: 'Despesas do Mês',
            value: formatCurrency(dashboardStats.monthlyExpenses),
            icon: TrendingDown,
            color: 'bg-red-500',
            bgLight: 'bg-red-50',
        },
        {
            title: 'Lucro do Mês',
            value: formatCurrency(dashboardStats.monthlyProfit),
            icon: DollarSign,
            color: 'bg-pink-500',
            bgLight: 'bg-pink-50',
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-500 text-sm sm:text-base capitalize">{formatDate()}</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {statsCards.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-xl shadow-sm card-hover border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
                                <p className="text-2xl font-bold mt-1 text-gray-900">{stat.value}</p>
                            </div>
                            <div className={`${stat.color} w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Today's Appointments */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Agendamentos de Hoje</h2>
                    <span className="text-sm text-gray-500">{todayAppointments.length} agendamentos</span>
                </div>

                {todayAppointments.length === 0 ? (
                    <div className="text-center py-12">
                        <CalendarCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">Nenhum agendamento para hoje</p>
                        <p className="text-gray-400 text-sm mt-1">Os agendamentos aparecerão aqui</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {todayAppointments.map((apt) => (
                            <div key={apt.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors gap-3">
                                <div className="flex items-center gap-3 sm:gap-4">
                                    <span className="bg-pink-100 text-pink-700 px-3 py-1.5 rounded-full font-bold text-xs sm:text-sm whitespace-nowrap">
                                        ⏱️ {apt.time}
                                    </span>
                                    <div className="min-w-0">
                                        <p className="font-bold text-gray-900 truncate">{apt.clientName}</p>
                                        <p className="text-xs sm:text-sm text-gray-500 truncate">{apt.services.map(s => s.name).join(', ')}</p>
                                    </div>
                                </div>
                                <div className="flex justify-between sm:justify-end items-center sm:block">
                                    <span className="text-[10px] text-gray-400 uppercase font-bold sm:hidden">Valor</span>
                                    <span className="font-bold text-green-600 text-base sm:text-lg">
                                        {formatCurrency(apt.totalValue)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Available Services */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h2 className="text-xl font-semibold mb-6 text-gray-900">Serviços Disponíveis</h2>
                <div className="flex flex-wrap gap-3">
                    {services.filter(s => s.active).map((service) => (
                        <span
                            key={service.id}
                            className="px-4 py-2 rounded-full text-sm font-medium transition-transform hover:scale-105"
                            style={{
                                backgroundColor: `${service.color}20`,
                                color: service.color,
                                border: `1px solid ${service.color}40`
                            }}
                        >
                            {service.name} - {formatCurrency(service.price)}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}
