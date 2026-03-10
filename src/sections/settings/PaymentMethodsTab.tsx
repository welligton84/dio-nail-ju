import { CreditCard, X } from 'lucide-react';
import type { PaymentMethod } from '../../contexts/SettingsContext';

interface PaymentMethodsTabProps {
    paymentMethods: PaymentMethod[];
    handlePaymentMethodAdd: () => void;
    handlePaymentMethodDelete: (id: string) => void;
    handlePaymentMethodUpdate: (id: string, field: keyof PaymentMethod, value: string | boolean) => void;
}

export function PaymentMethodsTab({
    paymentMethods,
    handlePaymentMethodAdd,
    handlePaymentMethodDelete,
    handlePaymentMethodUpdate
}: PaymentMethodsTabProps) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                        <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Formas de Pagamento</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Gerencie as formas de pagamento aceitas</p>
                    </div>
                </div>
                <button onClick={handlePaymentMethodAdd} className="btn-primary flex items-center gap-2">
                    <X className="w-4 h-4" />
                    Nova Forma
                </button>
            </div>

            <div className="space-y-3">
                {paymentMethods.map((method) => (
                    <div
                        key={method.id}
                        className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
                    >
                        <input
                            type="checkbox"
                            checked={method.active}
                            onChange={(e) => handlePaymentMethodUpdate(method.id, 'active', e.target.checked)}
                            className="w-5 h-5 rounded border-gray-300 text-pink-500 focus:ring-pink-500"
                        />
                        <input
                            type="text"
                            value={method.name}
                            onChange={(e) => handlePaymentMethodUpdate(method.id, 'name', e.target.value)}
                            className="input-professional flex-1"
                            placeholder="Nome da forma de pagamento"
                        />
                        <button
                            onClick={() => handlePaymentMethodDelete(method.id)}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
                {paymentMethods.length === 0 && (
                    <p className="text-center text-gray-500 py-8">
                        Nenhuma forma de pagamento cadastrada. Clique em "Nova Forma" para adicionar.
                    </p>
                )}
            </div>
        </div>
    );
}
