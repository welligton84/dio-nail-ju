import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface DateSelectorProps {
    selectedDate: string;
    onDateChange: (date: string) => void;
    onPrevDay: () => void;
    onNextDay: () => void;
}

export function DateSelector({ selectedDate, onDateChange, onPrevDay, onNextDay }: DateSelectorProps) {
    return (
        <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <button
                onClick={onPrevDay}
                className="p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-400 dark:text-gray-500"
            >
                <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-pink-500" />
                <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => onDateChange(e.target.value)}
                    className="text-lg font-bold text-gray-900 dark:text-white border-none focus:ring-0 cursor-pointer p-0 bg-transparent"
                />
            </div>
            <button
                onClick={onNextDay}
                className="p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-400 dark:text-gray-500"
            >
                <ChevronRight className="w-6 h-6" />
            </button>
        </div>
    );
}
