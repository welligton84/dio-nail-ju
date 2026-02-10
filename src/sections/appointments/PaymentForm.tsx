import type { PaymentMethod } from '../../types';

interface PaymentFormProps {
    paymentValue: string;
    setPaymentValue: (value: string) => void;
    paymentMethod: PaymentMethod;
    setPaymentMethod: (method: PaymentMethod) => void;
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
    loading?: boolean;
}

export function PaymentForm({
    paymentValue,
    setPaymentValue,
    paymentMethod,
    setPaymentMethod,
    onSubmit,
    onCancel,
    loading = false
}: PaymentFormProps) {
    return (
        <form onSubmit={onSubmit} className="p-6 space-y-4">
            <p className="text-gray-600">
                Confirme os dados do pagamento para finalizar.
                <br />
                <span className="text-xs text-red-500 font-bold">⚠️ Após o pagamento, o agendamento não poderá ser alterado.</span>
            </p>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
                <input
                    type="number"
                    step="0.01"
                    value={paymentValue}
                    onChange={(e) => setPaymentValue(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none text-lg font-bold text-gray-900"
                    required
                    disabled={loading}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Forma de Pagamento</label>
                <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none bg-white font-medium"
                    required
                    disabled={loading}
                >
                    <option value="pix">PIX</option>
                    <option value="cash">Dinheiro</option>
                    <option value="card">Cartão</option>
                </select>
            </div>

            <div className="flex gap-3 pt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className={`flex-1 py-3 gradient-bg text-white font-semibold rounded-xl hover:opacity-90 transition-all shadow-md flex items-center justify-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <span>{loading ? 'Processando...' : 'Confirmar Recebimento'}</span>
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-gray-600 font-medium"
                >
                    Cancelar
                </button>
            </div>
        </form>
    );
}
