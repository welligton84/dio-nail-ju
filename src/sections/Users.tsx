import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Shield, User, Mail, CheckCircle, XCircle } from 'lucide-react';

export function Users() {
    const { user } = useAuth();

    // Demo users list (in real app, this would come from Firebase)
    const [users] = useState([
        {
            id: '1',
            name: 'Well Admin',
            email: 'well@well.com',
            role: 'admin',
            active: true,
            createdAt: '2024-01-01',
        },
        {
            id: '2',
            name: 'Maria Funcionária',
            email: 'maria@studio.com',
            role: 'employee',
            active: true,
            createdAt: '2024-01-15',
        },
    ]);

    const getRoleBadge = (role: string) => {
        if (role === 'admin') {
            return (
                <span className="flex items-center gap-1 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-medium">
                    <Shield className="w-3 h-3" />
                    Administrador
                </span>
            );
        }
        return (
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                Funcionário
            </span>
        );
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('pt-BR');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Usuários</h1>
                <p className="text-gray-500 mt-1">Gerencie os usuários do sistema</p>
            </div>

            {/* Current User Card */}
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl p-6 text-white">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                        <User className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">{user?.name}</h2>
                        <p className="text-white/80 flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            {user?.email}
                        </p>
                        <span className="inline-block mt-2 bg-white/20 px-3 py-1 rounded-full text-sm">
                            {user?.role === 'admin' ? 'Administrador' : 'Funcionário'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Users List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">Todos os Usuários</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Usuário</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">E-mail</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Função</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Criado em</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {users.map((u) => (
                                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center text-pink-500">
                                                <User className="w-5 h-5" />
                                            </div>
                                            <span className="font-medium text-gray-900">{u.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{u.email}</td>
                                    <td className="px-6 py-4">{getRoleBadge(u.role)}</td>
                                    <td className="px-6 py-4">
                                        {u.active ? (
                                            <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                                                <CheckCircle className="w-4 h-4" />
                                                Ativo
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-red-600 text-sm font-medium">
                                                <XCircle className="w-4 h-4" />
                                                Inativo
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{formatDate(u.createdAt)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Info Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                    <div className="bg-blue-100 rounded-lg p-2">
                        <Shield className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="font-medium text-blue-900">Informação</h3>
                        <p className="text-sm text-blue-700 mt-1">
                            Esta é uma versão demo. Para adicionar mais usuários e gerenciar permissões,
                            configure o Firebase Authentication no projeto.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
