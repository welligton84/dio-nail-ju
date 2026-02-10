import { useState, useCallback } from 'react';
import { useData } from '../contexts/DataContext';
import type { Appointment, AppointmentFormData, AppointmentStatus, PaymentMethod } from '../types';
import { toast } from 'sonner';
import { getCurrentDate } from '../utils/date';
import { haptics } from '../utils/haptics';

export function useAppointmentManagement() {
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
    const [selectedDate, setSelectedDate] = useState(getCurrentDate());

    // States for payment
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
    const [finishingAppointment, setFinishingAppointment] = useState<Appointment | null>(null);
    const [paymentValue, setPaymentValue] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');

    // States for WhatsApp
    const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
    const [whatsAppAppointment, setWhatsAppAppointment] = useState<Appointment | null>(null);
    const [whatsAppPhone, setWhatsAppPhone] = useState<string>('');

    const [formData, setFormData] = useState<AppointmentFormData>({
        clientId: '',
        date: getCurrentDate(),
        time: '09:00',
        serviceIds: [],
        staffId: '',
        status: 'scheduled',
        notes: '',
    });

    const dailyAppointments = appointments
        .filter(apt => apt.date === selectedDate)
        .sort((a, b) => a.time.localeCompare(b.time));

    const resetForm = useCallback(() => {
        setFormData({
            clientId: '',
            date: getCurrentDate(),
            time: '09:00',
            serviceIds: [],
            staffId: '',
            status: 'scheduled',
            notes: '',
        });
        setShowForm(false);
        setEditingId(null);
    }, []);

    const handleEdit = useCallback((apt: Appointment) => {
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
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Check for conflicts
        const hasConflict = appointments.some(apt =>
            apt.id !== editingId &&
            apt.date === formData.date &&
            apt.time === formData.time &&
            apt.staffId === formData.staffId &&
            apt.status !== 'cancelled'
        );

        if (hasConflict) {
            toast.error('Este profissional já possui um agendamento para este horário.');
            return;
        }

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

    const handlePay = useCallback((apt: Appointment) => {
        setFinishingAppointment(apt);
        setPaymentValue(apt.totalValue.toString());
        setPaymentMethod('pix');
        setShowPaymentModal(true);
    }, []);

    const handleStatusChange = async (id: string, status: AppointmentStatus) => {
        const apt = appointments.find(a => a.id === id);
        if (!apt) return;

        if (status === 'completed' && !apt.paid) {
            if (window.confirm("Deseja informar o pagamento agora?\n\nOK = Sim, pagar agora\nCancelar = Pagar depois")) {
                handlePay(apt);
            } else {
                await updateAppointment(id, { status: 'completed' });
            }
            return;
        }

        await updateAppointment(id, { status });
    };

    const handleWhatsApp = useCallback((apt: Appointment) => {
        const client = clients.find(c => c.id === apt.clientId);
        if (client && client.phone) {
            setWhatsAppAppointment(apt);
            setWhatsAppPhone(client.phone);
            setShowWhatsAppModal(true);
        } else {
            toast.error('Cliente sem telefone cadastrado.');
        }
    }, [clients]);

    const confirmPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!finishingAppointment || isSubmittingPayment) return;

        // Prevent double payment if already paid
        if (finishingAppointment.paid) {
            toast.error('Este agendamento já foi pago.');
            setShowPaymentModal(false);
            return;
        }

        const value = parseFloat(paymentValue);
        setIsSubmittingPayment(true);

        try {
            await updateAppointment(finishingAppointment.id, {
                status: 'completed',
                totalValue: value,
                paid: true
            });

            await addFinancialRecord({
                type: 'income',
                category: 'Serviços',
                description: `Atendimento - ${finishingAppointment.clientName}`,
                value: value,
                date: finishingAppointment.date,
                appointmentId: finishingAppointment.id,
                paymentMethod: paymentMethod
            });

            haptics.success();
            setShowPaymentModal(false);
            setFinishingAppointment(null);
            setPaymentValue('');
        } catch (error) {
            console.error('Erro ao processar pagamento:', error);
            toast.error('Ocorreu um erro ao processar o pagamento. Tente novamente.');
        } finally {
            setIsSubmittingPayment(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir este agendamento?')) {
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

    return {
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
    };
}
