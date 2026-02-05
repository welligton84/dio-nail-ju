import { useState } from 'react';
<<<<<<< HEAD
import { useData } from '../hooks/useData';
=======
import { useData } from '../contexts/DataContext';
>>>>>>> b507692 (feat: rebrand to Juliana Miranda Concept, add Vitest, fix routing and finance filters)
import type { Appointment, AppointmentFormData, AppointmentStatus, PaymentMethod } from '../types';
import { Calendar, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Modal } from '../components/shared/Modal';
import { WhatsAppModal } from '../components/shared/WhatsAppModal';
import { AppointmentCard } from './appointments/AppointmentCard';
import { AppointmentForm } from './appointments/AppointmentForm';
<<<<<<< HEAD

const TIMES = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30', '19:00'
=======
import { toast } from 'sonner';

const TIMES = [
    '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30', '19:00', '19:30', '20:00', '20:30'
>>>>>>> b507692 (feat: rebrand to Juliana Miranda Concept, add Vitest, fix routing and finance filters)
];

export function Appointments() {
    const {
        appointments,
        services,
        clients,
        staff,
        addAppointment,
        updateAppointment,
        deleteAppointment,
        addFinancialRecord
    } = useData();

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    // States for payment
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [finishingAppointment, setFinishingAppointment] = useState<Appointment | null>(null);
    const [paymentValue, setPaymentValue] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');

    // States for WhatsApp
    const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
    const [whatsAppAppointment, setWhatsAppAppointment] = useState<Appointment | null>(null);
    const [whatsAppPhone, setWhatsAppPhone] = useState<string>('');

    const [formData, setFormData] = useState<AppointmentFormData>({
        clientId: '',
        date: new Date().toISOString().split('T')[0],
        time: '09:00',
        serviceIds: [],
        staffId: '',
        status: 'scheduled',
        notes: '',
    });

    const dailyAppointments = appointments
        .filter(apt => apt.date === selectedDate)
        .sort((a, b) => a.time.localeCompare(b.time));

    const resetForm = () => {
        setFormData({
            clientId: '',
            date: new Date().toISOString().split('T')[0],
            time: '09:00',
            serviceIds: [],
            staffId: '',
            status: 'scheduled',
            notes: '',
        });
        setShowForm(false);
        setEditingId(null);
    };

    const handleEdit = (apt: Appointment) => {
        setFormData({
            clientId: apt.clientId,
            date: apt.date,
            time: apt.time,
            serviceIds: apt.services.map(s => s.id),
            staffId: apt.staffId,
            status: apt.status,
            notes: apt.notes || '',
        });
        setEditingId(apt.id);
        setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const selectedServices = services.filter(s => formData.serviceIds.includes(s.id));
        const totalValue = selectedServices.reduce((sum, s) => sum + s.price, 0);
        const duration = selectedServices.reduce((sum, s) => sum + s.duration, 0);
        const clientName = clients.find(c => c.id === formData.clientId)?.name || '';
        const staffName = staff.find(s => s.id === formData.staffId)?.name || '';

        const appointmentData = {
            ...formData,
            clientName,
            staffName,
            services: selectedServices,
            totalValue,
            duration,
            paid: false,
        };

        if (editingId) {
            await updateAppointment(editingId, appointmentData);
        } else {
            await addAppointment(appointmentData);
        }

        resetForm();
    };

    const handleStatusChange = async (id: string, status: AppointmentStatus) => {
        const apt = appointments.find(a => a.id === id);
        if (!apt) return;

        // If completing, ask if they want to pay now
        if (status === 'completed' && !apt.paid) {
            if (confirm("Deseja informar o pagamento agora?\n\nOK = Sim, pagar agora\nCancelar = Pagar depois")) {
                handlePay(apt);
            } else {
                await updateAppointment(id, { status: 'completed' });
            }
            return;
        }

        await updateAppointment(id, { status });
    };

    const handlePay = (apt: Appointment) => {
        setFinishingAppointment(apt);
        setPaymentValue(apt.totalValue.toString());
        setPaymentMethod('pix'); // Default
        setShowPaymentModal(true);
    };

    const handleWhatsApp = (apt: Appointment) => {
        const client = clients.find(c => c.id === apt.clientId);
        if (client && client.phone) {
            setWhatsAppAppointment(apt);
            setWhatsAppPhone(client.phone);
            setShowWhatsAppModal(true);
        } else {
<<<<<<< HEAD
            alert('Cliente sem telefone cadastrado.');
=======
            toast.error('Cliente sem telefone cadastrado.');
>>>>>>> b507692 (feat: rebrand to Juliana Miranda Concept, add Vitest, fix routing and finance filters)
        }
    };

    const confirmPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!finishingAppointment) return;

        const value = parseFloat(paymentValue);

        // 1. Update appointment status to completed and paid
        await updateAppointment(finishingAppointment.id, {
            status: 'completed',
            totalValue: value,
            paid: true
        });

        // 2. Add financial record
        await addFinancialRecord({
            type: 'income',
            category: 'Serviços',
            description: `Atendimento - ${finishingAppointment.clientName}`,
            value: value,
            date: finishingAppointment.date,
            appointmentId: finishingAppointment.id,
            paymentMethod: paymentMethod
        });

        setShowPaymentModal(false);
        setFinishingAppointment(null);
        setPaymentValue('');
    };

    const handleDelete = async (id: string) => {
        if (confirm('Tem certeza que deseja excluir este agendamento?')) {
            await deleteAppointment(id);
        }
    };

    const handleServiceToggle = (serviceId: string) => {
        setFormData(prev => ({
            ...prev,
            serviceIds: prev.serviceIds.includes(serviceId)
                ? prev.serviceIds.filter(id => id !== serviceId)
                : [...prev.serviceIds, serviceId],
        }));
    };

    const changeDate = (days: number) => {
        const date = new Date(selectedDate);
        date.setDate(date.getDate() + days);
        setSelectedDate(date.toISOString().split('T')[0]);
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Agendamentos</h1>
                    <p className="text-gray-500 mt-1">Gerencie os horários do studio</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 gradient-bg text-white rounded-xl hover:opacity-90 transition-all shadow-lg font-bold"
                >
                    <Plus className="w-5 h-5" />
                    Novo Agendamento
                </button>
            </div>

            {/* Date Selector */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                <button
                    onClick={() => changeDate(-1)}
                    className="p-2 hover:bg-gray-50 rounded-lg transition-colors text-gray-400"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-pink-500" />
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="text-lg font-bold text-gray-900 border-none focus:ring-0 cursor-pointer p-0"
                    />
                </div>
                <button
                    onClick={() => changeDate(1)}
                    className="p-2 hover:bg-gray-50 rounded-lg transition-colors text-gray-400"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>
            </div>

            {/* Appointments List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-900">
                        Agenda do Dia
                    </h2>
                    <span className="bg-pink-100 text-pink-600 px-3 py-1 rounded-full text-xs font-bold uppercase">
                        {dailyAppointments.length} atendimentos
                    </span>
                </div>
                <div className="p-6">
                    {dailyAppointments.length === 0 ? (
                        <div className="text-center py-12">
                            <Calendar className="w-16 h-16 text-gray-100 mx-auto mb-4" />
                            <p className="text-gray-500 font-medium">Nenhum agendamento para este dia.</p>
                            <button
                                onClick={() => setShowForm(true)}
                                className="mt-4 text-pink-500 font-bold hover:underline"
                            >
                                Agendar agora
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {dailyAppointments.map((apt) => (
                                <AppointmentCard
                                    key={apt.id}
                                    appointment={apt}
                                    onStatusChange={handleStatusChange}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    onPay={handlePay}
                                    onWhatsApp={() => handleWhatsApp(apt)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Form */}
            <Modal
                isOpen={showForm}
                onClose={resetForm}
                title={editingId ? "Editar Agendamento" : "Novo Agendamento"}
            >
                <AppointmentForm
                    formData={formData}
                    setFormData={setFormData}
                    clients={clients}
                    services={services}
                    staff={staff}
                    onSubmit={handleSubmit}
                    onCancel={resetForm}
                    handleServiceToggle={handleServiceToggle}
                    formatCurrency={formatCurrency}
                    editingId={editingId}
                    TIMES={TIMES}
                />
            </Modal>

            {/* Payment Modal */}
            <Modal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                title="Registrar Pagamento"
            >
                <form onSubmit={confirmPayment} className="p-6 space-y-4">
                    <p className="text-gray-600">
                        Confirme os dados do pagamento para finalizar.
                        <br />
                        <span className="text-xs text-red-500 font-bold">⚠️ Após o pagamento, o agendamento não poderá ser alterado.</span>
                    </p>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={paymentValue}
                            onChange={(e) => setPaymentValue(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none text-lg font-bold text-gray-900"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Forma de Pagamento</label>
                        <select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none bg-white font-medium"
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
                            className="flex-1 py-3 gradient-bg text-white font-semibold rounded-xl hover:opacity-90 transition-all shadow-md flex items-center justify-center gap-2"
                        >
                            <span>Confirmar Recebimento</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowPaymentModal(false)}
                            className="px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-gray-600 font-medium"
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </Modal>

            {/* WhatsApp Modal */}
            <WhatsAppModal
                isOpen={showWhatsAppModal}
                onClose={() => setShowWhatsAppModal(false)}
                appointment={whatsAppAppointment}
                clientPhone={whatsAppPhone}
            />
        </div>
    );
}
