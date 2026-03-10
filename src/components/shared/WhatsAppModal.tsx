import { useState, useEffect, useMemo } from 'react';
import { Modal } from './Modal';
import { Monitor, Smartphone, Copy, Check } from 'lucide-react';
import type { Appointment } from '../../types';
import { formatDateToBR } from '../../utils/date';
import { useSettings } from '../../contexts/SettingsContext';
import { formatPhone } from '../../utils/format';

interface WhatsAppModalProps {
    isOpen: boolean;
    onClose: () => void;
    appointment: Appointment | null;
    clientPhone?: string;
    clientName?: string;
    isBirthday?: boolean;
}

type TemplateType = 'confirmation' | 'reminder' | 'delay' | 'thanks' | 'custom' | 'birthday';

export function WhatsAppModal({ isOpen, onClose, appointment, clientPhone, clientName, isBirthday }: WhatsAppModalProps) {
    const [message, setMessage] = useState('');
    const [template, setTemplate] = useState<TemplateType>('custom');
    const [copied, setCopied] = useState(false);
    const { messages, company } = useSettings();

    const replaceVariables = (text: string, appt?: Appointment | null, name?: string): string => {
        let result = text;
        
        const client = name || appt?.clientName || 'Cliente';
        result = result.replace(/{cliente}/g, client);
        
        if (appt) {
            result = result.replace(/{data}/g, formatDateToBR(appt.date));
            result = result.replace(/{hora}/g, appt.time);
            result = result.replace(/{servicos}/g, appt.services.map(s => s.name).join(', '));
        }
        
        result = result.replace(/{estabelecimento}/g, company.name || 'Juliana Miranda Concept');
        
        return result;
    };

    const getTemplateMessage = (type: TemplateType) => {
        if (!appointment && type === 'custom') return '';
        if (!appointment && type !== 'custom') return '';

        if (appointment) {
            switch (type) {
                case 'confirmation':
                    return replaceVariables(messages.confirmation, appointment);
                case 'reminder':
                    return replaceVariables(messages.reminder, appointment);
                case 'delay':
                    return replaceVariables(messages.delay, appointment);
                case 'thanks':
                    return replaceVariables(messages.thanks, appointment);
                case 'birthday':
                    return replaceVariables(messages.birthday, appointment);
                case 'custom':
                    return message;
                default:
                    return '';
            }
        } else if (clientName && type === 'birthday') {
            return replaceVariables(messages.birthday, null, clientName);
        }
        return '';
    };

    const generateMessage = (type: TemplateType) => {
        const text = getTemplateMessage(type);

        if (!appointment && type === 'custom') {
            setMessage('');
            setTemplate('custom');
            return;
        }

        if (!appointment) {
            if (type !== 'birthday' || !clientName) {
                return;
            }
        }

        setTemplate(type);

        if (type !== 'custom') {
            setMessage(text);
        }
    };

    // Calculate initial message and template based on props
    const initialMessageData = useMemo(() => {
        const replaceVars = (text: string, appt?: Appointment | null, name?: string): string => {
            let result = text;
            const client = name || appt?.clientName || 'Cliente';
            result = result.replace(/{cliente}/g, client);
            if (appt) {
                result = result.replace(/{data}/g, formatDateToBR(appt.date));
                result = result.replace(/{hora}/g, appt.time);
                result = result.replace(/{servicos}/g, appt.services.map(s => s.name).join(', '));
            }
            result = result.replace(/{estabelecimento}/g, company.name || 'Juliana Miranda Concept');
            return result;
        };

        if (isBirthday && clientName) {
            return {
                message: replaceVars(messages.birthday, null, clientName),
                template: 'birthday' as TemplateType
            };
        }
        if (appointment && clientPhone) {
            return {
                message: replaceVars(messages.confirmation, appointment),
                template: 'confirmation' as TemplateType
            };
        }
        if (clientPhone) {
            return {
                message: 'Olá! Gostaria de falar com você sobre...',
                template: 'custom' as TemplateType
            };
        }
        return {
            message: '',
            template: 'custom' as TemplateType
        };
    }, [isBirthday, clientName, appointment, clientPhone, messages, company]);

    // Reset message when modal opens with new data
    useEffect(() => {
        if (!isOpen) return;
        
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMessage(initialMessageData.message);
        setTemplate(initialMessageData.template);
    }, [isOpen, initialMessageData]);

    const handleSend = (platform: 'web' | 'desktop') => {
        if (!clientPhone) return;

        const sanitizedPhone = clientPhone.replace(/\D/g, '');
        const finalPhone = sanitizedPhone.length === 11 || sanitizedPhone.length === 10
            ? `55${sanitizedPhone}`
            : sanitizedPhone;

        const encodedMessage = encodeURIComponent(message);

        let url = '';
        if (platform === 'desktop') {
            url = `whatsapp://send?phone=${finalPhone}&text=${encodedMessage}`;
        } else {
            url = `https://web.whatsapp.com/send?phone=${finalPhone}&text=${encodedMessage}`;
        }

        window.open(url, '_blank');
        onClose();
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(message);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Enviar WhatsApp">
            <div className="p-6 space-y-6">

                {/* Template Selector - Only show if appointment exists */}
                {appointment && (
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Escolha o Modelo</label>
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            <button
                                onClick={() => generateMessage('confirmation')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${template === 'confirmation' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            >
                                Confirmação
                            </button>
                            <button
                                onClick={() => generateMessage('reminder')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${template === 'reminder' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            >
                                Lembrete Hoje
                            </button>
                            <button
                                onClick={() => generateMessage('delay')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${template === 'delay' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            >
                                Aviso Atraso
                            </button>
                            <button
                                onClick={() => generateMessage('thanks')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${template === 'thanks' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            >
                                Agradecimento
                            </button>
                        </div>
                    </div>
                )}

                {/* Message Editor */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Mensagem</label>
                        <button
                            onClick={copyToClipboard}
                            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        >
                            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            {copied ? 'Copiado!' : 'Copiar'}
                        </button>
                    </div>
                    <textarea
                        value={message}
                        onChange={(e) => {
                            setMessage(e.target.value);
                            setTemplate('custom');
                        }}
                        rows={6}
                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 dark:text-white resize-none"
                        placeholder="Digite sua mensagem..."
                    />
                    <div className="flex gap-2 flex-wrap">
                        <span className="text-xs text-gray-400">Variáveis:</span>
                        <span className="text-xs px-2 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded">{'{cliente}'}</span>
                        <span className="text-xs px-2 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded">{'{data}'}</span>
                        <span className="text-xs px-2 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded">{'{hora}'}</span>
                        <span className="text-xs px-2 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded">{'{servicos}'}</span>
                        <span className="text-xs px-2 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded">{'{estabelecimento}'}</span>
                    </div>
                </div>

                {/* Phone Display */}
                {clientPhone && (
                    <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Enviar para:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{formatPhone(clientPhone)}</span>
                    </div>
                )}

                {/* Send Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={() => handleSend('web')}
                        disabled={!clientPhone}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Monitor className="w-5 h-5" />
                        WhatsApp Web
                    </button>
                    <button
                        onClick={() => handleSend('desktop')}
                        disabled={!clientPhone}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Smartphone className="w-5 h-5" />
                        App
                    </button>
                </div>
            </div>
        </Modal>
    );
}
