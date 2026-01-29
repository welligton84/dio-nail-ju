import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Shield, User, Mail, CheckCircle, XCircle, Plus, X } from 'lucide-react';

export function Users() {
    const { user, addUser, changePassword } = useAuth();
    const [showAddForm, setShowAddForm] = useState(false);
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [newUserData, setNewUserData] = useState({
        name: '',
        email: '',
        role: 'employee' as 'admin' | 'employee',
        active: true,
    });
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: '',
    });

    // Demo users list - in a real app, this would be a state synchronized with the backend
    const [usersList, setUsersList] = useState(() => {
        const saved = localStorage.getItem('studio_nail_users_list');
        return saved ? JSON.parse(saved) : [
            { id: 'demo-1', name: 'Well Admin', email: 'well@well.com', role: 'admin', active: true, createdAt: '2024-01-01' },
            { id: '2', name: 'Maria Funcionária', email: 'maria@studio.com', role: 'employee', active: true, createdAt: '2024-01-15' },
        ];
    });

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        await addUser(newUserData);
        setShowAddForm(false);
        setNewUserData({ name: '', email: '', role: 'employee', active: true });
        // Refresh local list
        const saved = localStorage.getItem('studio_nail_users_list');
        if (saved) setUsersList(JSON.parse(saved));
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            alert('As senhas não coincidem!');
            return;
        }
        await changePassword(passwords.new);
        setShowPasswordForm(false);
        setPasswords({ current: '', new: '', confirm: '' });
    };

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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Usuários</h1>
                    <p className="text-gray-500 mt-1">Gerencie os usuários do sistema</p>
                </div>
                {user?.role === 'admin' && (
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 gradient-bg text-white rounded-xl hover:opacity-90 transition-all shadow-lg"
                    >
                        <Plus className="w-5 h-5" />
                        Novo Usuário
                    </button>
                )}
            </div>

            {/* Add User Modal */}
            {showAddForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-gray-900">Novo Usuário</h2>
                            <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleAddUser} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                                <input
                                    type="text"
                                    value={newUserData.name}
                                    onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-pink-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                                <input
                                    type="email"
                                    value={newUserData.email}
                                    onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-pink-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Função</label>
                                <select
                                    value={newUserData.role}
                                    onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value as 'admin' | 'employee' })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-pink-500"
                                >
                                    <option value="employee">Funcionário</option>
                                    <option value="admin">Administrador</option>
                                </select>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="submit" className="flex-1 py-3 gradient-bg text-white font-semibold rounded-xl">Cadastrar</button>
                                <button type="button" onClick={() => setShowAddForm(false)} className="px-6 py-3 border border-gray-200 rounded-xl">Cancelar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Current User Card */}
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                            <User className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">{user?.name}</h2>
                            <p className="text-white/80 flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                {user?.email}
                            </p>
                            <span className="inline-block mt-2 bg-white/20 px-3 py-1 rounded-full text-sm backdrop-blur-sm font-medium">
                                {user?.role === 'admin' ? 'Administrador' : 'Funcionário'}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowPasswordForm(true)}
                        className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-sm font-semibold transition-all backdrop-blur-sm border border-white/10"
                    >
                        Alterar Minha Senha
                    </button>
                </div>
            </div>

            {/* Change Password Modal */}
            {showPasswordForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-gray-900">Alterar Senha</h2>
                            <button onClick={() => setShowPasswordForm(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleChangePassword} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Senha Atual (Para demonstração: 123456)</label>
                                <input
                                    type="password"
                                    value={passwords.current}
                                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nova Senha</label>
                                <input
                                    type="password"
                                    value={passwords.new}
                                    onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Nova Senha</label>
                                <input
                                    type="password"
                                    value={passwords.confirm}
                                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none"
                                    required
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="submit" className="flex-1 py-3 gradient-bg text-white font-semibold rounded-xl">Alterar Senha</button>
                                <button type="button" onClick={() => setShowPasswordForm(false)} className="px-6 py-3 border border-gray-200 rounded-xl">Cancelar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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
                            {usersList.map((u: any) => (
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
