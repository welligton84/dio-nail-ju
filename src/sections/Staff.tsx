import { useState } from 'react';
import { useData } from '../contexts/DataContext';
import type { StaffFormData } from '../types';
import { Plus, Search, Edit2, Trash2, User, Phone, X, Award, Percent } from 'lucide-react';

export function Staff() {
    const { staff, addStaff, updateStaff, deleteStaff } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingStaff, setEditingStaff] = useState<string | null>(null);
    const [formData, setFormData] = useState<StaffFormData>({
        name: '',
        phone: '',
        role: '',
        commission: 0,
        active: true,
    });

    const filteredStaff = staff.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.phone.includes(searchTerm)
    );

    const formatPhone = (value: string) => {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{5})(\d)/, '$1-$2')
            .replace(/(-\d{4})\d+?$/, '$1');
    };

    const resetForm = () => {
        setFormData({ name: '', phone: '', role: '', commission: 0, active: true });
        setEditingStaff(null);
        setShowForm(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingStaff) {
            updateStaff(editingStaff, formData);
        } else {
            addStaff(formData);
        }
        resetForm();
    };

    const handleEdit = (member: typeof staff[0]) => {
        setEditingStaff(member.id);
        setFormData({
            name: member.name,
            phone: member.phone,
            role: member.role,
            commission: member.commission,
            active: member.active,
        });
        setShowForm(true);
    };

    const handleDelete = (id: string) => {
        if (confirm('Tem certeza que deseja excluir este profissional?')) {
            deleteStaff(id);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Profissionais</h1>
                    <p className="text-gray-500 mt-1">Gerencie a equipe do studio</p>
                </div>
                <button
                    onClick={() => { setShowForm(true); setEditingStaff(null); setFormData({ name: '', phone: '', role: '', commission: 0, active: true }); }}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 gradient-bg text-white rounded-xl hover:opacity-90 transition-all shadow-lg"
                >
                    <Plus className="w-5 h-5" />
                    Novo Profissional
                </button>
            </div>

            {/* Search */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Buscar por nome, cargo ou telefone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                    />
                </div>
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-8">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-gray-900">
                                {editingStaff ? 'Editar Profissional' : 'Novo Profissional'}
                            </h2>
                            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                                    <input
                                        type="text"
                                        placeholder="Nome completo"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Cargo *</label>
                                        <input
                                            type="text"
                                            placeholder="Ex: Manicure, Esteticista"
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Telefone *</label>
                                        <input
                                            type="tel"
                                            placeholder="(00) 00000-0000"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Comissão (%) *</label>
                                    <div className="relative">
                                        <Percent className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="number"
                                            placeholder="0"
                                            min="0"
                                            max="100"
                                            value={formData.commission}
                                            onChange={(e) => setFormData({ ...formData, commission: Number(e.target.value) })}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                                            required
                                        />
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">Percentual padrão para os serviços realizados.</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="active"
                                        checked={formData.active}
                                        onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                        className="w-4 h-4 text-pink-500 rounded focus:ring-pink-500"
                                    />
                                    <label htmlFor="active" className="text-sm font-medium text-gray-700">Ativo</label>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 py-3 gradient-bg text-white font-semibold rounded-xl hover:opacity-90 transition-all order-1 sm:order-2"
                                >
                                    {editingStaff ? 'Atualizar' : 'Cadastrar'}
                                </button>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all order-2 sm:order-1"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Staff List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStaff.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-dashed border-gray-300">
                        <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-500 text-lg">Nenhum profissional cadastrado</p>
                        <button
                            onClick={() => setShowForm(true)}
                            className="mt-4 text-pink-500 font-semibold hover:underline"
                        >
                            + Adicionar o primeiro profissional
                        </button>
                    </div>
                ) : (
                    filteredStaff.map((member) => (
                        <div key={member.id} className={`bg-white rounded-2xl shadow-sm border p-6 transition-all hover:shadow-md ${!member.active ? 'opacity-60 bg-gray-50' : 'border-gray-100'}`}>
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center text-pink-500 shrink-0">
                                        <Award className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 line-clamp-1">{member.name}</h3>
                                        <p className="text-sm text-pink-500 font-medium">{member.role}</p>
                                    </div>
                                </div>
                                {!member.active && (
                                    <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                                        Inativo
                                    </span>
                                )}
                            </div>

                            <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    {member.phone}
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <Percent className="w-4 h-4 text-gray-400" />
                                    Comissão: <span className="font-bold text-gray-900">{member.commission}%</span>
                                </div>
                            </div>

                            <div className="flex gap-2 pt-4 border-t border-gray-50">
                                <button
                                    onClick={() => handleEdit(member)}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-50 text-blue-600 rounded-xl text-sm font-semibold hover:bg-blue-100 transition-colors"
                                >
                                    <Edit2 className="w-4 h-4" />
                                    Editar
                                </button>
                                <button
                                    onClick={() => handleDelete(member.id)}
                                    className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                    title="Excluir"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
