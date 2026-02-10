import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Monitor, Smartphone, Copy, Check } from 'lucide-react';
import { getBirthdayMessage } from '../../utils/birthday';
import type { Appointment } from '../../types';
import { formatDateToBR } from '../../utils/date';

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

    const getTemplateMessage = (type: TemplateType) => {
        if (!appointment && type === 'custom') return '';
        if (!appointment && type !== 'custom') return '';

        if (appointment) {
            const date = formatDateToBR(appointment.date);
            const time = appointment.time;
            const apptClientName = appointment.clientName;
            const services = appointment.services.map(s => s.name).join(', ');

            switch (type) {
                case 'confirmation':
                    return `Olá ${apptClientName}! ✨\nPassando para confirmar seu agendamento para *${date} às ${time}*.\nServiços: ${services}.\n\nPodemos confirmar? 💅`;
                case 'reminder':
                    return `Oie ${apptClientName}! ⏰\nLembrete do seu horário hoje às *${time}* no Juliana Miranda Concept.\nEstamos te esperando! ✨`;
                case 'delay':
                    return `Oi ${apptClientName}, tudo bem? 🙏\nTivemos um pequeno atraso aqui no Studio. Poderia vir 15 minutinhos mais tarde?\nDesculpe o transtorno!`;
                case 'thanks':
                    return `Obrigada pela visita, ${apptClientName}! 💖\nFoi um prazer te atender. Se puder, nos marque na foto das unhas! 📸\nAté a próxima!`;
                case 'birthday':
                    return getBirthdayMessage(apptClientName);
                case 'custom':
                    return message;
                default:
                    return '';
            }
        } else if (clientName && type === 'birthday') {
            return getBirthdayMessage(clientName);
        }
        return '';
    };

    const generateMessage = (type: TemplateType) => {
        const text = getTemplateMessage(type);

        // Special case: Clear message for custom type if no appointment
        if (!appointment && type === 'custom') {
            setMessage('');
            setTemplate('custom');
            return;
        }

        // If no appointment, only allow 'custom' or 'birthday' (if clientName exists)
        if (!appointment) {
            if (type !== 'birthday' || !clientName) {
                return;
            }
        }

        setTemplate(type);

        // For all non-custom types (including birthday), set the generated message
        if (type !== 'custom') {
            setMessage(text);
        }
    };

    // Corrected useEffect
    useEffect(() => {
        if (isOpen) {
            if (isBirthday && clientName) {
                const text = getBirthdayMessage(clientName);
                setMessage(text);
                setTemplate('birthday');
            } else if (appointment && clientPhone) {
                // Use helper to avoid dependency on 'message' state
                // We recreate the logic for 'confirmation' specifically
                if (appointment) { // Redundant check for TS but safe
                    const date = formatDateToBR(appointment.date);
                    const time = appointment.time;
                    const cName = appointment.clientName;
                    const services = appointment.services.map(s => s.name).join(', ');
                    const text = `Olá ${cName}! ✨\nPassando para confirmar seu agendamento para *${date} às ${time}*.\nServiços: ${services}.\n\nPodemos confirmar? 💅`;
                    setMessage(text);
                    setTemplate('confirmation');
                }
            } else if (clientPhone) {
                setTemplate('custom');
                setMessage(`Olá! Gostaria de falar com você sobre...`);
            }
        }
    }, [appointment, clientPhone, clientName, isBirthday, isOpen]);

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
                        <label className="text-sm font-bold text-gray-700">Escolha o Modelo</label>
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
                        <label className="text-sm font-bold text-gray-700">Mensagem</label>
                        <button
                            onClick={copyToClipboard}
                            className="text-xs flex items-center gap-1 text-gray-500 hover:text-green-600 transition-colors"
                        >
                            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            {copied ? 'Copiado!' : 'Copiar texto'}
                        </button>
                    </div>
                    <textarea
                        value={message}
                        onChange={(e) => {
                            setMessage(e.target.value);
                            setTemplate('custom');
                        }}
                        className="w-full h-32 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none text-sm leading-relaxed"
                        placeholder="Digite sua mensagem..."
                    />
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                        onClick={() => handleSend('web')}
                        className="flex flex-col items-center justify-center gap-2 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all group"
                    >
                        <Smartphone className="w-6 h-6 text-gray-400 group-hover:text-green-600 transition-colors" />
                        <span className="font-bold text-gray-600 group-hover:text-gray-900">WhatsApp Web</span>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider">Navegador</span>
                    </button>

                    <button
                        onClick={() => handleSend('desktop')}
                        className="flex flex-col items-center justify-center gap-2 p-4 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 hover:border-green-300 transition-all group"
                    >
                        <Monitor className="w-6 h-6 text-green-600 group-hover:scale-110 transition-transform" />
                        <span className="font-bold text-green-800">App Desktop</span>
                        <span className="text-[10px] text-green-600 uppercase tracking-wider">Instalado</span>
                    </button>
                </div>
            </div>
        </Modal>
    );
}
