import { Settings as SettingsIcon } from 'lucide-react';
import type { SystemSettings } from '../../contexts/SettingsContext';

interface SystemTabProps {
    system: SystemSettings;
    handleSystemChange: (field: string, value: string | number) => void;
}

export function SystemTab({ system, handleSystemChange }: SystemTabProps) {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="p-3 rounded-xl bg-gradient-to-br from-gray-500 to-slate-600 text-white">
                    <SettingsIcon className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Configurações do Sistema</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Opções gerais de funcionamento</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 dark:text-white">Horário de Funcionamento</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Abertura</label>
                            <input
                                type="time"
                                value={system.businessHours.start}
                                onChange={(e) => handleSystemChange('businessHours.start', e.target.value)}
                                className="input-professional"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fechamento</label>
                            <input
                                type="time"
                                value={system.businessHours.end}
                                onChange={(e) => handleSystemChange('businessHours.end', e.target.value)}
                                className="input-professional"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 dark:text-white">Agendamento</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Intervalo (min)</label>
                            <input
                                type="number"
                                value={system.appointmentInterval}
                                onChange={(e) => handleSystemChange('appointmentInterval', parseInt(e.target.value))}
                                className="input-professional"
                                min={15}
                                max={120}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mín. antecedência (dias)</label>
                            <input
                                type="number"
                                value={system.minAdvanceBooking}
                                onChange={(e) => handleSystemChange('minAdvanceBooking', parseInt(e.target.value))}
                                className="input-professional"
                                min={0}
                                max={30}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
