import { TrendingUp } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';
import type { Service } from '../../types';

interface ServiceListWidgetProps {
    services: Service[];
}

export function ServiceListWidget({ services }: ServiceListWidgetProps) {
    return (
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 h-full">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" aria-hidden="true" />
                    Serviços Ativos
                </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" role="list">
                {services.filter(s => s.active).slice(0, 6).map((service) => (
                    <div role="listitem" key={service.id} className="flex items-center justify-between p-3 border border-gray-50 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: service.color }} aria-hidden="true" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{service.name}</span>
                        </div>
                        <span className="text-sm font-bold text-gray-900 dark:text-white" aria-label={`Preço: ${formatCurrency(service.price)}`}>{formatCurrency(service.price)}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
