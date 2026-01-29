import { useState } from 'react';
import { useData } from '../hooks/useData';
import type { ClientFormData } from '../types';
import { Plus, Search, Edit2, Trash2, User, Phone, Mail, Calendar, X } from 'lucide-react';

export function Clients() {
    const { clients, addClient, updateClient, deleteClient } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingClient, setEditingClient] = useState<string | null>(null);
    const [formData, setFormData] = useState<ClientFormData>({
        name: '',
        phone: '',
        email: '',
        birthDate: '',
    });

    const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone.includes(searchTerm)
    );

    const resetForm = () => {
        setFormData({ name: '', phone: '', email: '', birthDate: '' });
        setEditingClient(null);
        setShowForm(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingClient) {
            updateClient(editingClient, formData);
        } else {
            addClient(formData);
        }
        resetForm();
    };

    const handleEdit = (client: typeof clients[0]) => {
        setEditingClient(client.id);
        setFormData({
            name: client.name,
            phone: client.phone,
            email: client.email || '',
            birthDate: client.birthDate || '',
        });
        setShowForm(true);
    };

    const handleDelete = (id: string) => {
        if (confirm('Tem certeza que deseja excluir este cliente?')) {
            deleteClient(id);
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('pt-BR');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
                    <p className="text-gray-500 mt-1">Gerencie seus clientes</p>
                </div>
                <button
                    onClick={() => { setShowForm(true); setEditingClient(null); setFormData({ name: '', phone: '', email: '', birthDate: '' }); }}
                    className="flex items-center gap-2 px-4 py-2.5 gradient-bg text-white rounded-xl hover:opacity-90 transition-all shadow-lg"
                >
                    <Plus className="w-5 h-5" />
                    Novo Cliente
                </button>
            </div>

            {/* Search */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Buscar por nome ou telefone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                    />
                </div>
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-gray-900">
                                {editingClient ? 'Editar Cliente' : 'Novo Cliente'}
                            </h2>
                            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2">
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
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefone *</label>
                                    <input
                                        type="tel"
                                        placeholder="(00) 00000-0000"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                                    <input
                                        type="email"
                                        placeholder="email@exemplo.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento</label>
                                    <input
                                        type="date"
                                        value={formData.birthDate}
                                        onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 py-3 gradient-bg text-white font-semibold rounded-xl hover:opacity-90 transition-all"
                                >
                                    {editingClient ? 'Atualizar' : 'Cadastrar'}
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

            {/* Clients Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Nome</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Contato</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Visitas</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Última Visita</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredClients.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                        <p>Nenhum cliente encontrado</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredClients.map((client) => (
                                    <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center text-pink-500">
                                                    <User className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{client.name}</p>
                                                    {client.birthDate && (
                                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" />
                                                            Nasc: {formatDate(client.birthDate)}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm flex items-center gap-2 text-gray-700">
                                                <Phone className="w-4 h-4 text-gray-400" />
                                                {client.phone}
                                            </p>
                                            {client.email && (
                                                <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                                                    <Mail className="w-4 h-4 text-gray-400" />
                                                    {client.email}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                                                {client.totalVisits} visitas
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {client.lastVisit ? formatDate(client.lastVisit) : '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(client)}
                                                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(client.id)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Excluir"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
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
