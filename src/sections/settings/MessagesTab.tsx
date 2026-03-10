import { MessageSquare } from 'lucide-react';
import type { MessageTemplates } from '../../contexts/SettingsContext';

interface MessagesTabProps {
    messages: MessageTemplates;
    handleMessageChange: (field: string, value: string) => void;
}

export function MessagesTab({ messages, handleMessageChange }: MessagesTabProps) {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                    <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Mensagens Automáticas</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Personalize as mensagens enviadas aos clientes</p>
                </div>
            </div>

            <div className="space-y-6">
                {[
                    { key: 'confirmation', label: 'Confirmação de Agendamento', desc: 'Enviada quando um novo horário é agendado' },
                    { key: 'reminder', label: 'Lembrete', desc: 'Enviada como lembrete antes do atendimento' },
                    { key: 'birthday', label: 'Aniversário', desc: 'Enviada no dia do aniversário do cliente' },
                    { key: 'thanks', label: 'Agradecimento', desc: 'Enviada após o atendimento' },
                    { key: 'cancellation', label: 'Cancelamento', desc: 'Enviada quando um agendamento é cancelado' },
                    { key: 'delay', label: 'Atraso', desc: 'Enviada quando há atraso no atendimento' }
                ].map((msg) => (
                    <div key={msg.key} className="space-y-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {msg.label}
                            </label>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{msg.desc}</p>
                        </div>
                        <textarea
                            value={messages[msg.key as keyof typeof messages]}
                            onChange={(e) => handleMessageChange(msg.key, e.target.value)}
                            rows={4}
                            className="input-professional resize-none"
                            placeholder={`Digite a mensagem de ${msg.label.toLowerCase()}...`}
                        />
                        <div className="flex gap-2 flex-wrap">
                            {['{cliente}', '{data}', '{hora}', '{servicos}', '{estabelecimento}'].map((tag) => (
                                <span
                                    key={tag}
                                    className="text-xs px-2 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
