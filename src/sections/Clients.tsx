import { useState } from 'react';
import { useData } from '../contexts/DataContext';
import type { ClientFormData } from '../types';
import { Plus, Search, Edit2, Trash2, User, Phone, Calendar, X, MessageSquare } from 'lucide-react';
import { WhatsAppModal } from '../components/shared/WhatsAppModal';
import { ClientForm } from '../components/ClientForm';
import { formatDateBR } from '../utils/format';

export function Clients() {
    const { clients, addClient, updateClient, deleteClient, appointments } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingClient, setEditingClient] = useState<string | null>(null);
    const [formData, setFormData] = useState<ClientFormData>({
        name: '',
        phone: '',
        email: '',
        cpf: '',
        cnpj: '',
        birthDate: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        neighborhood: '',
        addressNumber: '',
        complement: '',
        companyName: '',
        stateRegistration: '',
        cityRegistration: ''
    });
    const [historyClient, setHistoryClient] = useState<string | null>(null);
    const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
    const [whatsAppClient, setWhatsAppClient] = useState<{ name: string; phone: string } | null>(null);

    const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone.includes(searchTerm) ||
        (client.cpf && client.cpf.includes(searchTerm)) ||
        (client.cnpj && client.cnpj.includes(searchTerm))
    );

    const resetForm = () => {
        setFormData({
            name: '',
            phone: '',
            email: '',
            cpf: '',
            cnpj: '',
            birthDate: '',
            address: '',
            city: '',
            state: '',
            zipCode: '',
            neighborhood: '',
            addressNumber: '',
            complement: '',
            companyName: '',
            stateRegistration: '',
            cityRegistration: ''
        });
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
            cpf: client.cpf || '',
            cnpj: client.cnpj || '',
            birthDate: client.birthDate || '',
            address: client.address || '',
            city: client.city || '',
            state: client.state || '',
            zipCode: client.zipCode || '',
            neighborhood: client.neighborhood || '',
            addressNumber: client.addressNumber || '',
            complement: client.complement || '',
            companyName: client.companyName || '',
            stateRegistration: client.stateRegistration || '',
            cityRegistration: client.cityRegistration || ''
        });
        setShowForm(true);
    };

    const handleDelete = (id: string) => {
        if (confirm('Tem certeza que deseja excluir este cliente?')) {
            deleteClient(id);
        }
    };

    const formatDate = formatDateBR;

    const handleWhatsApp = (client: typeof clients[0]) => {
        setWhatsAppClient({ name: client.name, phone: client.phone });
        setShowWhatsAppModal(true);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Clientes</h1>
                    <p className="text-gray-500 mt-1">Gerencie seus clientes</p>
                </div>
                <button
                    onClick={() => { setShowForm(true); setEditingClient(null); resetForm(); }}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 gradient-bg text-white rounded-xl hover:opacity-90 transition-all shadow-lg"
                >
                    <Plus className="w-5 h-5" />
                    Novo Cliente
                </button>
            </div>

            {/* History Modal */}
            {historyClient && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">Histórico de Visitas</h2>
                                <p className="text-sm text-gray-500 mt-1">{clients.find(c => c.id === historyClient)?.name}</p>
                            </div>
                            <button onClick={() => setHistoryClient(null)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6 max-h-[60vh] overflow-y-auto">
                            {(() => {
                                const clientApts = appointments
                                    .filter(a => a.clientId === historyClient)
                                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                                if (clientApts.length === 0) {
                                    return (
                                        <div className="text-center py-12">
                                            <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                            <p className="text-gray-500">Nenhum histórico encontrado</p>
                                        </div>
                                    );
                                }

                                return (
                                    <div className="space-y-4">
                                        {clientApts.map((apt) => (
                                            <div key={apt.id} className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <p className="font-bold text-gray-900">{formatDate(apt.date)} às {apt.time}</p>
                                                        <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${apt.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                            apt.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                                                                apt.status === 'confirmed' ? 'bg-purple-100 text-purple-700' :
                                                                    apt.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                                        apt.status === 'no-show' ? 'bg-orange-100 text-orange-700' :
                                                                            'bg-gray-100 text-gray-600'
                                                            }`}>
                                                            {apt.status === 'completed' ? 'Concluído' :
                                                                apt.status === 'scheduled' ? 'Agendado' :
                                                                    apt.status === 'confirmed' ? 'Confirmado' :
                                                                        apt.status === 'cancelled' ? 'Cancelado' :
                                                                            apt.status === 'no-show' ? 'Não compareceu' :
                                                                                apt.status}
                                                        </span>
                                                    </div>
                                                    <p className="font-bold text-pink-600">
                                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(apt.totalValue)}
                                                    </p>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {apt.services.map((s, idx) => (
                                                        <span key={idx} className="bg-white border border-gray-200 px-2.5 py-1 rounded-lg text-xs text-gray-600">
                                                            {s.name}
                                                        </span>
                                                    ))}
                                                </div>
                                                {apt.notes && (
                                                    <p className="mt-2 text-xs text-gray-500 italic">Obs: {apt.notes}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            )}

            {/* WhatsApp Modal */}
            <WhatsAppModal
                isOpen={showWhatsAppModal}
                onClose={() => {
                    setShowWhatsAppModal(false);
                    setWhatsAppClient(null);
                }}
                appointment={null}
                clientPhone={whatsAppClient?.phone}
            />

            {/* Search */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Buscar por nome, telefone ou CPF..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                    />
                </div>
            </div>

            {/* Form Modal */}
            {showForm && (
                <ClientForm
                    formData={formData}
                    setFormData={setFormData}
                    onSubmit={handleSubmit}
                    onCancel={resetForm}
                    editingClient={editingClient}
                />
            )}

            {/* Clients List/Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Nome</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Contato / CPF</th>
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
                                                <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center text-pink-500 shrink-0">
                                                    <User className="w-5 h-5" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-medium text-gray-900 truncate">{client.name}</p>
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
                                            <p className="text-sm flex items-center gap-2 text-gray-700 font-medium">
                                                <Phone className="w-4 h-4 text-pink-400" />
                                                {client.phone}
                                            </p>
                                            {client.cpf && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    CPF: {client.cpf}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => setHistoryClient(client.id)}
                                                className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold hover:bg-blue-100 transition-colors"
                                            >
                                                {client.totalVisits} visitas
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {client.lastVisit ? formatDate(client.lastVisit) : '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleWhatsApp(client)}
                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors shadow-sm bg-white border border-gray-100"
                                                    title="Conversar no WhatsApp"
                                                >
                                                    <MessageSquare className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(client)}
                                                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors shadow-sm bg-white border border-gray-100"
                                                    title="Editar"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(client.id)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors shadow-sm bg-white border border-gray-100"
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

                {/* Mobile Card View */}
                <div className="md:hidden divide-y divide-gray-100">
                    {filteredClients.length === 0 ? (
                        <div className="px-6 py-12 text-center text-gray-500">
                            <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                            <p>Nenhum cliente encontrado</p>
                        </div>
                    ) : (
                        filteredClients.map((client) => (
                            <div key={client.id} className="p-4 space-y-3">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center text-pink-500 shrink-0">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{client.name}</p>
                                            <p className="text-xs text-gray-500">Cadastrado em {formatDate(client.createdAt)}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setHistoryClient(client.id)}
                                        className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider hover:bg-blue-100 transition-colors"
                                    >
                                        {client.totalVisits} visitas
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-3 pt-1">
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-gray-400 uppercase font-bold">Contato</p>
                                        <p className="text-sm text-gray-700 flex items-center gap-1.5">
                                            <Phone className="w-3.5 h-3.5 text-pink-400" />
                                            {client.phone}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-gray-400 uppercase font-bold">CPF</p>
                                        <p className="text-sm text-gray-700">{client.cpf || '-'}</p>
                                    </div>
                                    {client.birthDate && (
                                        <div className="space-y-1">
                                            <p className="text-[10px] text-gray-400 uppercase font-bold">Aniversário</p>
                                            <p className="text-sm text-gray-700">{formatDate(client.birthDate)}</p>
                                        </div>
                                    )}
                                    <div className="space-y-1 col-span-2">
                                        <p className="text-[10px] text-gray-400 uppercase font-bold">Endereço</p>
                                        <p className="text-sm text-gray-700 truncate">{client.address || '-'}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <button
                                        onClick={() => handleWhatsApp(client)}
                                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-50 text-green-600 rounded-lg text-sm font-semibold"
                                    >
                                        <MessageSquare className="w-4 h-4" />
                                        WhatsApp
                                    </button>
                                    <button
                                        onClick={() => handleEdit(client)}
                                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-semibold"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => handleDelete(client.id)}
                                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-semibold"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Excluir
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
