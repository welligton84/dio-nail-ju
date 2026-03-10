import { useId } from 'react';
import { Phone } from 'lucide-react';

interface PhoneInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    required?: boolean;
    className?: string;
}

export function PhoneInput({ value, onChange, placeholder = '(00) 00000-0000', required = false, className = '' }: PhoneInputProps) {
    const id = useId();

    const formatPhone = (input: string): string => {
        const digits = input.replace(/\D/g, '');
        
        if (digits.length === 0) return '';
        if (digits.length <= 2) return `(${digits}`;
        if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatPhone(e.target.value);
        onChange(formatted);
    };

    return (
        <div className={className}>
            <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    type="tel"
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
