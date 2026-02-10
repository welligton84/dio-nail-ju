import { Calendar } from 'lucide-react';
import { Modal } from '../components/shared/Modal';
import { WhatsAppModal } from '../components/shared/WhatsAppModal';
import { AppointmentCard } from './appointments/AppointmentCard';
import { AppointmentForm } from './appointments/AppointmentForm';
import { AppointmentHeader } from './appointments/AppointmentHeader';
import { DateSelector } from './appointments/DateSelector';
import { PaymentForm } from './appointments/PaymentForm';
import { useAppointmentManagement } from '../hooks/useAppointmentManagement';
import { formatCurrency } from '../utils/currency';

const TIMES = [
    '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30', '19:00', '19:30', '20:00', '20:30'
];

export function Appointments() {
    const {
        appointments,
        services,
        clients,
        staff,
        showForm,
        setShowForm,
        editingId,
        selectedDate,
        setSelectedDate,
        showPaymentModal,
        setShowPaymentModal,
        isSubmittingPayment,
        paymentValue,
        setPaymentValue,
        paymentMethod,
        setPaymentMethod,
        showWhatsAppModal,
        setShowWhatsAppModal,
        whatsAppAppointment,
        whatsAppPhone,
        formData,
        setFormData,
        dailyAppointments,
        resetForm,
        handleEdit,
        handleSubmit,
        handleStatusChange,
        handlePay,
        handleWhatsApp,
        confirmPayment,
        handleDelete,
        handleServiceToggle,
        changeDate
    } = useAppointmentManagement();

    return (
        <div className="space-y-6">
            <AppointmentHeader onNewAppointment={() => setShowForm(true)} />

            <DateSelector
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                onPrevDay={() => changeDate(-1)}
                onNextDay={() => changeDate(1)}
            />

            {/* Appointments List */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Agenda do Dia</h2>
                    <span className="bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 px-3 py-1 rounded-full text-xs font-bold uppercase">
                        {dailyAppointments.length} atendimentos
                    </span>
                </div>
                <div className="p-6">
                    {dailyAppointments.length === 0 ? (
                        <div className="text-center py-12">
                            <Calendar className="w-16 h-16 text-gray-100 dark:text-gray-800 mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-gray-400 font-medium">Nenhum agendamento para este dia.</p>
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
                    appointments={appointments}
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
                <PaymentForm
                    paymentValue={paymentValue}
                    setPaymentValue={setPaymentValue}
                    paymentMethod={paymentMethod}
                    setPaymentMethod={setPaymentMethod}
                    onSubmit={confirmPayment}
                    onCancel={() => setShowPaymentModal(false)}
                    loading={isSubmittingPayment}
                />
            </Modal>

            <WhatsAppModal
                isOpen={showWhatsAppModal}
                onClose={() => setShowWhatsAppModal(false)}
                appointment={whatsAppAppointment}
                clientPhone={whatsAppPhone}
            />
        </div>
    );
}
