import { useState } from 'react';
<<<<<<< HEAD
import { useData } from '../hooks/useData';
import type { ServiceFormData, ServiceCategory } from '../types';
import { Plus, Edit2, Trash2, Clock, DollarSign, X } from 'lucide-react';
=======
import { useData } from '../contexts/DataContext';
import type { ServiceFormData, ServiceCategory } from '../types';
import { Plus, Edit2, Trash2, Clock, DollarSign, X } from 'lucide-react';
import { formatCurrency } from '../utils/currency';
>>>>>>> b507692 (feat: rebrand to Juliana Miranda Concept, add Vitest, fix routing and finance filters)

const CATEGORIES: ServiceCategory[] = ['Manicure', 'Pedicure', 'Alongamento', 'Decoração', 'Spa', 'Outros'];
const COLORS = ['#F472B6', '#A78BFA', '#60A5FA', '#34D399', '#FBBF24', '#F87171', '#818CF8', '#2DD4BF'];

export function Services() {
    const { services, addService, updateService, deleteService } = useData();
    const [showForm, setShowForm] = useState(false);
    const [editingService, setEditingService] = useState<string | null>(null);
    const [formData, setFormData] = useState<ServiceFormData>({
        name: '',
        description: '',
        price: '',
        duration: '',
        category: 'Manicure',
        color: '#F472B6',
        active: true,
    });

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            price: '',
            duration: '',
            category: 'Manicure',
            color: '#F472B6',
            active: true,
        });
        setEditingService(null);
        setShowForm(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const data = {
            name: formData.name,
            description: formData.description,
            price: parseFloat(formData.price),
            duration: parseInt(formData.duration),
            category: formData.category,
            color: formData.color,
            active: formData.active,
        };

        if (editingService) {
            updateService(editingService, data);
        } else {
            addService(data);
        }
        resetForm();
    };

    const handleEdit = (service: typeof services[0]) => {
        setEditingService(service.id);
        setFormData({
            name: service.name,
            description: service.description || '',
            price: service.price.toString(),
            duration: service.duration.toString(),
            category: service.category,
            color: service.color,
            active: service.active,
        });
        setShowForm(true);
    };

    const handleDelete = (id: string) => {
        if (confirm('Tem certeza que deseja excluir este serviço?')) {
            deleteService(id);
        }
    };

<<<<<<< HEAD
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    };

=======
>>>>>>> b507692 (feat: rebrand to Juliana Miranda Concept, add Vitest, fix routing and finance filters)
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Serviços</h1>
                    <p className="text-gray-500 mt-1">Gerencie os serviços oferecidos</p>
                </div>
                <button
                    onClick={() => { setShowForm(true); setEditingService(null); }}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 gradient-bg text-white rounded-xl hover:opacity-90 transition-all shadow-lg"
                >
                    <Plus className="w-5 h-5" />
                    Novo Serviço
                </button>
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-gray-900">
                                {editingService ? 'Editar Serviço' : 'Novo Serviço'}
                            </h2>
                            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Serviço *</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Manicure Simples"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                                <input
                                    type="text"
                                    placeholder="Descrição do serviço"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="0,00"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Duração (min) *</label>
                                    <input
                                        type="number"
                                        min="1"
                                        placeholder="45"
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ServiceCategory })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                                >
                                    {CATEGORIES.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Cor</label>
                                <div className="flex gap-2">
                                    {COLORS.map((color) => (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, color })}
                                            className={`w-10 h-10 rounded-full border-3 transition-transform hover:scale-110 ${formData.color === color ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''
                                                }`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 py-3 gradient-bg text-white font-semibold rounded-xl hover:opacity-90 transition-all"
                                >
                                    {editingService ? 'Atualizar' : 'Cadastrar'}
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

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map((service) => (
                    <div
                        key={service.id}
                        className={`bg-white rounded-xl shadow-sm overflow-hidden card-hover border border-gray-100 ${!service.active ? 'opacity-60' : ''
                            }`}
                    >
                        {/* Color bar */}
                        <div className="h-2" style={{ backgroundColor: service.color }} />

                        <div className="p-5">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="font-semibold text-lg text-gray-900">{service.name}</h3>
                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">
                                        {service.category}
                                    </span>
                                </div>
                                {/* Toggle */}
                                <button
                                    onClick={() => updateService(service.id, { active: !service.active })}
                                    className={`relative w-12 h-6 rounded-full transition-colors ${service.active ? 'bg-pink-500' : 'bg-gray-300'
                                        }`}
                                >
                                    <span
                                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${service.active ? 'left-7' : 'left-1'
                                            }`}
                                    />
                                </button>
                            </div>

                            {service.description && (
                                <p className="text-sm text-gray-500 mb-3">{service.description}</p>
                            )}

                            <div className="flex items-center gap-4 text-sm">
                                <span className="text-green-600 font-semibold flex items-center gap-1">
                                    <DollarSign className="w-4 h-4" />
                                    {formatCurrency(service.price)}
                                </span>
                                <span className="text-gray-500 flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {service.duration} min
                                </span>
                            </div>

                            <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
                                <button
                                    onClick={() => handleEdit(service)}
                                    className="flex items-center gap-1 text-blue-500 hover:text-blue-700 text-sm font-medium"
                                >
                                    <Edit2 className="w-4 h-4" />
                                    Editar
                                </button>
                                <button
                                    onClick={() => handleDelete(service.id)}
                                    className="flex items-center gap-1 text-red-500 hover:text-red-700 text-sm font-medium"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Excluir
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
