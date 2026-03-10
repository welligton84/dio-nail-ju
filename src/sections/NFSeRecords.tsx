import { useMemo, useState, useEffect } from 'react';
import { useData } from '../contexts/useData';
import { FileText, Search, Download, Eye, Calendar, DollarSign, Filter } from 'lucide-react';
import { formatCurrency } from '../utils/currency';
import { formatDateToBR } from '../utils/date';
import { MONTHS } from '../utils/constants';
import { Loader2 } from 'lucide-react';

type NFSeFilter = 'all' | 'test' | 'sent' | 'confirmed' | 'error';

export function NFSeRecords() {
    const { nfseRecords, loading, loadNfseByPeriod } = useData();
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<NFSeFilter>('all');

    // Period selection
    const now = new Date();
    const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(now.getFullYear());

    // Filter current period (Busca Sob Demanda)
    useEffect(() => {
        const startDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`;
        const lastDayStr = String(new Date(selectedYear, selectedMonth, 0).getDate()).padStart(2, '0');
        const endDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${lastDayStr}`;

        loadNfseByPeriod(startDate, endDate);
    }, [selectedMonth, selectedYear, loadNfseByPeriod]);

    const yearOptions = Array.from({ length: 3 }, (_, i) => now.getFullYear() - i);
    const monthOptions = MONTHS;

    const filteredRecords = useMemo(() => {
        return nfseRecords.filter(record => {
            const matchesSearch =
                record.clientName.toLowerCase().includes(search.toLowerCase()) ||
                record.nfseNumber.toLowerCase().includes(search.toLowerCase()) ||
                record.verificationCode.toLowerCase().includes(search.toLowerCase());

            const matchesFilter = filter === 'all' || record.status === filter;

            return matchesSearch && matchesFilter;
        });
    }, [nfseRecords, search, filter]);

    const totalValue = useMemo(() => {
        return filteredRecords.reduce((sum, r) => sum + r.value, 0);
    }, [filteredRecords]);

    const totalIss = useMemo(() => {
        return filteredRecords.reduce((sum, r) => sum + r.issValue, 0);
    }, [filteredRecords]);

    const getStatusBadge = (status: string) => {
        const styles = {
            test: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
            sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
            confirmed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        };

        const labels = {
            test: 'Teste',
            sent: 'Enviada',
            confirmed: 'Confirmada',
            error: 'Erro',
        };

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || styles.test}`}>
                {labels[status as keyof typeof labels] || status}
            </span>
        );
    };

    const getProviderLabel = (provider: string) => {
        const labels = {
            simplified: 'Modo Teste',
            national: 'Nacional',
            isss: 'ISSS Salvador',
        };
        return labels[provider as keyof typeof labels] || provider;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notas Fiscais de Serviço</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        {nfseRecords.length} nota(s) encontrada(s) neste período
                    </p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 text-white">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total de Notas</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{filteredRecords.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                            <DollarSign className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Valor Total</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalValue)}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
                            <DollarSign className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">ISS Recolhido</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalIss)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por cliente, número ou código..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="input-professional pl-10 w-full"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-gray-400" />
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value as NFSeFilter)}
                                className="input-professional w-40"
                            >
                                <option value="all">Todos Status</option>
                                <option value="test">Teste</option>
                                <option value="sent">Enviadas</option>
                                <option value="confirmed">Confirmadas</option>
                                <option value="error">Erro</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                                className="input-professional w-32"
                            >
                                {monthOptions.map((month) => (
                                    <option key={month.value} value={month.value}>{month.label}</option>
                                ))}
                            </select>
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(Number(e.target.value))}
                                className="input-professional w-24"
                            >
                                {yearOptions.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Número</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Cliente</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Serviço/Provedor</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Valores</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Data</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Status</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {filteredRecords.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                        <p className="font-medium">Nenhuma nota fiscal encontrada</p>
                                        <p className="text-sm mt-1">Verifique o período selecionado ou os filtros aplicados</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredRecords.map((record) => (
                                    <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-semibold text-gray-900 dark:text-white">{record.nfseNumber || 'Pendente'}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px]" title={record.verificationCode}>
                                                    Cod: {record.verificationCode || 'N/A'}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-pink-600 dark:text-pink-400 font-bold text-xs">
                                                    {record.clientName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">{record.clientName}</p>
                                                    {record.clientCpf && (
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">CPF: {record.clientCpf}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-900 dark:text-white line-clamp-1">{record.serviceDescription}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{getProviderLabel(record.provider)}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(record.value)}</p>
                                                <p className="text-xs text-green-600 dark:text-green-400">ISS: {formatCurrency(record.issValue)}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col text-sm text-gray-600 dark:text-gray-400">
                                                <span>{formatDateToBR(record.date)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(record.status)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1">
                                                {record.pdfUrl && (
                                                    <a
                                                        href={record.pdfUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 text-gray-400 hover:text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-900/20 rounded-lg transition-all"
                                                        title="Baixar PDF"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </a>
                                                )}
                                                {record.xmlUrl && (
                                                    <a
                                                        href={record.xmlUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-all"
                                                        title="Ver XML"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </a>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
