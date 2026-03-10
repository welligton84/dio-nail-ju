import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    color: string;
    trend?: {
        value: string;
        positive: boolean;
    };
}

const colorMap: Record<string, { bg: string; text: string; iconBg: string }> = {
    'bg-blue-500': { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400', iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600' },
    'bg-pink-500': { bg: 'bg-pink-50 dark:bg-pink-900/20', text: 'text-pink-600 dark:text-pink-400', iconBg: 'bg-gradient-to-br from-pink-500 to-pink-600' },
    'bg-green-500': { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-600 dark:text-green-400', iconBg: 'bg-gradient-to-br from-green-500 to-green-600' },
    'bg-purple-500': { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-600 dark:text-purple-400', iconBg: 'bg-gradient-to-br from-purple-500 to-purple-600' },
    'bg-yellow-500': { bg: 'bg-yellow-50 dark:bg-yellow-900/20', text: 'text-yellow-600 dark:text-yellow-400', iconBg: 'bg-gradient-to-br from-yellow-500 to-yellow-600' },
    'bg-red-500': { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400', iconBg: 'bg-gradient-to-br from-red-500 to-red-600' },
    'bg-rose-500': { bg: 'bg-rose-50 dark:bg-rose-900/20', text: 'text-rose-600 dark:text-rose-400', iconBg: 'bg-gradient-to-br from-rose-500 to-rose-600' },
};

export function StatCard({ title, value, icon: Icon, color, trend }: StatCardProps) {
    const colorStyle = colorMap[color] || colorMap['bg-blue-500'];

    return (
        <div className="card-professional p-5 group hover-lift">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${colorStyle.iconBg} text-white shadow-md group-hover:shadow-lg transition-shadow`}>
                    <Icon className="w-5 h-5" />
                </div>
                {trend && (
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        trend.positive 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                        {trend.value}
                    </span>
                )}
            </div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
    );
}
