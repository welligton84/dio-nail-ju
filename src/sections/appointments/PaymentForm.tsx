import { useSettings } from '../../contexts/useSettings';
import type { PaymentMethod } from '../../types';
import { Plus, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

export interface AppointmentPayment {
    id: string;
    value: string;
    method: PaymentMethod;
}

interface PaymentFormProps {
    payments: AppointmentPayment[];
    setPayments: (payments: AppointmentPayment[]) => void;
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
    loading?: boolean;
    totalExpectedValue?: number;
}

export function PaymentForm({
    payments,
    setPayments,
    onSubmit,
    onCancel,
    loading = false,
    totalExpectedValue = 0
}: PaymentFormProps) {
    const { paymentMethods } = useSettings();
    const activePaymentMethods = paymentMethods.filter(p => p.active);

    const handleAddPayment = () => {
        setPayments([...payments, { id: crypto.randomUUID(), value: '', method: 'pix' }]);
    };

    const handleRemovePayment = (index: number) => {
        if (payments.length > 1) {
            setPayments(payments.filter((_, i) => i !== index));
        }
    };

    const updatePayment = (index: number, field: keyof AppointmentPayment, value: string) => {
        const newPayments = [...payments];
        newPayments[index] = { ...newPayments[index], [field]: value };
        setPayments(newPayments);
    };

    const totalCurrentPayment = payments.reduce((sum, p) => sum + (parseFloat(p.value) || 0), 0);
    const difference = totalExpectedValue - totalCurrentPayment;

    return (
        <form onSubmit={onSubmit} className="p-6 space-y-4">
            <div className="flex justify-between items-start">
                <p className="text-gray-600 dark:text-gray-300">
                    Confirme os dados do pagamento para finalizar.
                    <br />
                    <span className="text-xs text-red-500 font-bold">⚠️ Após o pagamento, o agendamento não poderá ser alterado.</span>
                </p>
                <div className="text-right">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total do Agendamento</p>
                    <p className="font-bold text-gray-900 dark:text-white">{formatCurrency(totalExpectedValue)}</p>
                </div>
            </div>

            <div className="space-y-3">
                {payments.map((payment, index) => (
                    <div key={payment.id} className="flex gap-3 items-end p-3 bg-gray-50 dark:bg-gray-800 rounded-xl relative">
                        <div className="flex-1">
                            <label htmlFor={`payment-value-${payment.id}`} className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Valor (R$)
                            </label>
                            <input
                                id={`payment-value-${payment.id}`}
                                type="number"
                                inputMode="decimal"
                                step="0.01"
                                value={payment.value}
                                onChange={(e) => updatePayment(index, 'value', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none font-medium text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                                required
                                disabled={loading}
                                placeholder="0.00"
                            />
                        </div>
                        <div className="flex-1">
                            <label htmlFor={`payment-method-${payment.id}`} className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Forma de Pagamento
                            </label>
                            <select
                                id={`payment-method-${payment.id}`}
                                value={payment.method}
                                onChange={(e) => updatePayment(index, 'method', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 font-medium text-gray-900 dark:text-white"
                                required
                                disabled={loading}
                            >
                                {activePaymentMethods.map((method) => (
                                    <option key={method.id} value={method.name.toLowerCase()}>
                                        {method.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {payments.length > 1 && (
                            <button
                                type="button"
                                onClick={() => handleRemovePayment(index)}
                                disabled={loading}
                                aria-label={`Remover forma de pagamento ${index + 1}`}
                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                ))}
            </div>

            <div className="flex justify-between items-center pt-2">
                <button
                    type="button"
                    onClick={handleAddPayment}
                    disabled={loading}
                    className="text-sm font-medium text-pink-600 dark:text-pink-400 hover:text-pink-700 flex items-center gap-1"
                >
                    <Plus className="w-4 h-4" />
                    Adicionar Forma de Pagamento
                </button>

                <div className="text-right">
                    <p className="text-xs text-gray-500">Total Informado</p>
                    <p className={`font-bold ${Math.abs(difference) < 0.01 ? 'text-green-600 dark:text-green-400' : 'text-orange-500'}`}>
                        {formatCurrency(totalCurrentPayment)}
                    </p>
                </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                    type="submit"
                    disabled={loading || payments.some(p => !p.value || parseFloat(p.value) <= 0)}
                    className={`flex-1 py-3 gradient-bg text-white font-semibold rounded-xl hover:opacity-90 transition-all shadow-md flex items-center justify-center gap-2 ${(loading || payments.some(p => !p.value || parseFloat(p.value) <= 0)) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <span>{loading ? 'Processando...' : 'Confirmar Recebimento'}</span>
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-3 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-gray-600 dark:text-gray-300 font-medium"
                >
                    Cancelar
                </button>
            </div>
        </form>
    );
}
