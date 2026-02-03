import React from 'react';
import type { AppointmentFormData, Client, Service, Staff } from '../../types';

interface AppointmentFormProps {
    formData: AppointmentFormData;
    setFormData: (data: AppointmentFormData) => void;
    clients: Client[];
    services: Service[];
    staff: Staff[];
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
    handleServiceToggle: (serviceId: string) => void;
    formatCurrency: (value: number) => string;
    editingId: string | null;
    TIMES: string[];
}

export function AppointmentForm({
    formData,
    setFormData,
    clients,
    services,
    staff,
    onSubmit,
    onCancel,
    handleServiceToggle,
    formatCurrency,
    editingId,
    TIMES
}: AppointmentFormProps) {
    return (
        <form onSubmit={onSubmit} className="p-6 space-y-4">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Profissional *</label>
                <select
                    value={formData.staffId}
                    onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                    required
                >
                    <option value="">Selecione um profissional</option>
                    {staff.filter(s => s.active).map((member) => (
                        <option key={member.id} value={member.id}>{member.name}</option>
                    ))}
                </select>
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
                    className="flex-1 py-3 gradient-bg text-white font-semibold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                    {editingId ? 'Salvar Alterações' : 'Agendar'}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-gray-600 font-medium"
                >
                    Cancelar
                </button>
            </div>
        </form>
    );
}
