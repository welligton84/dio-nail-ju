import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    LayoutDashboard,
    Users,
    Calendar,
    Scissors,
    DollarSign,
    BarChart3,
    UserCog,
    LogOut,
    Menu,
    Award
} from 'lucide-react';
import { InstallPrompt } from './shared/InstallPrompt';

const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'clients', label: 'Clientes', icon: Users },
    { id: 'appointments', label: 'Agendamentos', icon: Calendar },
    { id: 'services', label: 'Serviços', icon: Scissors },
    { id: 'finance', label: 'Financeiro', icon: DollarSign },
    { id: 'reports', label: 'Relatórios', icon: BarChart3 },
    { id: 'staff', label: 'Profissionais', icon: Award },
    { id: 'users', label: 'Usuários', icon: UserCog },
];

export function MainLayout() {
    const { logout, user } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const currentView = location.pathname.split('/')[1] || 'dashboard';
    const currentMenuItem = menuItems.find(item => item.id === currentView);

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <InstallPrompt />

            {/* Sidebar */}
            <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-white border-r border-gray-100 
        flex flex-col
        transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
                {/* Logo */}
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 flex items-center justify-center">
                            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg gradient-text">Juliana Miranda Concept</h1>
                            <p className="text-xs text-gray-500">Sistema de Gestão</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                navigate(`/${item.id}`);
                                setSidebarOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${currentView === item.id
                                ? 'bg-pink-50 text-pink-600 font-medium shadow-sm'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <item.icon className={`w-5 h-5 ${currentView === item.id ? 'text-pink-500' : 'text-gray-400'}`} />
                            {item.label}
                        </button>
                    ))}
                </nav>

                {/* User & Logout */}
                <div className="p-4 border-t border-gray-100">
                    <div className="mb-3 px-4 py-2 bg-gray-50 rounded-xl">
                        <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        Sair
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="bg-white border-b border-gray-100 px-4 lg:px-6 py-4 sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors"
                        >
                            <Menu className="w-6 h-6 text-gray-600" />
                        </button>
                        <div className="flex items-center gap-3">
                            {currentMenuItem && (
                                <>
                                    <currentMenuItem.icon className="w-6 h-6 text-pink-500" />
                                    <h2 className="text-lg font-semibold text-gray-900">{currentMenuItem.label}</h2>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 p-4 lg:p-6 overflow-auto">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
}
