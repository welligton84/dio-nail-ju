import { useState } from 'react';
import { useData } from '../hooks/useData';
import type { FinancialFormData } from '../types';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../types';
import { TrendingUp, TrendingDown, DollarSign, Trash2, X, Calendar } from 'lucide-react';

type RecordType = 'income' | 'expense';
type TabFilter = 'all' | 'income' | 'expense';

export function Finance() {
    const { financialRecords, addFinancialRecord, deleteFinancialRecord } = useData();
    const [activeTab, setActiveTab] = useState<TabFilter>('all');
    const [showForm, setShowForm] = useState(false);
    const [recordType, setRecordType] = useState<RecordType>('income');
    const [formData, setFormData] = useState<FinancialFormData>({
        category: '',
        description: '',
        value: '',
        date: new Date().toISOString().split('T')[0],
    });

    const filteredRecords = activeTab === 'all'
        ? financialRecords
        : financialRecords.filter(r => r.type === activeTab);

    const sortedRecords = [...filteredRecords].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const monthlyIncome = financialRecords
        .filter(r => r.type === 'income')
        .reduce((sum, r) => sum + r.value, 0);

    const monthlyExpenses = financialRecords
        .filter(r => r.type === 'expense')
        .reduce((sum, r) => sum + r.value, 0);

    const balance = monthlyIncome - monthlyExpenses;

    const resetForm = () => {
        setFormData({
            category: '',
            description: '',
            value: '',
            date: new Date().toISOString().split('T')[0],
        });
        setShowForm(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addFinancialRecord({
            type: recordType,
            category: formData.category,
            description: formData.description,
            value: parseFloat(formData.value),
            date: formData.date,
        });
        resetForm();
    };

    const handleOpenForm = (type: RecordType) => {
        setRecordType(type);
        setFormData({
            category: '',
            description: '',
            value: '',
            date: new Date().toISOString().split('T')[0],
        });
        setShowForm(true);
    };

    const handleDelete = (id: string) => {
        if (confirm('Tem certeza que deseja excluir este registro?')) {
            deleteFinancialRecord(id);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('pt-BR');
    };

    const categories = recordType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Financeiro</h1>
                    <p className="text-gray-500 mt-1">Controle de receitas e despesas</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => handleOpenForm('income')}
                        className="flex items-center gap-2 px-4 py-2.5 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all shadow-lg"
                    >
                        <TrendingUp className="w-5 h-5" />
                        Receita
                    </button>
                    <button
                        onClick={() => handleOpenForm('expense')}
                        className="flex items-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all shadow-lg"
                    >
                        <TrendingDown className="w-5 h-5" />
                        Despesa
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Receitas do Mês</p>
                            <p className="text-2xl font-bold text-green-600 mt-1">{formatCurrency(monthlyIncome)}</p>
                        </div>
                        <div className="bg-green-100 p-3 rounded-xl">
                            <TrendingUp className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Despesas do Mês</p>
                            <p className="text-2xl font-bold text-red-600 mt-1">{formatCurrency(monthlyExpenses)}</p>
                        </div>
                        <div className="bg-red-100 p-3 rounded-xl">
                            <TrendingDown className="w-6 h-6 text-red-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Saldo do Mês</p>
                            <p className={`text-2xl font-bold mt-1 ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                {formatCurrency(balance)}
                            </p>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-xl">
                            <DollarSign className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                                {recordType === 'income' ? (
                                    <>
                                        <TrendingUp className="w-5 h-5 text-green-500" />
                                        Nova Receita
                                    </>
                                ) : (
                                    <>
                                        <TrendingDown className="w-5 h-5 text-red-500" />
                                        Nova Despesa
                                    </>
                                )}
                            </h2>
                            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria *</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                                    required
                                >
                                    <option value="">Selecione a categoria</option>
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição *</label>
                                <input
                                    type="text"
                                    placeholder="Descrição do lançamento"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="0,00"
                                        value={formData.value}
                                        onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
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
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className={`flex-1 py-3 text-white font-semibold rounded-xl transition-all ${recordType === 'income'
                                        ? 'bg-green-500 hover:bg-green-600'
                                        : 'bg-red-500 hover:bg-red-600'
                                        }`}
                                >
                                    Registrar
                                </button>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Records Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Tabs */}
                <div className="p-4 border-b border-gray-100">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`px-4 py-2 rounded-xl font-medium transition-all ${activeTab === 'all' ? 'gradient-bg text-white' : 'border border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            Todas
                        </button>
                        <button
                            onClick={() => setActiveTab('income')}
                            className={`px-4 py-2 rounded-xl font-medium transition-all ${activeTab === 'income' ? 'bg-green-500 text-white' : 'border border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            Receitas
                        </button>
                        <button
                            onClick={() => setActiveTab('expense')}
                            className={`px-4 py-2 rounded-xl font-medium transition-all ${activeTab === 'expense' ? 'bg-red-500 text-white' : 'border border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            Despesas
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Data</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Tipo</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Categoria</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Descrição</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Valor</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {sortedRecords.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        <DollarSign className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                        <p>Nenhum registro encontrado</p>
                                        <p className="text-sm text-gray-400 mt-1">Adicione receitas ou despesas</p>
                                    </td>
                                </tr>
                            ) : (
                                sortedRecords.map((record) => (
                                    <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            <span className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                {formatDate(record.date)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${record.type === 'income'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                                }`}>
                                                {record.type === 'income' ? 'Receita' : 'Despesa'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">{record.category}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700">{record.description}</td>
                                        <td className={`px-6 py-4 text-right font-semibold ${record.type === 'income' ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                            {record.type === 'income' ? '+' : '-'} {formatCurrency(record.value)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDelete(record.id)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Excluir"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
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
