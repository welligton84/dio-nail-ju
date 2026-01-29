import { useData } from '../hooks/useData';
import { BarChart3, Users, Calendar, DollarSign, TrendingUp, PieChart } from 'lucide-react';

export function Reports() {
    const { clients, services, appointments, financialRecords, dashboardStats } = useData();

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    };

    // Calculate service popularity
    const serviceStats = services.map(service => {
        const count = appointments.reduce((acc, apt) => {
            return acc + apt.services.filter(s => s.id === service.id).length;
        }, 0);
        return { ...service, count };
    }).sort((a, b) => b.count - a.count);

    // Calculate client frequency
    const topClients = [...clients]
        .sort((a, b) => b.totalVisits - a.totalVisits)
        .slice(0, 5);

    // Revenue by category
    const revenueByCategory = financialRecords
        .filter(r => r.type === 'income')
        .reduce((acc, r) => {
            acc[r.category] = (acc[r.category] || 0) + r.value;
            return acc;
        }, {} as Record<string, number>);

    // Expenses by category
    const expensesByCategory = financialRecords
        .filter(r => r.type === 'expense')
        .reduce((acc, r) => {
            acc[r.category] = (acc[r.category] || 0) + r.value;
            return acc;
        }, {} as Record<string, number>);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
                <p className="text-gray-500 mt-1">Análise de desempenho do studio</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="bg-blue-100 p-3 rounded-xl">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total de Clientes</p>
                            <p className="text-2xl font-bold text-gray-900">{clients.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="bg-purple-100 p-3 rounded-xl">
                            <Calendar className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total de Agendamentos</p>
                            <p className="text-2xl font-bold text-gray-900">{appointments.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="bg-green-100 p-3 rounded-xl">
                            <TrendingUp className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Receita Total</p>
                            <p className="text-2xl font-bold text-green-600">{formatCurrency(dashboardStats.monthlyRevenue)}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="bg-pink-100 p-3 rounded-xl">
                            <DollarSign className="w-6 h-6 text-pink-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Lucro Total</p>
                            <p className={`text-2xl font-bold ${dashboardStats.monthlyProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCurrency(dashboardStats.monthlyProfit)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Popular Services */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 mb-4">
                        <BarChart3 className="w-5 h-5 text-pink-500" />
                        Serviços Mais Populares
                    </h2>
                    {serviceStats.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">Nenhum dado disponível</p>
                    ) : (
                        <div className="space-y-4">
                            {serviceStats.slice(0, 5).map((service, index) => (
                                <div key={service.id} className="flex items-center gap-4">
                                    <span className="text-lg font-bold text-gray-400 w-6">#{index + 1}</span>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-medium text-gray-900">{service.name}</span>
                                            <span className="text-sm text-gray-500">{service.count} agendamentos</span>
                                        </div>
                                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all"
                                                style={{
                                                    width: `${(service.count / Math.max(...serviceStats.map(s => s.count), 1)) * 100}%`,
                                                    backgroundColor: service.color
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Top Clients */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 mb-4">
                        <Users className="w-5 h-5 text-blue-500" />
                        Clientes Mais Frequentes
                    </h2>
                    {topClients.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">Nenhum dado disponível</p>
                    ) : (
                        <div className="space-y-3">
                            {topClients.map((client, index) => (
                                <div key={client.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-600' : 'bg-gray-300'
                                        }`}>
                                        {index + 1}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">{client.name}</p>
                                        <p className="text-sm text-gray-500">{client.phone}</p>
                                    </div>
                                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                        {client.totalVisits} visitas
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Revenue by Category */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 mb-4">
                        <PieChart className="w-5 h-5 text-green-500" />
                        Receitas por Categoria
                    </h2>
                    {Object.keys(revenueByCategory).length === 0 ? (
                        <p className="text-gray-500 text-center py-8">Nenhum dado disponível</p>
                    ) : (
                        <div className="space-y-3">
                            {Object.entries(revenueByCategory).map(([category, value]) => (
                                <div key={category} className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                                    <span className="font-medium text-gray-900">{category}</span>
                                    <span className="text-green-600 font-semibold">{formatCurrency(value)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Expenses by Category */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 mb-4">
                        <PieChart className="w-5 h-5 text-red-500" />
                        Despesas por Categoria
                    </h2>
                    {Object.keys(expensesByCategory).length === 0 ? (
                        <p className="text-gray-500 text-center py-8">Nenhum dado disponível</p>
                    ) : (
                        <div className="space-y-3">
                            {Object.entries(expensesByCategory).map(([category, value]) => (
                                <div key={category} className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                                    <span className="font-medium text-gray-900">{category}</span>
                                    <span className="text-red-600 font-semibold">{formatCurrency(value)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
