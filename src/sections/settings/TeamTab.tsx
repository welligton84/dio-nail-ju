import { Users, X } from 'lucide-react';
import type { TeamRole } from '../../contexts/SettingsContext';

interface TeamTabProps {
    roles: TeamRole[];
    permissionsList: { id: string, label: string }[];
    handleRoleAdd: () => void;
    handleRoleDelete: (id: string) => void;
    handleRoleUpdate: (id: string, field: keyof TeamRole, value: string | string[]) => void;
}

export function TeamTab({ roles, permissionsList, handleRoleAdd, handleRoleDelete, handleRoleUpdate }: TeamTabProps) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                        <Users className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Cargos e Permissões</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Defina funções e permissões da equipe</p>
                    </div>
                </div>
                <button onClick={handleRoleAdd} className="btn-primary flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Novo Cargo
                </button>
            </div>

            <div className="space-y-4">
                {roles.map((role) => (
                    <div
                        key={role.id}
                        className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
                    >
                        <div className="flex items-center justify-between gap-4">
                            <input
                                type="text"
                                value={role.name}
                                onChange={(e) => handleRoleUpdate(role.id, 'name', e.target.value)}
                                className="input-professional flex-1"
                                placeholder="Nome do cargo"
                            />
                            {role.id !== '1' && (
                                <button
                                    onClick={() => handleRoleDelete(role.id)}
                                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        <div className="mt-3">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Permissões
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {permissionsList.map((perm) => (
                                    <button
                                        key={perm.id}
                                        onClick={() => {
                                            const newPerms = role.permissions.includes(perm.id)
                                                ? role.permissions.filter((p: string) => p !== perm.id)
                                                : [...role.permissions, perm.id];
                                            handleRoleUpdate(role.id, 'permissions', newPerms);
                                        }}
                                        className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${role.permissions.includes('all') || role.permissions.includes(perm.id)
                                            ? 'bg-pink-100 dark:bg-pink-900/30 border-pink-300 dark:border-pink-700 text-pink-700 dark:text-pink-300'
                                            : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300'
                                            }`}
                                    >
                                        {perm.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
