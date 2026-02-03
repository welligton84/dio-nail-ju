import { useMemo } from 'react';
import { useData } from '../hooks/useData';
import { BarChart3, Users, Calendar, DollarSign, TrendingUp, PieChart, RefreshCw } from 'lucide-react';
import { StatCard } from '../components/shared/StatCard';
import { Table } from '../components/shared/Table';
import type { Service, Appointment, FinancialRecord, Staff } from '../types';

export function Reports() {
    const { clients, services, appointments, financialRecords, dashboardStats, staff, syncVisitCounts } = useData();

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    };

    // Calculate service popularity
    const serviceStats = useMemo(() => services.map((service: Service) => {
        const count = appointments.reduce((acc: number, apt: Appointment) => {
            return acc + apt.services.filter(s => s.id === service.id).length;
        }, 0);
        return { ...service, count };
    }).sort((a: any, b: any) => b.count - a.count), [services, appointments]);

    // Calculate client frequency
    const topClients = useMemo(() => [...clients]
        .sort((a, b) => b.totalVisits - a.totalVisits)
        .slice(0, 5), [clients]);

    // Revenue by category
    const revenueByCategory = useMemo(() => financialRecords
        .filter((r: FinancialRecord) => r.type === 'income')
        .reduce((acc: Record<string, number>, r: FinancialRecord) => {
            acc[r.category] = (acc[r.category] || 0) + r.value;
            return acc;
        }, {}), [financialRecords]);

    // Expenses by category
    const expensesByCategory = useMemo(() => financialRecords
        .filter((r: FinancialRecord) => r.type === 'expense')
        .reduce((acc: Record<string, number>, r: FinancialRecord) => {
            acc[r.category] = (acc[r.category] || 0) + r.value;
            return acc;
        }, {}), [financialRecords]);

    // Calculate commissions by staff
    const staffCommissions = useMemo(() => staff.map((member: Staff) => {
        const completedApts = appointments.filter((apt: Appointment) =>
            apt.staffId === member.id &&
            apt.status === 'completed'
        );
        const totalSales = completedApts.reduce((sum: number, apt: Appointment) => sum + apt.totalValue, 0);
        const commissionAmount = (totalSales * member.commission) / 100;
        return {
            ...member,
            totalSales,
            commissionAmount,
            count: completedApts.length
        };
    }).sort((a, b) => b.totalSales - a.totalSales), [staff, appointments]);

    const commissionFooter = (
        <tr className="bg-gray-50 font-bold text-gray-900 border-t border-gray-100">
            <td colSpan={3} className="px-6 py-4">Total Geral</td>
            <td className="px-6 py-4">
                {formatCurrency(staffCommissions.reduce((sum: number, s) => sum + s.totalSales, 0))}
            </td>
            <td className="px-6 py-4"></td>
            <td className="px-6 py-4 text-pink-600">
                {formatCurrency(staffCommissions.reduce((sum: number, s) => sum + s.commissionAmount, 0))}
            </td>
        </tr>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Relatórios e Métricas</h1>
                    <p className="text-gray-500 mt-1">Visão geral do desempenho do seu negócio</p>
                </div>
                <button
                    onClick={() => syncVisitCounts()}
                    className="flex items-center gap-2 px-4 py-2 bg-pink-100 text-pink-600 rounded-xl hover:bg-pink-200 transition-colors"
                >
                    <RefreshCw className="w-4 h-4" />
                    <span className="text-sm font-semibold">Sincronizar Visitas</span>
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <StatCard
                    title="Total de Clientes"
                    value={clients.length}
                    icon={Users}
                    color="bg-blue-500"
                />
                <StatCard
                    title="Total de Agendamentos"
                    value={appointments.length}
                    icon={Calendar}
                    color="bg-purple-500"
                />
                <StatCard
                    title="Receita Total"
                    value={formatCurrency(dashboardStats.monthlyRevenue)}
                    icon={TrendingUp}
                    color="bg-green-500"
                />
                <StatCard
                    title="Lucro Total"
                    value={formatCurrency(dashboardStats.monthlyProfit)}
                    icon={DollarSign}
                    color="bg-pink-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Popular Services */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
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
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
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
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 mb-4">
                        <PieChart className="w-5 h-5 text-green-500" />
                        Receitas por Categoria
                    </h2>
                    {Object.keys(revenueByCategory).length === 0 ? (
                        <p className="text-gray-500 text-center py-8">Nenhum dado disponível</p>
                    ) : (
                        <div className="space-y-3">
                            {Object.entries(revenueByCategory).map(([category, value]) => (
                                <div key={category} className="flex items-center justify-between p-3 bg-green-50 rounded-xl font-medium">
                                    <span className="text-gray-900">{category}</span>
                                    <span className="text-green-600 font-bold">{formatCurrency(value)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Expenses by Category */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 mb-4">
                        <PieChart className="w-5 h-5 text-red-500" />
                        Despesas por Categoria
                    </h2>
                    {Object.keys(expensesByCategory).length === 0 ? (
                        <p className="text-gray-500 text-center py-8">Nenhum dado disponível</p>
                    ) : (
                        <div className="space-y-3">
                            {Object.entries(expensesByCategory).map(([category, value]) => (
                                <div key={category} className="flex items-center justify-between p-3 bg-red-50 rounded-xl font-medium">
                                    <span className="text-gray-900">{category}</span>
                                    <span className="text-red-600 font-bold">{formatCurrency(value)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Staff Commissions */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-yellow-500" />
                    Comissões por Profissional
                </h2>
                <Table
                    data={staffCommissions}
                    emptyMessage="Nenhum dado disponível. Complete agendamentos para ver o desempenho."
                    footer={commissionFooter}
                    columns={[
                        { header: 'Profissional', accessor: (m: any) => <span className="font-bold text-gray-900">{m.name}</span> },
                        { header: 'Cargo', accessor: (m: any) => <span>{m.role}</span> },
                        { header: 'Serviços', accessor: (m: any) => <span>{m.count} concluídos</span> },
                        { header: 'Venda Total', accessor: (m: any) => <span className="font-medium">{formatCurrency(m.totalSales)}</span> },
                        { header: 'Comissão (%)', accessor: (m: any) => <span>{m.commission}%</span> },
                        { header: 'A Pagar', accessor: (m: any) => <span className="font-bold text-pink-600">{formatCurrency(m.commissionAmount)}</span>, className: 'text-right' },
                    ]}
                />
            </div>
        </div>
    );
}
