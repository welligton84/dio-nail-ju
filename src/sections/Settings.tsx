import { useState, useEffect, useRef } from 'react';
import { useSettings } from '../contexts/useSettings';
import {
    Building2,
    FileText,
    MessageSquare,
    Users,
    Save,
    Settings as SettingsIcon,
    Loader2,
    CreditCard
} from 'lucide-react';
import { toast } from 'sonner';
import { formatPhone, formatCEP, formatCPF, formatCNPJ } from '../utils/format';
import { fetchAddressByCEP } from '../utils/viacep';
import { isFirebaseConfigured } from '../lib/firebase';

// Modular Components
import { CompanyTab } from './settings/CompanyTab';
import { NFSeTab } from './settings/NFSeTab';
import { MessagesTab } from './settings/MessagesTab';
import { TeamTab } from './settings/TeamTab';
import { PaymentMethodsTab } from './settings/PaymentMethodsTab';
import { SystemTab } from './settings/SystemTab';

type SettingsTab = 'company' | 'nfse' | 'messages' | 'team' | 'payment' | 'system';

const tabs = [
    { id: 'company', label: 'Empresa', icon: Building2 },
    { id: 'nfse', label: 'NFSe', icon: FileText },
    { id: 'messages', label: 'Mensagens', icon: MessageSquare },
    { id: 'team', label: 'Equipe', icon: Users },
    { id: 'payment', label: 'Pagamentos', icon: CreditCard },
    { id: 'system', label: 'Sistema', icon: SettingsIcon },
];

const permissionsList = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'clients', label: 'Clientes' },
    { id: 'appointments', label: 'Agendamentos' },
    { id: 'services', label: 'Serviços' },
    { id: 'finance', label: 'Financeiro' },
    { id: 'nfse', label: 'Notas Fiscais' },
    { id: 'reports', label: 'Relatórios' },
    { id: 'staff', label: 'Equipe' },
    { id: 'settings', label: 'Configurações' },
];

export function Settings() {
    const {
        company, nfse, messages, roles, paymentMethods, system, loading,
        updateCompany, updateNFSe, updateMessages, updateRoles, updatePaymentMethods, updateSystem, saveSettings
    } = useSettings();

    const [activeTab, setActiveTab] = useState<SettingsTab>('company');
    const [cepLoading, setCepLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    const firebaseConfigured = isFirebaseConfigured();
    const lastFetchedCEP = useRef('');

    // Initialize ref with existing CEP to avoid re-fetching on mount
    useEffect(() => {
        const existingCEP = company.zipCode?.replace(/\D/g, '') || '';
        if (existingCEP.length === 8 && company.address) {
            lastFetchedCEP.current = existingCEP;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // CEP lookup effect
    useEffect(() => {
        const cleanCEP = company.zipCode?.replace(/\D/g, '') || '';

        if (cleanCEP.length === 8 && cleanCEP !== lastFetchedCEP.current) {
            const lookupCEP = async () => {
                setCepLoading(true);
                try {
                    const data = await fetchAddressByCEP(cleanCEP);
                    if (data && data.logradouro) {
                        updateCompany({
                            address: data.logradouro,
                            neighborhood: data.bairro,
                            city: data.localidade,
                            state: data.uf
                        });
                        lastFetchedCEP.current = cleanCEP;
                        toast.success('Endereço preenchido automaticamente.');
                    }
                } catch {
                    toast.error('Erro ao buscar o CEP.');
                } finally {
                    setCepLoading(false);
                }
            };
            lookupCEP();
        } else if (cleanCEP.length < 8 && lastFetchedCEP.current !== '') {
            lastFetchedCEP.current = '';
        }
    }, [company.zipCode, updateCompany]);

    const handleCompanyChange = (field: string, value: string) => {
        let formattedValue = value;
        if (field === 'phone') formattedValue = formatPhone(value);
        if (field === 'zipCode') formattedValue = formatCEP(value);
        if (field === 'cpf') formattedValue = formatCPF(value);
        if (field === 'cnpj') formattedValue = formatCNPJ(value);

        updateCompany({ [field]: formattedValue });
        setHasChanges(true);
    };

    const handleNFSeChange = (field: string, value: string | boolean | null) => {
        updateNFSe({ [field]: value });
        setHasChanges(true);
    };

    const handleCertificateUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const allowedExtensions = ['.pfx', '.p12'];
        const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

        if (!allowedExtensions.includes(extension)) {
            toast.error('Arquivo deve ser .pfx ou .p12');
            return;
        }

        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            toast.error('Arquivo deve ter menos de 10MB');
            return;
        }

        try {
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result as string;
                const base64Data = base64.split(',')[1];
                updateNFSe({
                    certificate: base64Data,
                    certificateName: file.name
                });
                setHasChanges(true);
                toast.success('Certificado carregado com sucesso!');
            };
            reader.onerror = () => {
                toast.error('Erro ao ler arquivo');
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Erro ao processar certificado:', error);
            toast.error('Erro ao processar certificado');
        }
    };

    const handleRemoveCertificate = () => {
        updateNFSe({ certificate: null, certificateName: null });
        setHasChanges(true);
        toast.success('Certificado removido');
    };

    const handleMessageChange = (field: string, value: string) => {
        updateMessages({ [field]: value });
        setHasChanges(true);
    };

    const handleRoleAdd = () => {
        const newRole = { id: Date.now().toString(), name: 'Nova Função', permissions: [] };
        updateRoles([...roles, newRole]);
        setHasChanges(true);
    };

    const handleRoleDelete = (id: string) => {
        updateRoles(roles.filter(r => r.id !== id));
        setHasChanges(true);
    };

    const handleRoleUpdate = (id: string, field: string, value: string | string[]) => {
        updateRoles(roles.map(r => r.id === id ? { ...r, [field]: value } : r));
        setHasChanges(true);
    };

    const handlePaymentMethodAdd = () => {
        const newMethod = { id: Date.now().toString(), name: 'Nova Forma de Pagamento', active: true };
        updatePaymentMethods([...paymentMethods, newMethod]);
        setHasChanges(true);
    };

    const handlePaymentMethodDelete = (id: string) => {
        updatePaymentMethods(paymentMethods.filter(p => p.id !== id));
        setHasChanges(true);
    };

    const handlePaymentMethodUpdate = (id: string, field: string, value: string | boolean) => {
        updatePaymentMethods(paymentMethods.map(p => p.id === id ? { ...p, [field]: value } : p));
        setHasChanges(true);
    };

    const handleSystemChange = (field: string, value: string | number) => {
        if (field === 'businessHours.start') {
            updateSystem({ businessHours: { ...system.businessHours, start: String(value) } });
        } else if (field === 'businessHours.end') {
            updateSystem({ businessHours: { ...system.businessHours, end: String(value) } });
        } else {
            updateSystem({ [field]: value });
        }
        setHasChanges(true);
    };

    const handleSave = async () => {
        if (!firebaseConfigured) {
            toast.error('Firebase não está configurado. Configure o arquivo .env primeiro.');
            return;
        }

        setSaving(true);
        try {
            await saveSettings();
            toast.success('Configurações salvas com sucesso!');
            setHasChanges(false);
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error(`Erro ao salvar configurações: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Configurações</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        {firebaseConfigured ? 'Gerencie as configurações do sistema' : 'Configure o Firebase para salvar'}
                    </p>
                </div>
                {hasChanges && (
                    <button
                        onClick={handleSave}
                        disabled={saving || !firebaseConfigured}
                        className="btn-primary flex items-center gap-2 disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Salvar Alterações
                    </button>
                )}
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="border-b border-gray-200 dark:border-gray-800 overflow-x-auto">
                    <div className="flex min-w-full">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as SettingsTab)}
                                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${activeTab === tab.id
                                    ? 'border-pink-500 text-pink-600 dark:text-pink-400'
                                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-6">
                    {activeTab === 'company' && (
                        <CompanyTab
                            company={company}
                            handleCompanyChange={handleCompanyChange}
                            cepLoading={cepLoading}
                        />
                    )}

                    {activeTab === 'nfse' && (
                        <NFSeTab
                            nfse={nfse}
                            handleNFSeChange={handleNFSeChange}
                            handleCertificateUpload={handleCertificateUpload}
                            handleRemoveCertificate={handleRemoveCertificate}
                        />
                    )}

                    {activeTab === 'messages' && (
                        <MessagesTab
                            messages={messages}
                            handleMessageChange={handleMessageChange}
                        />
                    )}

                    {activeTab === 'team' && (
                        <TeamTab
                            roles={roles}
                            permissionsList={permissionsList}
                            handleRoleAdd={handleRoleAdd}
                            handleRoleDelete={handleRoleDelete}
                            handleRoleUpdate={handleRoleUpdate}
                        />
                    )}

                    {activeTab === 'payment' && (
                        <PaymentMethodsTab
                            paymentMethods={paymentMethods}
                            handlePaymentMethodAdd={handlePaymentMethodAdd}
                            handlePaymentMethodDelete={handlePaymentMethodDelete}
                            handlePaymentMethodUpdate={handlePaymentMethodUpdate}
                        />
                    )}

                    {activeTab === 'system' && (
                        <SystemTab
                            system={system}
                            handleSystemChange={handleSystemChange}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

