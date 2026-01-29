import { useState } from 'react';
import { useData } from '../hooks/useData';
import type { AppointmentFormData, AppointmentStatus } from '../types';
import { Plus, Calendar, Trash2, X, Clock, User } from 'lucide-react';

const TIMES = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
];

const STATUS_CONFIG: Record<AppointmentStatus, { label: string; color: string; bgColor: string }> = {
    scheduled: { label: 'Agendado', color: 'text-yellow-800', bgColor: 'bg-yellow-100' },
    confirmed: { label: 'Confirmado', color: 'text-blue-800', bgColor: 'bg-blue-100' },
    completed: { label: 'Concluído', color: 'text-green-800', bgColor: 'bg-green-100' },
    cancelled: { label: 'Cancelado', color: 'text-red-800', bgColor: 'bg-red-100' },
    'no-show': { label: 'Não compareceu', color: 'text-gray-800', bgColor: 'bg-gray-100' },
};

export function Appointments() {
    const { clients, services, appointments, addAppointment, updateAppointment, deleteAppointment } = useData();
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState<AppointmentFormData>({
        clientId: '',
        date: selectedDate,
        time: '09:00',
        serviceIds: [],
        notes: '',
        status: 'scheduled',
    });

    const dayAppointments = appointments
        .filter(a => a.date === selectedDate)
        .sort((a, b) => a.time.localeCompare(b.time));

    const resetForm = () => {
        setFormData({
            clientId: '',
            date: selectedDate,
            time: '09:00',
            serviceIds: [],
            notes: '',
            status: 'scheduled',
        });
        setShowForm(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const selectedServices = services.filter(s => formData.serviceIds.includes(s.id));
        const client = clients.find(c => c.id === formData.clientId);

        if (!client || selectedServices.length === 0) return;

        const totalValue = selectedServices.reduce((sum, s) => sum + s.price, 0);
        const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration, 0);

        addAppointment({
            clientId: client.id,
            clientName: client.name,
            services: selectedServices,
            date: formData.date,
            time: formData.time,
            duration: totalDuration,
            status: formData.status,
            notes: formData.notes,
            totalValue,
        });

        resetForm();
    };

    const handleServiceToggle = (serviceId: string) => {
        setFormData(prev => ({
            ...prev,
            serviceIds: prev.serviceIds.includes(serviceId)
                ? prev.serviceIds.filter(id => id !== serviceId)
                : [...prev.serviceIds, serviceId],
        }));
    };

    const handleDelete = (id: string) => {
        if (confirm('Tem certeza que deseja excluir este agendamento?')) {
            deleteAppointment(id);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Agendamentos</h1>
                    <p className="text-gray-500 mt-1">Gerencie os agendamentos do studio</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 gradient-bg text-white rounded-xl hover:opacity-90 transition-all shadow-lg"
                >
                    <Plus className="w-5 h-5" />
                    Novo Agendamento
                </button>
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
                            <h2 className="text-xl font-semibold text-gray-900">Novo Agendamento</h2>
                            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cliente *</label>
                                <select
                                    value={formData.clientId}
                                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                                    required
                                >
                                    <option value="">Selecione um cliente</option>
                                    {clients.map((client) => (
                                        <option key={client.id} value={client.id}>{client.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
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
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Horário *</label>
                                    <select
                                        value={formData.time}
                                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                                    >
                                        {TIMES.map((time) => (
                                            <option key={time} value={time}>{time}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Serviços *</label>
                                <div className="border border-gray-200 rounded-xl p-3 max-h-48 overflow-y-auto">
                                    <div className="grid grid-cols-1 gap-2">
                                        {services.filter(s => s.active).map((service) => (
                                            <label
                                                key={service.id}
                                                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${formData.serviceIds.includes(service.id)
                                                    ? 'bg-pink-50 border border-pink-200'
                                                    : 'hover:bg-gray-50 border border-transparent'
                                                    }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={formData.serviceIds.includes(service.id)}
                                                    onChange={() => handleServiceToggle(service.id)}
                                                    className="w-4 h-4 text-pink-500 rounded focus:ring-pink-500"
                                                />
                                                <div className="flex-1">
                                                    <span className="text-sm font-medium text-gray-900">{service.name}</span>
                                                    <span className="text-sm text-gray-500 ml-2">({formatCurrency(service.price)})</span>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                {formData.serviceIds.length > 0 && (
                                    <div className="mt-2 text-sm text-gray-600 bg-gray-50 rounded-xl p-3">
                                        <strong>Total:</strong> {formatCurrency(
                                            services
                                                .filter(s => formData.serviceIds.includes(s.id))
                                                .reduce((sum, s) => sum + s.price, 0)
                                        )}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                                <input
                                    type="text"
                                    placeholder="Observações adicionais"
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    disabled={formData.serviceIds.length === 0}
                                    className="flex-1 py-3 gradient-bg text-white font-semibold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Agendar
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

            {/* Calendar and Appointments */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Calendar */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-semibold mb-4 text-gray-900 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-pink-500" />
                        Calendário
                    </h2>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                    />
                    <p className="text-sm text-gray-500 mt-3 capitalize">{formatDate(selectedDate)}</p>
                </div>

                {/* Day Appointments */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-semibold mb-4 text-gray-900">
                        Agendamentos de {new Date(selectedDate).toLocaleDateString('pt-BR')}
                    </h2>

                    {dayAppointments.length === 0 ? (
                        <div className="text-center py-12">
                            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">Nenhum agendamento para este dia</p>
                            <button
                                onClick={() => {
                                    setFormData(prev => ({ ...prev, date: selectedDate }));
                                    setShowForm(true);
                                }}
                                className="mt-4 text-pink-500 hover:text-pink-600 font-medium"
                            >
                                + Criar agendamento
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {dayAppointments.map((apt) => (
                                <div key={apt.id} className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow">
                                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                                        <div className="flex-1 w-full sm:w-auto">
                                            <div className="flex flex-wrap items-center gap-2 mb-3">
                                                <span className="bg-pink-100 text-pink-700 px-3 py-1.5 rounded-full font-bold text-xs flex items-center gap-1">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {apt.time}
                                                </span>
                                                <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${STATUS_CONFIG[apt.status].bgColor} ${STATUS_CONFIG[apt.status].color}`}>
                                                    {STATUS_CONFIG[apt.status].label}
                                                </span>
                                            </div>
                                            <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                                                <User className="w-5 h-5 text-pink-400 shrink-0" />
                                                <span className="truncate">{apt.clientName}</span>
                                            </h3>
                                            <p className="text-xs sm:text-sm text-gray-500 mt-1.5 line-clamp-2">
                                                {apt.services.map(s => s.name).join(', ')}
                                            </p>
                                            <div className="flex items-center justify-between sm:block mt-3 bg-gray-50 sm:bg-transparent p-3 sm:p-0 rounded-lg sm:rounded-none">
                                                <span className="text-[10px] text-gray-400 uppercase font-bold sm:hidden">Valor Total</span>
                                                <p className="text-xl font-bold text-green-600">
                                                    {formatCurrency(apt.totalValue)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-48">
                                            <div className="flex-1 sm:flex-none">
                                                <p className="text-[10px] text-gray-400 uppercase font-bold mb-1 sm:hidden ml-1">Status</p>
                                                <select
                                                    value={apt.status}
                                                    onChange={(e) => updateAppointment(apt.id, { status: e.target.value as AppointmentStatus })}
                                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-pink-500 outline-none bg-white shadow-sm"
                                                >
                                                    <option value="scheduled">Agendado</option>
                                                    <option value="confirmed">Confirmado</option>
                                                    <option value="completed">Concluído</option>
                                                    <option value="cancelled">Cancelado</option>
                                                    <option value="no-show">Não compareceu</option>
                                                </select>
                                            </div>
                                            <div className="flex-none sm:flex-1">
                                                <p className="text-[10px] text-gray-400 uppercase font-bold mb-1 sm:hidden text-center">Ação</p>
                                                <button
                                                    onClick={() => handleDelete(apt.id)}
                                                    className="w-full flex items-center justify-center gap-2 text-red-500 hover:text-white hover:bg-red-500 border border-red-100 sm:border-transparent py-2.5 sm:py-2 rounded-xl transition-all font-semibold"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    <span className="sm:inline">Excluir</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
