

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular';
}

export function Skeleton({ className = '', variant = 'text' }: SkeletonProps) {
    const baseClasses = "animate-pulse bg-gray-200";

    const variantClasses = {
        text: "h-4 w-full rounded",
        circular: "rounded-full",
        rectangular: "rounded-2xl"
    };

    return (
        <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} />
    );
}

export function StatCardSkeleton() {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
                <Skeleton variant="rectangular" className="w-12 h-12 rounded-xl" />
            </div>
            <Skeleton className="w-24 mb-2" />
            <Skeleton className="w-32 h-8" />
        </div>
    );
}

export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
    return (
        <tr className="animate-pulse">
            {Array.from({ length: columns }).map((_, i) => (
                <td key={i} className="px-6 py-4">
                    <Skeleton className="w-[80%]" />
                </td>
            ))}
        </tr>
    );
}
