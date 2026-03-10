import { useId } from 'react';

interface CurrencyInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    required?: boolean;
    className?: string;
}

export function CurrencyInput({ value, onChange, placeholder = '0,00', required = false, className = '' }: CurrencyInputProps) {
    const id = useId();

    const formatCurrency = (input: string): string => {
        const digits = input.replace(/[^\d]/g, '');
        
        if (digits === '') return '';
        
        const cents = parseInt(digits) / 100;
        return cents.toFixed(2).replace('.', ',');
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatCurrency(e.target.value);
        onChange(formatted);
    };

    return (
        <div className={className}>
            <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">R$</span>
                <input
                    type="text"
                    id={id}
                    value={value}
                    onChange={handleChange}
                    placeholder={placeholder}
                    required={required}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all dark:bg-gray-700 dark:text-white"
                />
            </div>
        </div>
    );
}
