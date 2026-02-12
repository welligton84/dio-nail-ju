import { useState } from 'react';
import { useData } from '../contexts/DataContext';
import {
    Plus,
    Edit2,
    Trash2,
    Sparkles,
    Clock,
    X
} from 'lucide-react';
import { formatDuration } from '../utils/date';
import type { ServiceCategory, ServiceFormData } from '../types';

export function Services() {
    const { services, addService, updateService, deleteService, loading } = useData();
    const [showForm, setShowForm] = useState(false);
    const [editingService, setEditingService] = useState<string | null>(null);
    const [formData, setFormData] = useState<ServiceFormData>({
        name: '',
        price: '0',
        duration: '30',
        description: '',
        active: true,
        commissionRate: 0,
        color: '#EC4899',
        category: 'Outros' as ServiceCategory
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const serviceData = {
                ...formData,
                price: parseFloat(formData.price),
                duration: parseInt(formData.duration),
            };

            if (editingService) {
                await updateService(editingService, serviceData);
            } else {
                await addService(serviceData);
            }
            setShowForm(false);
            resetForm();
        } catch (error) {
            console.error('Error saving service:', error);
            alert('Erro ao salvar serviço');
        }
    };

    const handleEdit = (service: any) => {
        setFormData({
            name: service.name,
            price: service.price.toString(),
            duration: service.duration.toString(),
            description: service.description || '',
            active: service.active,
            commissionRate: service.commissionRate || 0,
            color: service.color || '#EC4899',
            category: service.category || 'Outros'
        });
        setEditingService(service.id);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir este serviço?')) {
            try {
                await deleteService(id);
            } catch (error) {
                console.error('Error deleting service:', error);
                alert('Erro ao excluir serviço');
            }
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            price: '0',
            duration: '30',
            description: '',
            active: true,
            commissionRate: 0,
            color: '#EC4899',
            category: 'Outros'
        });
        setEditingService(null);
        setShowForm(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Serviços</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Gerencie seu catálogo de serviços</p>
                </div>
                <button
                    onClick={() => {
                        setFormData({
                            name: '',
                            price: '0',
                            duration: '30',
                            description: '',
                            active: true,
                            commissionRate: 0,
                            color: '#EC4899',
                            category: 'Outros'
                        });
                        setEditingService(null);
                        setShowForm(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition-colors shadow-sm shadow-pink-200 dark:shadow-none"
                >
                    <Plus className="w-5 h-5" />
                    Novo Serviço
                </button>
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service) => (
                    <div
                        key={service.id}
                        className={`bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border transition-all hover:shadow-md group relative overflow-hidden ${!service.active ? 'opacity-75 grayscale' : 'border-gray-100 dark:border-gray-800'
                            }`}
                    >
                        {!service.active && (
                            <div className="absolute top-3 right-3 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs font-bold px-2 py-1 rounded-full z-10">
                                INATIVO
                            </div>
                        )}

                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm text-white"
                                    style={{ backgroundColor: service.color || '#EC4899' }}
                                >
                                    <Sparkles className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">{service.name}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {formatDuration(service.duration)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleEdit(service)}
                                    className="p-2 text-blue-500 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(service.id)}
                                    className="p-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {service.description && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2 min-h-[2.5em]">
                                {service.description}
                            </p>
                        )}

                        <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-gray-800">
                            <div>
                                <p className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase">Valor</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(service.price)}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase">Comissão</p>
                                <p className="text-sm font-bold text-pink-500 dark:text-pink-400">
                                    {service.commissionRate}%
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal Form */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md animate-scale-in">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {editingService ? 'Editar Serviço' : 'Novo Serviço'}
                            </h2>
                            <button
                                onClick={resetForm}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Nome do Serviço
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all dark:bg-gray-700 dark:text-white"
                                        placeholder="Ex: Manicure Completa"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Preço (R$)
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 font-medium">R$</span>
                                            <input
                                                type="number"
                                                required
                                                min="0"
                                                step="0.01"
                                                value={formData.price}
                                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all dark:bg-gray-700 dark:text-white"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Duração (min)
                                        </label>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                                            <input
                                                type="number"
                                                required
                                                min="5"
                                                step="5"
                                                value={formData.duration}
                                                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all dark:bg-gray-700 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Comissão (%)
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 font-medium">%</span>
                                            <input
                                                type="number"
                                                required
                                                min="0"
                                                max="100"
                                                value={formData.commissionRate}
                                                onChange={(e) => setFormData({ ...formData, commissionRate: parseInt(e.target.value) })}
                                                className="w-full pl-8 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all dark:bg-gray-700 dark:text-white"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Cor do Card
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="color"
                                                value={formData.color}
                                                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                                className="h-10 w-14 rounded cursor-pointer border-0 p-0"
                                            />
                                            <span className="text-xs text-gray-500 dark:text-gray-400 uppercase">{formData.color}</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Descrição (Opcional)
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all resize-none dark:bg-gray-700 dark:text-white"
                                        placeholder="Detalhes sobre o serviço..."
                                    />
                                </div>

                                <div className="flex items-center gap-2 pt-2">
                                    <input
                                        type="checkbox"
                                        id="active"
                                        checked={formData.active}
                                        onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                        className="w-4 h-4 text-pink-500 rounded border-gray-300 focus:ring-pink-500"
                                    />
                                    <label htmlFor="active" className="text-sm text-gray-700 dark:text-gray-300 font-medium cursor-pointer">
                                        Serviço Ativo
                                    </label>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-4 py-2 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition-colors shadow-sm shadow-pink-200 dark:shadow-none font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Salvando...' : (editingService ? 'Salvar Alterações' : 'Criar Serviço')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
