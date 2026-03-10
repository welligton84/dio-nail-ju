import { useState } from 'react';
import { useData } from '../contexts/useData';
import {
    Users,
    Calendar,
    TrendingUp,
    DollarSign,
    Clock,
    Sparkles
} from 'lucide-react';
import { StatCard } from '../components/shared/StatCard';
import { StatCardSkeleton } from '../components/shared/Skeleton';
import { formatCurrency } from '../utils/currency';
import { WhatsAppModal } from '../components/shared/WhatsAppModal';
import { useAppointmentManagement } from '../hooks/useAppointmentManagement';
import { AppointmentCard } from './appointments/AppointmentCard';
import { Modal } from '../components/shared/Modal';
import { AppointmentForm } from './appointments/AppointmentForm';
import { PaymentForm } from './appointments/PaymentForm';
import { TIMES } from '../utils/constants';
import { BirthdayWidget } from './dashboard/BirthdayWidget';
import { ServiceListWidget } from './dashboard/ServiceListWidget';

export function Dashboard() {
    const { dashboardStats, loading, todayBirthdays, monthBirthdays, services: allServices } = useData();

    const {
        appointments: allAppointments,
        dailyAppointments,
        // modal states
        showForm,
        setShowForm,
        editingId,
        showPaymentModal,
        setShowPaymentModal,
        isSubmittingPayment,
        payments,
        setPayments,
        showWhatsAppModal,
        setShowWhatsAppModal,
        whatsAppAppointment,
        whatsAppPhone,
        // form data
        formData,
        setFormData,
        // lookups
        services,
        clients,
        staff,
        // actions
        resetForm,
        handleEdit,
        handleSubmit,
        handleStatusChange,
        handlePay,
        handleWhatsApp,
        confirmPayment,
        handleDelete,
        handleServiceToggle,
        finishingAppointment
    } = useAppointmentManagement();



    // Local state for birthday WhatsApp
    const [birthdayWA, setBirthdayWA] = useState<{ name: string, phone: string } | null>(null);

    return (
        <div className="space-y-6">
            {/* Welcome Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-500 via-rose-500 to-purple-600 p-6 sm:p-8 text-white shadow-xl shadow-pink-500/20">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-5 h-5 text-pink-100" />
                        <span className="text-sm font-medium text-pink-100">Bom dia! ✨</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold mb-2">Juliana Miranda Concept</h1>
                    <p className="text-pink-100 text-sm sm:text-base max-w-xl">
                        Hoje você tem {dashboardStats.todayAppointments} agendamentos.
                        Continue assim! 💅
                    </p>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {loading ? (
                    <>
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                    </>
                ) : (
                    <>
                        <StatCard
                            title="Total de Clientes"
                            value={dashboardStats.totalClients}
                            icon={Users}
                            color="bg-blue-500"
                        />
                        <StatCard
                            title="Hoje"
                            value={dashboardStats.todayAppointments}
                            icon={Calendar}
                            color="bg-blue-600"
                        />
                        <StatCard
                            title="Receita / Mês"
                            value={formatCurrency(dashboardStats.monthlyRevenue)}
                            icon={TrendingUp}
                            color="bg-green-500"
                        />
                        <StatCard
                            title="Lucro / Mês"
                            value={formatCurrency(dashboardStats.monthlyProfit)}
                            icon={DollarSign}
                            color="bg-pink-500"
                        />
                    </>
                )}
            </div>

            {/* Today's Appointments */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-3">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Clock className="w-5 h-5 text-pink-500" />
                                Próximos Atendimentos
                            </h2>
                            <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Hoje</span>
                        </div>
                        <div className="p-6">
                            {dailyAppointments.length === 0 ? (
                                <div className="text-center py-12">
                                    <Calendar className="w-16 h-16 text-gray-100 dark:text-gray-800 mx-auto mb-4" />
                                    <p className="text-gray-500 dark:text-gray-400 font-medium">Nenhum agendamento para hoje.</p>
                                    <button
                                        onClick={() => setShowForm(true)}
                                        className="mt-4 text-pink-500 font-bold hover:underline"
                                    >
                                        Agendar agora
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                </div>
            </div>

            {/* Birthdays and Services */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                <div className="lg:col-span-1">
                    <BirthdayWidget
                        todayBirthdays={todayBirthdays}
                        monthBirthdays={monthBirthdays}
                        onSendWhatsApp={(name, phone) => setBirthdayWA({ name, phone })}
                    />
                </div>
                <div className="lg:col-span-2">
                    <ServiceListWidget services={allServices} />
                </div>
            </div>

            {/* Appointment Form Modal */}
            <Modal
                isOpen={showForm}
                onClose={resetForm}
                title={editingId ? "Editar Agendamento" : "Novo Agendamento"}
            >
                <AppointmentForm
                    formData={formData}
                    setFormData={setFormData}
                    appointments={allAppointments}
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
                    payments={payments}
                    setPayments={setPayments}
                    onSubmit={confirmPayment}
                    onCancel={() => setShowPaymentModal(false)}
                    loading={isSubmittingPayment}
                    totalExpectedValue={finishingAppointment?.totalValue || 0}
                />
            </Modal>

            {/* WhatsApp Modals */}
            <WhatsAppModal
                isOpen={showWhatsAppModal}
                onClose={() => setShowWhatsAppModal(false)}
                appointment={whatsAppAppointment}
                clientPhone={whatsAppPhone}
            />

            <WhatsAppModal
                isOpen={!!birthdayWA}
                onClose={() => setBirthdayWA(null)}
                clientName={birthdayWA?.name}
                clientPhone={birthdayWA?.phone}
                isBirthday={true}
                appointment={null}
            />
        </div>
    );
}
