import React from 'react';
import type { Appointment, AppointmentFormData, Client, Service, Staff } from '../../types';
import { AlertCircle, Clock, User as UserIcon } from 'lucide-react';
import { AppointmentStatus } from '../../types/enums';

interface AppointmentFormProps {
    formData: AppointmentFormData;
    setFormData: (data: AppointmentFormData) => void;
    appointments: Appointment[];
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
    appointments,
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
    const getOccupiedStaffAt = React.useCallback((date: string, time: string) => {
        return appointments
            .filter(apt =>
                apt.id !== editingId &&
                apt.date === date &&
                apt.time === time &&
                apt.status !== AppointmentStatus.CANCELLED
            )
            .map(apt => apt.staffId);
    }, [appointments, editingId]);

    const occupiedStaffIds = React.useMemo(() => {
        if (!formData.date || !formData.time) return [];
        return getOccupiedStaffAt(formData.date, formData.time);
    }, [formData.date, formData.time, getOccupiedStaffAt]);

    const isSpecificConflict = React.useMemo(() => {
        if (!formData.staffId) return false;
        return occupiedStaffIds.includes(formData.staffId);
    }, [formData.staffId, occupiedStaffIds]);

    const isTimeFullyOccupied = React.useMemo(() => {
        if (!formData.date || !formData.time) return false;
        const occupiedCount = getOccupiedStaffAt(formData.date, formData.time).length;
        const activeStaffCount = staff.filter(s => s.active).length;
        return occupiedCount >= activeStaffCount && activeStaffCount > 0;
    }, [formData.date, formData.time, staff, getOccupiedStaffAt]);

    return (
        <form onSubmit={onSubmit} className="p-6 space-y-4 text-left">
            {isSpecificConflict && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-bold text-amber-800 dark:text-amber-200">Conflito de Horário</p>
                        <p className="text-xs text-amber-700 dark:text-amber-300">Este profissional já possui outro agendamento neste horário.</p>
                    </div>
                </div>
            )}

            <div>
                <label htmlFor="appointment-client" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cliente *</label>
                <select
                    id="appointment-client"
                    value={formData.clientId}
                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 dark:text-white"
                    required
                    aria-required="true"
                >
                    <option value="">Selecione um cliente</option>
                    {clients.map((client) => (
                        <option key={client.id} value={client.id}>{client.name}</option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="appointment-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data *</label>
                    <input
                        id="appointment-date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 dark:text-white"
                        required
                        aria-required="true"
                    />
                </div>
                <div>
                    <label htmlFor="appointment-time" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Horário *</label>
                    <div className="relative">
                        <select
                            id="appointment-time"
                            value={formData.time}
                            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none appearance-none bg-white dark:bg-gray-800 dark:text-white ${isTimeFullyOccupied ? 'border-amber-300 bg-amber-50 dark:bg-amber-900/20' : 'border-gray-200 dark:border-gray-600'}`}
                            required
                            aria-required="true"
                            aria-invalid={isTimeFullyOccupied ? "true" : "false"}
                        >
                            {TIMES.map((time) => {
                                const occupiedCount = getOccupiedStaffAt(formData.date, time).length;
                                const isFull = occupiedCount >= staff.filter(s => s.active).length;
                                return (
                                    <option key={time} value={time}>
                                        {time} {isFull ? '(Ocupado)' : occupiedCount > 0 ? `(${occupiedCount} ocupado)` : ''}
                                    </option>
                                );
                            })}
                        </select>
                        <Clock className={`absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isTimeFullyOccupied ? 'text-amber-500' : 'text-gray-400'} pointer-events-none`} aria-hidden="true" />
                    </div>
                </div>
            </div>

            <div role="group" aria-labelledby="staff-label">
                <label id="staff-label" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Profissional *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" role="radiogroup" aria-required="true">
                    {staff.filter(s => s.active).map((member) => {
                        const isBusy = occupiedStaffIds.includes(member.id);
                        return (
                            <button
                                key={member.id}
                                type="button"
                                role="radio"
                                aria-checked={formData.staffId === member.id}
                                disabled={isBusy}
                                aria-disabled={isBusy ? "true" : "false"}
                                onClick={() => setFormData({ ...formData, staffId: member.id })}
                                className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left focus:outline-none focus:ring-2 focus:ring-pink-500 ${formData.staffId === member.id
                                    ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20 ring-1 ring-pink-500'
                                    : isBusy
                                        ? 'border-amber-100 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10 opacity-70 grayscale-[0.5] cursor-not-allowed'
                                        : 'border-gray-100 dark:border-gray-700 hover:border-pink-200 dark:hover:border-pink-800 hover:bg-gray-50 dark:hover:bg-gray-800'
                                    }`}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${formData.staffId === member.id ? 'bg-pink-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'}`}>
                                    <UserIcon className="w-4 h-4" aria-hidden="true" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-bold truncate ${formData.staffId === member.id ? 'text-pink-700 dark:text-pink-300' : 'text-gray-700 dark:text-gray-300'}`}>
                                        {member.name}
                                    </p>
                                    {isBusy && (
                                        <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-tight">Ocupada neste horário</p>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
                <input type="hidden" value={formData.staffId} required aria-hidden="true" name="staffId" />
            </div>

            <div>
                <label id="services-label" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Serviços *</label>
                <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-3 max-h-48 overflow-y-auto bg-white dark:bg-gray-800">
                    <div className="grid grid-cols-1 gap-2" role="group" aria-labelledby="services-label">
                        {services.filter(s => s.active).map((service) => (
                            <label
                                key={service.id}
                                htmlFor={`service-${service.id}`}
                                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${formData.serviceIds.includes(service.id)
                                    ? 'bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800'
                                    : 'hover:bg-gray-50 dark:hover:bg-gray-700 border border-transparent'
                                    }`}
                            >
                                <input
                                    id={`service-${service.id}`}
                                    type="checkbox"
                                    checked={formData.serviceIds.includes(service.id)}
                                    onChange={() => handleServiceToggle(service.id)}
                                    className="w-4 h-4 text-pink-500 rounded focus:ring-pink-500"
                                />
                                <div className="flex-1">
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">{service.name}</span>
                                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">({formatCurrency(service.price)})</span>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>
                {formData.serviceIds.length > 0 && (
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                        <strong className="text-gray-900 dark:text-white">Total:</strong> {formatCurrency(
                            services
                                .filter(s => formData.serviceIds.includes(s.id))
                                .reduce((sum, s) => sum + s.price, 0)
                        )}
                    </div>
                )}
            </div>

            <div>
                <label htmlFor="appointment-notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Observações</label>
                <input
                    id="appointment-notes"
                    type="text"
                    placeholder="Observações adicionais"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 dark:text-white"
                />
            </div>

            <div className="flex gap-3 pt-4">
                <button
                    type="submit"
                    disabled={formData.serviceIds.length === 0 || isSpecificConflict || !formData.staffId}
                    className="flex-1 py-3 gradient-bg text-white font-semibold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                    {editingId ? 'Salvar Alterações' : 'Agendar'}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-3 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-gray-600 dark:text-gray-400 font-medium"
                >
                    Cancelar
                </button>
            </div>
        </form>
    );
}
