import { useState, useCallback, useEffect } from 'react';
import { useData } from '../contexts/useData';
import { useSettings } from '../contexts/useSettings';
import type { Appointment, AppointmentFormData } from '../types';
import type { AppointmentPayment } from '../sections/appointments/PaymentForm';
import { toast } from 'sonner';
import { getCurrentDate } from '../utils/date';
import { haptics } from '../utils/haptics';
import { isFirebaseError } from '../utils/firebase-error';
import { createNFSeService, type NFSeData, type NFSeServiceItem } from '../services/nfse';
import { AppointmentStatus, FinancialType, PaymentMethod } from '../types';
import { functions } from '../lib/firebase';
import { httpsCallable } from 'firebase/functions';

export function useAppointmentManagement() {
    const {
        appointments,
        services,
        clients,
        staff,
        addAppointment,
        updateAppointment,
        deleteAppointment,
        addFinancialRecord,
        addNFSeRecord,
        loadAppointmentsByPeriod
    } = useData();
    const { nfse, company } = useSettings();

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState(getCurrentDate());

    // Load appointments for the selected month (Busca Sob Demanda)
    useEffect(() => {
        if (selectedDate) {
            const date = new Date(selectedDate);
            const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
            const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

            loadAppointmentsByPeriod(
                firstDay.toISOString().split('T')[0],
                lastDay.toISOString().split('T')[0]
            );
        }
    }, [selectedDate, loadAppointmentsByPeriod]);

    // States for payment
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
    const [finishingAppointment, setFinishingAppointment] = useState<Appointment | null>(null);
    const [payments, setPayments] = useState<AppointmentPayment[]>([{ id: crypto.randomUUID(), value: '', method: PaymentMethod.PIX }]);

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
        status: AppointmentStatus.SCHEDULED,
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
            status: AppointmentStatus.SCHEDULED,
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
            apt.status !== AppointmentStatus.CANCELLED
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
        setPayments([{ id: crypto.randomUUID(), value: apt.totalValue.toString(), method: 'pix' }]);
        setShowPaymentModal(true);
    }, []);

    const handleStatusChange = async (id: string, status: AppointmentStatus) => {
        const apt = appointments.find(a => a.id === id);
        if (!apt) return;

        if (status === AppointmentStatus.COMPLETED && !apt.paid) {
            if (window.confirm("Deseja informar o pagamento agora?\n\nOK = Sim, pagar agora\nCancelar = Pagar depois")) {
                handlePay(apt);
            } else {
                await updateAppointment(id, { status: AppointmentStatus.COMPLETED });
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

        // Validate payments
        const validPayments = payments.map(p => ({
            value: parseFloat(p.value),
            method: p.method
        })).filter(p => !isNaN(p.value) && p.value > 0);

        if (validPayments.length === 0) {
            toast.error('Informe um valor válido para o pagamento.');
            return;
        }

        const totalValue = validPayments.reduce((sum, p) => sum + p.value, 0);

        // Prevent double payment if already paid
        if (finishingAppointment.paid) {
            toast.error('Este agendamento já foi pago.');
            setShowPaymentModal(false);
            return;
        }

        setIsSubmittingPayment(true);

        try {
            await updateAppointment(finishingAppointment.id, {
                status: AppointmentStatus.COMPLETED,
                totalValue: totalValue,
                paid: true
            });

            // Iterate and save multiple financial records if paying with split methods
            for (const payment of validPayments) {
                await addFinancialRecord({
                    type: FinancialType.INCOME,
                    category: 'Serviços',
                    description: `Atendimento - ${finishingAppointment.clientName}`,
                    value: payment.value,
                    date: finishingAppointment.date,
                    appointmentId: finishingAppointment.id,
                    paymentMethod: payment.method
                });
            }

            // Emit NFSe if enabled (don't await - fire and forget)
            if (nfse.enabled) {
                // Determine primary method for Invoice (usually just one field in NFSe XML)
                const primaryMethod = validPayments[0]?.method || 'pix';
                emitNFSe(finishingAppointment, totalValue, primaryMethod).catch(err => {
                    console.error('Erro na NFSe (não bloqueia pagamento):', err);
                });
            }

            haptics.success();
            setShowPaymentModal(false);
            setFinishingAppointment(null);
            setPayments([{ id: crypto.randomUUID(), value: '', method: 'pix' }]);
        } catch (error) {
            console.error('Erro ao processar pagamento:', error);
            if (isFirebaseError(error)) {
                if (error.code === 'permission-denied') {
                    toast.error('Permissão negada. Você não tem acesso para registrar pagamentos.');
                } else if (error.code === 'unavailable') {
                    toast.error('Servidor indisponível. Verifique sua conexão e tente novamente.');
                } else {
                    toast.error(`Erro: ${error.message}`);
                }
            } else {
                toast.error('Ocorreu um erro ao processar o pagamento. Tente novamente.');
            }
        } finally {
            setIsSubmittingPayment(false);
        }
    };

    // Emit NFSe after payment
    const emitNFSe = async (appointment: Appointment, value: number, paymentMethod: string) => {
        if (!nfse.enabled) {
            return;
        }

        if (!company.cnpj && !company.cpf) {
            console.warn('NFSe: CNPJ ou CPF da empresa não configurado');
            return;
        }

        if (!nfse.cityCode || !nfse.serviceCode || !nfse.cnaeCode) {
            console.warn('NFSe: Configuração incompleta');
            toast.warning('NFSe habilitada mas configuração incompleta. Verifique os dados em Configurações → NFSe');
            return;
        }

        const client = clients.find(c => c.id === appointment.clientId);
        if (!client) {
            console.warn('NFSe: Cliente não encontrado');
            return;
        }

        const appointmentServices = services.filter(s => appointment.services.some(as => as.id === s.id));
        const serviceItems: NFSeServiceItem[] = appointmentServices.map(s => ({
            code: nfse.serviceCode,
            description: s.name,
            value: s.price
        }));

        const nfseData: NFSeData = {
            issuer: {
                cnpj: company.cnpj || company.cpf?.replace(/\D/g, '') || '',
                name: company.name,
                address: company.address,
                number: company.number,
                city: company.city,
                state: company.state,
                inscricaoMunicipal: company.inscricaoMunicipal || '',
            },
            service: {
                code: nfse.serviceCode,
                cnae: nfse.cnaeCode,
                aliqIss: nfse.aliqIss || '5',
                description: 'Serviços de beleza e cuidados pessoais',
                items: serviceItems
            },
            client: {
                name: client.name,
                cpf: client.cpf || '',
                email: client.email || '',
            },
            invoice: {
                value: value,
                paymentMethod: paymentMethod,
                date: new Date().toISOString(),
                appointmentId: appointment.id,
            }
        };

        // Check if API key is required but not configured (FocusNfe, PlugNotas)
        const providerRequiresApiKey = nfse.provider === 'focusnfe' || nfse.provider === 'plugnotas';
        
        // P0.2: Fetch secrets via Cloud Function (only admin can access secrets)
        let nfseConfigWithSecrets = { ...nfse };
        if ((providerRequiresApiKey || nfse.provider === 'national' || nfse.provider === 'national_homolog' || nfse.provider === 'webiss_juazeiro' || nfse.provider === 'isss') && functions) {
            try {
                const getNFSeConfig = httpsCallable(functions, 'getNFSeConfig');
                const result = await getNFSeConfig({});
                if (result.data && typeof result.data === 'object' && 'nfse' in result.data && result.data.nfse) {
                    nfseConfigWithSecrets = { ...nfse, ...result.data.nfse };
                }
            } catch (err) {
                console.warn('NFSe: Não foi possível buscar configurações completas:', err);
            }
        }

        if (providerRequiresApiKey && !nfseConfigWithSecrets.apiKey) {
            console.warn('NFSe: Token API não configurado para ' + (nfse.provider === 'focusnfe' ? 'FocusNfe' : 'PlugNotas'));
            toast.warning(`NFSe: Token API ${nfse.provider === 'focusnfe' ? 'FocusNfe' : 'PlugNotas'} não configurado. Configure em Configurações → NFSe.`);
            return;
        }

        const nfseService = createNFSeService(nfseConfigWithSecrets, company);
        if (!nfseService) {
            console.warn('NFSe: Falha ao criar serviço');
            return;
        }

        try {
            const result = await nfseService.emit(nfseData);

            if (result.success) {
                console.log('NFSe emitida com sucesso:', result);
                toast.success(`NFSe ${result.nfseNumber || 'TESTE'} emitida com sucesso!`);

                // Save NFSe record to Firebase
                const aliqIss = parseFloat(nfseData.service.aliqIss) || 5;
                const issValue = nfseData.invoice.value * (aliqIss / 100);

                await addNFSeRecord({
                    nfseNumber: result.nfseNumber || '',
                    verificationCode: result.verificationCode || '',
                    clientName: client.name,
                    clientCpf: client.cpf,
                    clientEmail: client.email,
                    serviceDescription: nfseData.service.description,
                    value: nfseData.invoice.value,
                    issValue: issValue,
                    paymentMethod: nfseData.invoice.paymentMethod,
                    date: nfseData.invoice.date.substring(0, 10),
                    appointmentId: appointment.id,
                    provider: nfseConfigWithSecrets.provider,
                    status: nfseConfigWithSecrets.provider === 'simplified' ? 'test' : 'sent',
                    xmlUrl: result.xmlUrl,
                    pdfUrl: result.pdfUrl,
                    rawResponse: result.rawResponse,
                });
                console.log('NFSe record saved to Firebase');
            } else {
                console.error('Erro ao emitir NFSe:', result.error);
                toast.error(`Erro ao emitir NFSe: ${result.error}`);
            }
        } catch (error) {
            console.error('Erro catastrófico na NFSe:', error);
            const err = error as { name?: string; message?: string };
            if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
                toast.error('Erro de Conexão/CORS: O navegador bloqueou a requisição para o provedor de nota fiscal. Certifique-se de que o provedor permite requisições do seu domínio ou use um proxy.');
            } else {
                toast.error(`Falha técnica na NFSe: ${err.message || 'Erro desconhecido'}`);
            }
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
        payments,
        setPayments,
        finishingAppointment,
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
