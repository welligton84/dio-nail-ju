import { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { useTheme } from '../contexts/ThemeContext';
import {
    Users,
    Calendar,
    TrendingUp,
    DollarSign,
    Clock,
    Gift,
    Cake,
    MessageCircle,
    Sun,
    Moon
} from 'lucide-react';
import { StatCard } from '../components/shared/StatCard';
import { StatCardSkeleton } from '../components/shared/Skeleton';
import { formatCurrency } from '../utils/currency';
import { WhatsAppModal } from '../components/shared/WhatsAppModal';
import { isBirthdayToday } from '../utils/birthday';
import { useAppointmentManagement } from '../hooks/useAppointmentManagement';
import { AppointmentCard } from './appointments/AppointmentCard';
import { Modal } from '../components/shared/Modal';
import { AppointmentForm } from './appointments/AppointmentForm';
import { PaymentForm } from './appointments/PaymentForm';

const TIMES = [
    '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30', '19:00', '19:30', '20:00', '20:30'
];

export function Dashboard() {
    const { dashboardStats, loading, todayBirthdays, monthBirthdays, services: allServices, financialRecords, deleteFinancialRecord } = useData();
    const { theme, toggleTheme } = useTheme();

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
        paymentValue,
        setPaymentValue,
        paymentMethod,
        setPaymentMethod,
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
        handleServiceToggle
    } = useAppointmentManagement();

    // TEMPORARY: Cleanup duplicate records for Yasmin Cecilia Dos Santos (2026-02-09)
    useEffect(() => {
        if (loading || financialRecords.length === 0) return;

        const TARGET_NAME = "Yasmin Cecilia Dos Santos";
        const TARGET_DATE = "2026-02-09";

        const yasminRecords = financialRecords.filter(r =>
            r.description.includes(TARGET_NAME) &&
            r.date === TARGET_DATE &&
            r.type === 'income'
        );

        if (yasminRecords.length > 1) {
            console.log(`[CLEANUP] Found ${yasminRecords.length} records for Yasmin. Removing duplicates...`);
            // Keep the first one, delete others
            const duplicates = yasminRecords.slice(1);
            duplicates.forEach(async (record) => {
                try {
                    await deleteFinancialRecord(record.id);
                    console.log(`[CLEANUP] Deleted duplicate record: ${record.id}`);
                } catch (err) {
                    console.error(`[CLEANUP] Error deleting record ${record.id}:`, err);
                }
            });
        }
    }, [loading, financialRecords, deleteFinancialRecord]);

    // Local state for birthday WhatsApp
    const [birthdayWA, setBirthdayWA] = useState<{ name: string, phone: string } | null>(null);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Olá, Juliana!</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Veja o que está acontecendo hoje no studio.</p>
                </div>
                <button
                    onClick={toggleTheme}
                    className="p-3 rounded-xl bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all border border-gray-200 dark:border-gray-800 shadow-sm"
                    title="Alternar tema"
                >
                    {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </button>
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
                            color="bg-purple-500"
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
                {/* Today's Birthdays */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 h-full">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Cake className="w-5 h-5 text-pink-500" />
                            Aniversariantes do Dia
                        </h2>
                        {todayBirthdays.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <Gift className="w-10 h-10 text-gray-200 dark:text-gray-800 mb-2" />
                                <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">Ninguém faz aniversário hoje.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {todayBirthdays.map((client) => (
                                    <div key={client.id} className="flex items-center justify-between p-3 bg-pink-50 dark:bg-pink-900/10 rounded-xl">
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white text-sm">{client.name}</p>
                                            <p className="text-xs text-pink-600 dark:text-pink-400 font-medium tracking-tighter uppercase">Parabéns! 🎉</p>
                                        </div>
                                        <button
                                            onClick={() => setBirthdayWA({ name: client.name, phone: client.phone })}
                                            className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-sm"
                                            title="Enviar Parabéns"
                                        >
                                            <MessageCircle className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {monthBirthdays.length > 0 && (
                            <div className="mt-6 pt-6 border-t border-gray-50 dark:border-gray-800">
                                <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">No mês</h3>
                                <div className="space-y-3 max-h-[150px] overflow-y-auto pr-1">
                                    {monthBirthdays.filter(c => !isBirthdayToday(c.birthDate!)).map(client => (
                                        <div key={client.id} className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">{client.name}</span>
                                            <span className="text-xs font-bold text-gray-400 dark:text-gray-500">
                                                {client.birthDate?.split('-')[2]}/{client.birthDate?.split('-')[1]}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Popular Services Mini List */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 h-full">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-green-500" />
                                Serviços Ativos
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {allServices.filter(s => s.active).slice(0, 6).map((service) => (
                                <div key={service.id} className="flex items-center justify-between p-3 border border-gray-50 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: service.color }} />
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{service.name}</span>
                                    </div>
                                    <span className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(service.price)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
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
                    paymentValue={paymentValue}
                    setPaymentValue={setPaymentValue}
                    paymentMethod={paymentMethod}
                    setPaymentMethod={setPaymentMethod}
                    onSubmit={confirmPayment}
                    onCancel={() => setShowPaymentModal(false)}
                    loading={isSubmittingPayment}
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
