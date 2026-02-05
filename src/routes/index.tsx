import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { MainLayout } from '../components/MainLayout';
import { Login } from '../sections/Login';
import { Dashboard } from '../sections/Dashboard';
import { Clients } from '../sections/Clients';
import { Services } from '../sections/Services';
import { Appointments } from '../sections/Appointments';
import { Finance } from '../sections/Finance';
import { Reports } from '../sections/Reports';
import { Users } from '../sections/Users';
import { Staff } from '../sections/Staff';

export const router = createBrowserRouter([
    {
        path: '/login',
        element: <Login />
    },
    {
        path: '/',
        element: (
            <ProtectedRoute>
                <MainLayout />
            </ProtectedRoute>
        ),
        children: [
            {
                index: true,
                element: <Navigate to="/dashboard" replace />
            },
            {
                path: 'dashboard',
                element: <Dashboard />
            },
            {
                path: 'clients',
                element: <Clients />
            },
            {
                path: 'services',
                element: <Services />
            },
            {
                path: 'appointments',
                element: <Appointments />
            },
            {
                path: 'finance',
                element: <Finance />
            },
            {
                path: 'reports',
                element: <Reports />
            },
            {
                path: 'users',
                element: <Users />
            },
            {
                path: 'staff',
                element: <Staff />
            },
            {
                path: '*',
                element: <Navigate to="/dashboard" replace />
            }
        ]
    }
]);
