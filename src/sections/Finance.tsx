import { useState, useMemo, useCallback, useEffect } from 'react';
import { useData } from '../contexts/useData';
import { useSettings } from '../contexts/useSettings';
import { formatDateToBR, getCurrentDate } from '../utils/date';
import type { FinancialFormData, FinancialRecord, PaymentMethod } from '../types';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../types';
import { Plus, TrendingUp, TrendingDown, DollarSign, Trash2, Calendar, FileSpreadsheet, CheckCircle, Circle, Link2 } from 'lucide-react';
import { StatCard } from '../components/shared/StatCard';
import { Modal } from '../components/shared/Modal';
import { Table } from '../components/shared/Table';
import { formatCurrency } from '../utils/currency';
import { MONTHS } from '../utils/constants';
import { toast } from 'sonner';

interface RecordWithBalance extends FinancialRecord {
    runningBalance: number;
}

export function Finance() {
    const now = new Date();
    const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(now.getFullYear());
    const [selectedDay, setSelectedDay] = useState<number | null>(null);

    const { financialRecords, addFinancialRecord, deleteFinancialRecord, updateFinancialRecord, loadFinancialByPeriod, nfseRecords, loadNfseByPeriod } = useData();
    const { paymentMethods } = useSettings();

    // Filter current period (Busca Sob Demanda)
    useEffect(() => {
        const startDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`;
        const lastDayStr = String(new Date(selectedYear, selectedMonth, 0).getDate()).padStart(2, '0');
        const endDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${lastDayStr}`;

        loadFinancialByPeriod(startDate, endDate);
        loadNfseByPeriod(startDate, endDate);
    }, [selectedMonth, selectedYear, loadFinancialByPeriod, loadNfseByPeriod]);

    const [activeTab, setActiveTab] = useState<'all' | 'income' | 'expense'>('all');
    const [showForm, setShowForm] = useState(false);
    const [showConciliation, setShowConciliation] = useState(false);

    // Get number of days in selected month
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const dayOptions = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const isSelectedPeriod = useCallback((dateString: string) => {
        const [year, month, day] = dateString.split('-').map(Number);
        const matchesYearMonth = year === selectedYear && month === selectedMonth;
        if (selectedDay) {
            return matchesYearMonth && day === selectedDay;
        }
        return matchesYearMonth;
    }, [selectedYear, selectedMonth, selectedDay]);

    const yearOptions = Array.from({ length: 3 }, (_, i) => now.getFullYear() - i);
    const monthOptions = MONTHS;

    const [formData, setFormData] = useState<FinancialFormData>({
        type: 'income',
        category: '',
        description: '',
        value: '',
        date: getCurrentDate(),
        paymentMethod: 'pix'
    });

    const filteredRecords = useMemo(() => {
        const periodRecords = financialRecords
            .filter((r: FinancialRecord) => {
                const matchesTab = activeTab === 'all' || r.type === activeTab;
                const matchesPeriod = isSelectedPeriod(r.date);
                return matchesTab && matchesPeriod;
            })
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        const result: RecordWithBalance[] = [];
        let runningBalance = 0;
        for (const r of periodRecords) {
            runningBalance += r.type === 'income' ? r.value : -r.value;
            result.push({ ...r, runningBalance });
        }
        return result;
    }, [financialRecords, activeTab, isSelectedPeriod]);

    // Calculate opening balance from previous periods
    const openingBalance = useMemo(() => {
        return financialRecords
            .filter((r) => {
                const [year, month] = r.date.split('-').map(Number);
                return (year < selectedYear) || (year === selectedYear && month < selectedMonth);
            })
            .reduce((sum, r) => sum + (r.type === 'income' ? r.value : -r.value), 0);
    }, [financialRecords, selectedYear, selectedMonth]);

    const totals = useMemo(() => {
        const income = financialRecords
            .filter((r) => r.type === 'income' && isSelectedPeriod(r.date))
            .reduce((sum, r) => sum + r.value, 0);
        const expense = financialRecords
            .filter((r) => r.type === 'expense' && isSelectedPeriod(r.date))
            .reduce((sum, r) => sum + r.value, 0);
        return {
            income,
            expense,
            profit: income - expense,
            closingBalance: openingBalance + income - expense
        };
    }, [financialRecords, isSelectedPeriod, openingBalance]);

    const getPaymentMethodLabel = (method: string) => {
        const found = paymentMethods.find(m => m.name.toLowerCase() === String(method).toLowerCase());
        return found?.name || method;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await addFinancialRecord({
            ...formData,
            value: parseFloat(formData.value),
        });
        setShowForm(false);
        setFormData({
            type: 'income',
            category: '',
            description: '',
            value: '',
            date: getCurrentDate(),
            paymentMethod: 'pix'
        });
    };

    const handleDelete = async (id: string) => {
        if (confirm('Tem certeza que deseja excluir este registro?')) {
            await deleteFinancialRecord(id);
        }
    };

    const handleToggleConciliation = async (record: FinancialRecord) => {
        await updateFinancialRecord(record.id, {
            conciliated: !record.conciliated
        });
    };

    const getRelatedNFSe = (appointmentId?: string) => {
        if (!appointmentId) return null;
        return nfseRecords.find(n => n.appointmentId === appointmentId);
    };

    const exportToCSV = () => {
        const escapeCSV = (value: string | number) => {
            const str = String(value);
            if (str.includes(';') || str.includes('"') || str.includes('\n')) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        };

        const delimiter = ';';
        const headers = ['Data', 'Descricao', 'Categoria', 'Metodo', 'Tipo', 'Valor', 'Saldo', 'Conciliado'];
        const rows = displayRecords.map(r => [
            formatDateToBR(r.date),
            r.description,
            r.category,
            getPaymentMethodLabel(r.paymentMethod || 'pix'),
            r.type === 'income' ? 'Receita' : 'Despesa',
            r.value.toFixed(2).replace('.', ','),
            r.runningBalance.toFixed(2).replace('.', ','),
            r.conciliated ? 'Sim' : 'Nao'
        ].map(escapeCSV));

        const csv = [headers.join(delimiter), ...rows.map(row => row.join(delimiter))].join('\n');
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `financeiro_${selectedYear}_${selectedMonth}.csv`;
        link.click();
        URL.revokeObjectURL(url);
        toast.success('Exportado com sucesso!');
    };

    const shouldShowOnlyConciliated = activeTab === 'all' && showConciliation;
    const displayRecords = shouldShowOnlyConciliated
        ? filteredRecords.filter(r => r.conciliated)
        : filteredRecords;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Financeiro</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Livro Caixa - Controle suas entradas e saídas</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <button
                        onClick={() => setShowConciliation(!showConciliation)}
                        className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all font-semibold ${showConciliation ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                    >
                        <CheckCircle className="w-4 h-4" />
                        <span className="hidden sm:inline">Conciliar</span>
                    </button>
                    <button
                        onClick={exportToCSV}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all font-semibold"
                    >
                        <FileSpreadsheet className="w-4 h-4" />
                        <span className="hidden sm:inline">Exportar</span>
                    </button>
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 gradient-bg text-white rounded-xl hover:opacity-90 transition-all shadow-lg font-bold"
                    >
                        <Plus className="w-5 h-5" />
                        <span className="sm:hidden">Novo</span>
                    </button>
                </div>
            </div>

            {/* Opening Balance */}
            {openingBalance !== 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Saldo Anterior</span>
                        <span className={`text-lg font-bold ${openingBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(openingBalance)}
                        </span>
                    </div>
                </div>
            )}

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <StatCard
                    title="Receitas"
                    value={formatCurrency(totals.income)}
                    icon={TrendingUp}
                    color="bg-green-500"
                />
                <StatCard
                    title="Despesas"
                    value={formatCurrency(totals.expense)}
                    icon={TrendingDown}
                    color="bg-red-500"
                />
                <StatCard
                    title="Saldo do Mês"
                    value={formatCurrency(totals.profit)}
                    icon={DollarSign}
                    color="bg-pink-500"
                />
                <StatCard
                    title="Saldo Acumulado"
                    value={formatCurrency(totals.closingBalance)}
                    icon={DollarSign}
                    color="bg-purple-500"
                />
            </div>

            {/* Period Selector */}
            <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Período:</span>
                    </div>
                    <div className="flex gap-3 flex-1 flex-wrap">
                        <label htmlFor="finance-day" className="sr-only">Dia</label>
                        <select
                            id="finance-day"
                            name="day"
                            value={selectedDay || ''}
                            onChange={(e) => setSelectedDay(e.target.value ? Number(e.target.value) : null)}
                            className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none text-sm bg-white dark:bg-gray-800 dark:text-white"
                        >
                            <option value="">Dia</option>
                            {dayOptions.map(day => (
                                <option key={day} value={day}>{day}</option>
                            ))}
                        </select>
                        <label htmlFor="finance-month" className="sr-only">Mês</label>
                        <select
                            id="finance-month"
                            name="month"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(Number(e.target.value))}
                            className="flex-1 sm:flex-none px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none text-sm bg-white dark:bg-gray-800 dark:text-white"
                        >
                            {monthOptions.map(month => (
                                <option key={month.value} value={month.value}>{month.label}</option>
                            ))}
                        </select>
                        <label htmlFor="finance-year" className="sr-only">Ano</label>
                        <select
                            id="finance-year"
                            name="year"
                            value={selectedYear}
                            onChange={(e) => {
                                setSelectedYear(Number(e.target.value));
                                setSelectedDay(null);
                            }}
                            className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none text-sm bg-white dark:bg-gray-800 dark:text-white"
                        >
                            {yearOptions.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                        {selectedDay && (
                            <button
                                onClick={() => setSelectedDay(null)}
                                className="px-3 py-2 text-sm font-medium text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300"
                            >
                                Limpar filtro
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Filters and List */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex bg-gray-50 dark:bg-gray-800 p-1 rounded-xl w-full sm:w-auto">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'all' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                }`}
                        >
                            Todos
                        </button>
                        <button
                            onClick={() => setActiveTab('income')}
                            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'income' ? 'bg-white dark:bg-gray-700 text-green-600 dark:text-green-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                }`}
                        >
                            Receitas
                        </button>
                        <button
                            onClick={() => setActiveTab('expense')}
                            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'expense' ? 'bg-white dark:bg-gray-700 text-red-600 dark:text-red-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                }`}
                        >
                            Despesas
                        </button>
                    </div>
                </div>

                <Table
                    data={displayRecords}
                    emptyMessage="Nenhum registro encontrado."
                    columns={[
                        {
                            header: 'Data',
                            accessor: (r: RecordWithBalance) => (
                                <span className="text-gray-500 dark:text-gray-400">{formatDateToBR(r.date)}</span>
                            )
                        },
                        {
                            header: 'Descrição',
                            accessor: (r: RecordWithBalance) => (
                                <div className="max-w-[150px] sm:max-w-none">
                                    <div className="flex items-center gap-2">
                                        <p className="font-bold text-gray-900 dark:text-white truncate">{r.description}</p>
                                        {r.appointmentId && getRelatedNFSe(r.appointmentId) && (
                                            <a
                                                href={`/nfse`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-500 hover:text-blue-600"
                                                title="Ver NFSe"
                                            >
                                                <Link2 className="w-3 h-3" />
                                            </a>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-tighter">{r.category}</p>
                                </div>
                            )
                        },
                        {
                            header: 'Método',
                            accessor: (r: RecordWithBalance) => (
                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                    {getPaymentMethodLabel(r.paymentMethod || 'pix')}
                                </span>
                            )
                        },
                        {
                            header: 'Tipo',
                            accessor: (r: RecordWithBalance) => (
                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${r.type === 'income' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                    }`}>
                                    {r.type === 'income' ? 'Receita' : 'Despesa'}
                                </span>
                            )
                        },
                        {
                            header: 'Valor',
                            accessor: (r: RecordWithBalance) => (
                                <span className={`font-bold ${r.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {r.type === 'income' ? '+' : '-'} {formatCurrency(r.value)}
                                </span>
                            )
                        },
                        {
                            header: 'Saldo',
                            accessor: (r: RecordWithBalance) => (
                                <span className={`text-xs font-bold ${r.runningBalance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {formatCurrency(r.runningBalance)}
                                </span>
                            )
                        },
                        ...(showConciliation ? [{
                            header: 'Concil.',
                            accessor: (r: RecordWithBalance) => (
                                <button
                                    onClick={() => handleToggleConciliation(r)}
                                    className={`p-1 rounded-full transition-colors ${r.conciliated ? 'text-green-500' : 'text-gray-300 dark:text-gray-600 hover:text-green-500'}`}
                                    title={r.conciliated ? 'Conciliado - Clique para desmarcar' : 'Não conciliado - Clique para marcar'}
                                >
                                    {r.conciliated ? <CheckCircle className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                                </button>
                            ),
                            className: 'text-center'
                        }] : []),
                        {
                            header: '',
                            accessor: (r: RecordWithBalance) => (
                                <button
                                    onClick={() => handleDelete(r.id)}
                                    className="p-2 text-gray-300 hover:text-red-500 dark:text-gray-600 dark:hover:text-red-400 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            ),
                            className: 'text-right'
                        }
                    ]}
                />
            </div>

            {/* Modal Form */}
            <Modal
                isOpen={showForm}
                onClose={() => setShowForm(false)}
                title="Novo Registro Financeiro"
            >
                <form id="finance-form" onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label htmlFor="finance-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo *</label>
                        <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
                            <button
                                type="button"
                                id="finance-type-income"
                                onClick={() => setFormData({ ...formData, type: 'income', category: '' })}
                                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${formData.type === 'income' ? 'bg-white dark:bg-gray-600 text-green-600 dark:text-green-400 shadow-sm' : 'text-gray-500 dark:text-gray-400'
                                    }`}
                            >
                                Receita
                            </button>
                            <button
                                type="button"
                                id="finance-type-expense"
                                onClick={() => setFormData({ ...formData, type: 'expense', category: '' })}
                                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${formData.type === 'expense' ? 'bg-white dark:bg-gray-600 text-red-600 dark:text-red-400 shadow-sm' : 'text-gray-500 dark:text-gray-400'
                                    }`}
                            >
                                Despesa
                            </button>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="finance-category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoria *</label>
                        <select
                            id="finance-category"
                            name="category"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none dark:bg-gray-700 dark:text-white"
                            required
                        >
                            <option value="">Selecione uma categoria</option>
                            {(formData.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="finance-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição *</label>
                        <input
                            id="finance-description"
                            name="description"
                            type="text"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none dark:bg-gray-700 dark:text-white"
                            placeholder="Descreva o registro"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="finance-value" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor *</label>
                            <input
                                id="finance-value"
                                name="value"
                                type="number"
                                autoComplete="transaction-amount"
                                step="0.01"
                                value={formData.value}
                                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none dark:bg-gray-700 dark:text-white"
                                placeholder="0,00"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="finance-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data *</label>
                            <input
                                id="finance-date"
                                name="date"
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none dark:bg-gray-700 dark:text-white"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="finance-payment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Forma de Pagamento</label>
                        <select
                            id="finance-payment"
                            name="paymentMethod"
                            value={formData.paymentMethod}
                            onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })}
                            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none dark:bg-gray-700 dark:text-white"
                            required
                        >
                            {paymentMethods.filter(p => p.active).map((method) => (
                                <option key={method.id} value={method.name.toLowerCase()}>
                                    {method.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            className="flex-1 py-3 gradient-bg text-white font-semibold rounded-xl hover:opacity-90 transition-all shadow-md"
                        >
                            Salvar Registro
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="px-6 py-3 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-gray-600 dark:text-gray-300 font-medium"
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
