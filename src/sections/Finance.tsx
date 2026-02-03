import { useState, useMemo } from 'react';
import { useData } from '../hooks/useData';
import type { FinancialFormData, FinancialRecord, PaymentMethod } from '../types';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../types';
import { Plus, TrendingUp, TrendingDown, DollarSign, Trash2 } from 'lucide-react';
import { StatCard } from '../components/shared/StatCard';
import { Modal } from '../components/shared/Modal';
import { Table } from '../components/shared/Table';

export function Finance() {
    const { financialRecords, addFinancialRecord, deleteFinancialRecord } = useData();
    const [activeTab, setActiveTab] = useState<'all' | 'income' | 'expense'>('all');
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState<FinancialFormData>({
        type: 'income',
        category: '',
        description: '',
        value: '',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'pix'
    });

    const filteredRecords = useMemo(() => {
        return financialRecords
            .filter((r: FinancialRecord) => activeTab === 'all' || r.type === activeTab)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [financialRecords, activeTab]);

    const totals = useMemo(() => {
        const income = financialRecords
            .filter((r) => r.type === 'income')
            .reduce((sum, r) => sum + r.value, 0);
        const expense = financialRecords
            .filter((r) => r.type === 'expense')
            .reduce((sum, r) => sum + r.value, 0);
        return {
            income,
            expense,
            profit: income - expense
        };
    }, [financialRecords]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const getPaymentMethodLabel = (method: PaymentMethod) => {
        switch (method) {
            case 'pix': return 'PIX';
            case 'cash': return 'Dinheiro';
            case 'card': return 'Cartão';
            default: return method;
        }
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
            date: new Date().toISOString().split('T')[0],
            paymentMethod: 'pix'
        });
    };

    const handleDelete = async (id: string) => {
        if (confirm('Tem certeza que deseja excluir este registro?')) {
            await deleteFinancialRecord(id);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Financeiro</h1>
                    <p className="text-gray-500 mt-1">Controle suas entradas e saídas</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 gradient-bg text-white rounded-xl hover:opacity-90 transition-all shadow-lg font-bold"
                >
                    <Plus className="w-5 h-5" />
                    Novo Registro
                </button>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
                    title="Saldo"
                    value={formatCurrency(totals.profit)}
                    icon={DollarSign}
                    color="bg-pink-500"
                />
            </div>

            {/* Filters and List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex bg-gray-50 p-1 rounded-xl w-full sm:w-auto">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Todos
                        </button>
                        <button
                            onClick={() => setActiveTab('income')}
                            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'income' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Receitas
                        </button>
                        <button
                            onClick={() => setActiveTab('expense')}
                            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'expense' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Despesas
                        </button>
                    </div>
                </div>

                <Table
                    data={filteredRecords}
                    emptyMessage="Nenhum registro encontrado."
                    columns={[
                        {
                            header: 'Data',
                            accessor: (r: FinancialRecord) => (
                                <span className="text-gray-500">{new Date(r.date).toLocaleDateString('pt-BR')}</span>
                            )
                        },
                        {
                            header: 'Descrição',
                            accessor: (r: FinancialRecord) => (
                                <div className="max-w-[150px] sm:max-w-none">
                                    <p className="font-bold text-gray-900 truncate">{r.description}</p>
                                    <p className="text-xs text-gray-400 uppercase tracking-tighter">{r.category}</p>
                                </div>
                            )
                        },
                        {
                            header: 'Método',
                            accessor: (r: FinancialRecord) => (
                                <span className="text-xs font-medium text-gray-500 uppercase">
                                    {getPaymentMethodLabel(r.paymentMethod || 'pix')}
                                </span>
                            )
                        },
                        {
                            header: 'Tipo',
                            accessor: (r: FinancialRecord) => (
                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${r.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                    {r.type === 'income' ? 'Receita' : 'Despesa'}
                                </span>
                            )
                        },
                        {
                            header: 'Valor',
                            accessor: (r: FinancialRecord) => (
                                <span className={`font-bold ${r.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                    {r.type === 'income' ? '+' : '-'} {formatCurrency(r.value)}
                                </span>
                            )
                        },
                        {
                            header: '',
                            accessor: (r: FinancialRecord) => (
                                <button
                                    onClick={() => handleDelete(r.id)}
                                    className="p-2 text-gray-300 hover:text-red-500 transition-colors"
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
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
                        <div className="flex bg-gray-100 p-1 rounded-xl">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, type: 'income', category: '' })}
                                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${formData.type === 'income' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500'
                                    }`}
                            >
                                Receita
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, type: 'expense', category: '' })}
                                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${formData.type === 'expense' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500'
                                    }`}
                            >
                                Despesa
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Categoria *</label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                            required
                        >
                            <option value="">Selecione uma categoria</option>
                            {(formData.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Descrição *</label>
                        <input
                            type="text"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                            placeholder="Descreva o registro"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Valor *</label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.value}
                                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                                placeholder="0,00"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Data *</label>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Forma de Pagamento</label>
                        <select
                            value={formData.paymentMethod}
                            onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                            required
                        >
                            <option value="pix">PIX</option>
                            <option value="cash">Dinheiro</option>
                            <option value="card">Cartão</option>
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
                            className="px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-gray-600 font-medium"
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
