import React from 'react';

interface Column<T> {
    header: string;
    accessor: keyof T | ((item: T) => React.ReactNode);
    className?: string;
}

interface TableProps<T> {
    data: T[];
    columns: Column<T>[];
    onRowClick?: (item: T) => void;
    emptyMessage?: string;
    footer?: React.ReactNode;
}

export function Table<T>({ data, columns, onRowClick, emptyMessage = 'Nenhum registro encontrado', footer }: TableProps<T>) {
    if (data.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                <p className="text-gray-500">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            {columns.map((column, index) => (
                                <th
                                    key={index}
                                    className={`px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider ${column.className || ''}`}
                                >
                                    {column.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {data.map((item, rowIndex) => (
                            <tr
                                key={rowIndex}
                                onClick={() => onRowClick?.(item)}
                                className={`${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''} transition-colors`}
                            >
                                {columns.map((column, colIndex) => (
                                    <td key={colIndex} className={`px-6 py-4 ${column.className || ''}`}>
                                        {typeof column.accessor === 'function'
                                            ? column.accessor(item)
                                            : (item[column.accessor] as React.ReactNode)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                    {footer && (
                        <tfoot className="bg-gray-50 border-t border-gray-100 font-bold">
                            {footer}
                        </tfoot>
                    )}
                </table>
            </div>
        </div>
    );
}
