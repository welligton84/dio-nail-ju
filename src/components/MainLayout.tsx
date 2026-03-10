import { useState, useMemo, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';
import { useTheme } from '../contexts/useTheme';
import { useSettings } from '../contexts/useSettings';
import { isAdmin as checkIsAdmin } from '../utils/rbac';
import {
    LayoutDashboard,
    Users,
    Calendar,
    Scissors,
    DollarSign,
    FileText,
    BarChart3,
    UserCog,
    LogOut,
    Menu,
    Award,
    Sun,
    Moon,
    X,
    Sparkles,
    Settings
} from 'lucide-react';
import { InstallPrompt } from './shared/InstallPrompt';

const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, permission: 'dashboard' },
    { id: 'clients', label: 'Clientes', icon: Users, permission: 'clients' },
    { id: 'appointments', label: 'Agendamentos', icon: Calendar, permission: 'appointments' },
    { id: 'services', label: 'Serviços', icon: Scissors, permission: 'services' },
    { id: 'finance', label: 'Financeiro', icon: DollarSign, permission: 'finance' },
    { id: 'nfse', label: 'Notas Fiscais', icon: FileText, permission: 'nfse' },
    { id: 'reports', label: 'Relatórios', icon: BarChart3, permission: 'reports' },
    { id: 'staff', label: 'Profissionais', icon: Award, permission: 'staff' },
    { id: 'users', label: 'Usuários', icon: UserCog, permission: 'users' },
    { id: 'settings', label: 'Configurações', icon: Settings, permission: 'settings' },
];

export function MainLayout() {
    const { logout, user } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { roles } = useSettings();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const currentView = location.pathname.split('/')[1] || 'dashboard';
    const currentMenuItem = menuItems.find(item => item.id === currentView);

    // Filter menu items based on user permissions
    const filteredMenuItems = useMemo(() => {
        if (!user) return [];
        
        if (checkIsAdmin(user)) return menuItems;

        // Find user's role in settings (case insensitive)
        const userRole = roles.find(r => 
            r.name.toLowerCase() === user.role?.toLowerCase() ||
            r.name.toLowerCase() === 'manicure' && user.role?.toLowerCase().includes('manicure')
        );
        
        // If no matching role found, only allow dashboard
        if (!userRole) {
            return menuItems.filter(item => item.permission === 'dashboard');
        }

        // Filter based on permissions (include 'all' or specific permission)
        return menuItems.filter(item => {
            return userRole.permissions.includes('all') || userRole.permissions.includes(item.permission);
        });
    }, [user, roles]);

    // Check if user can access current page
    const canAccessPage = useMemo(() => {
        if (!user) return false;
        
        if (checkIsAdmin(user)) return true;

        // Find user's role in settings (case insensitive)
        const userRole = roles.find(r => r.name.toLowerCase() === user.role?.toLowerCase());
        
        // If no matching role found, deny access to everything except dashboard
        if (!userRole) {
            return currentView === 'dashboard';
        }

        // Check if user has permission for this page
        const hasPermission = userRole.permissions.includes('all') || userRole.permissions.includes(currentView);
        return hasPermission;
    }, [user, roles, currentView]);

    // Get first allowed page for redirect - Force employees to appointments
    const firstAllowedPage = useMemo(() => {
        if (!user) return '/login';
        
        if (checkIsAdmin(user)) return '/dashboard';

        // All non-admin users go to appointments by default
        return '/appointments';
    }, [user]);

    // Redirect if no access - useEffect for proper navigation
    useEffect(() => {
        const userIsAdmin = checkIsAdmin(user);
        
        // If not admin and trying to access dashboard, redirect to appointments
        if (!userIsAdmin && currentView === 'dashboard') {
            navigate('/appointments');
            return;
        }
        
        // Redirect to first allowed page if no access
        if (!canAccessPage) {
            navigate(firstAllowedPage);
        }
    }, [canAccessPage, currentView, navigate, firstAllowedPage, user]);

    return (
        <div className="min-h-screen bg-[var(--background)] flex">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <InstallPrompt />

            {/* Sidebar */}
            <aside className={`
                fixed lg:static inset-y-0 left-0 z-50
                w-72 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl 
                border-r border-gray-200/50 dark:border-gray-700/50
                flex flex-col
                transform transition-transform duration-300 ease-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                {/* Logo */}
                <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 gradient-bg rounded-2xl flex items-center justify-center shadow-lg shadow-pink-500/20">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h1 className="font-bold text-lg text-gray-900 dark:text-white truncate">Juliana Miranda</h1>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Concept Studio</p>
                        </div>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
                    {filteredMenuItems.map((item, index) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                navigate(`/${item.id}`);
                                setSidebarOpen(false);
                            }}
                            className={`
                                w-full flex items-center gap-3 px-4 py-3.5 rounded-xl 
                                text-left transition-all duration-200 group
                                animate-fade-in stagger-${index + 1}
                                ${currentView === item.id
                                    ? 'bg-gradient-to-r from-pink-500/10 to-purple-500/10 text-pink-700 dark:text-pink-400 font-medium shadow-sm'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50'
                                }
                            `}
                        >
                            <div className={`
                                p-2 rounded-lg transition-all duration-200
                                ${currentView === item.id
                                    ? 'bg-gradient-to-br from-pink-500 to-purple-600 text-white shadow-md'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 group-hover:bg-pink-100 dark:group-hover:bg-pink-900/30 group-hover:text-pink-600 dark:group-hover:text-pink-400'
                                }
                            `}>
                                <item.icon className="w-4 h-4" />
                            </div>
                            <span className="flex-1">{item.label}</span>
                            {currentView === item.id && (
                                <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600" />
                            )}
                        </button>
                    ))}
                </nav>

                {/* User & Logout */}
                <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50 space-y-3">
                    {/* User Card */}
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-purple-50 dark:from-gray-800/50 dark:to-purple-900/20 border border-gray-200/50 dark:border-gray-700/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center text-white font-bold shadow-md">
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                                    {user?.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    {user?.role === 'admin' ? 'Administrador' : 'Funcionário'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                        <button
                            onClick={toggleTheme}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl
                                text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 
                                transition-colors"
                        >
                            {theme === 'dark' ? (
                                <Sun className="w-4 h-4" />
                            ) : (
                                <Moon className="w-4 h-4" />
                            )}
                            <span className="text-sm">{theme === 'dark' ? 'Claro' : 'Escuro'}</span>
                        </button>
                        <button
                            onClick={logout}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl
                                text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 
                                transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="text-sm">Sair</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 px-4 lg:px-8 py-4 sticky top-0 z-30">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                            >
                                <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            </button>
                            <div className="flex items-center gap-3">
                                {currentMenuItem && (
                                    <>
                                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/20">
                                            <currentMenuItem.icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                                {currentMenuItem.label}
                                            </h2>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Gerencie {currentMenuItem.label.toLowerCase()} do seu salão
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="hidden md:flex items-center gap-2">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 dark:bg-green-900/20 border border-green-200/50 dark:border-green-800/50">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-xs font-medium text-green-700 dark:text-green-400">
                                    Sistema Online
                                </span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 p-4 lg:p-8 overflow-auto">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
}
