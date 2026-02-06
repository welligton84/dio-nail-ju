import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { MainLayout } from '../components/MainLayout';

// Lazy load sections for better performance
const Dashboard = lazy(() => import('../sections/Dashboard').then(m => ({ default: m.Dashboard })));
const Clients = lazy(() => import('../sections/Clients').then(m => ({ default: m.Clients })));
const Services = lazy(() => import('../sections/Services').then(m => ({ default: m.Services })));
const Appointments = lazy(() => import('../sections/Appointments').then(m => ({ default: m.Appointments })));
const Finance = lazy(() => import('../sections/Finance').then(m => ({ default: m.Finance })));
const Reports = lazy(() => import('../sections/Reports').then(m => ({ default: m.Reports })));
const Users = lazy(() => import('../sections/Users').then(m => ({ default: m.Users })));
const Staff = lazy(() => import('../sections/Staff').then(m => ({ default: m.Staff })));
const Login = lazy(() => import('../sections/Login').then(m => ({ default: m.Login })));

// Loading component for Suspense
const SectionLoader = () => (
    <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-pink-100 border-t-pink-500 rounded-full animate-spin"></div>
    </div>
);

export const router = createBrowserRouter([
    {
        path: '/login',
        element: (
            <Suspense fallback={<SectionLoader />}>
                <Login />
            </Suspense>
        )
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
                element: <Suspense fallback={<SectionLoader />}><Dashboard /></Suspense>
            },
            {
                path: 'clients',
                element: <Suspense fallback={<SectionLoader />}><Clients /></Suspense>
            },
            {
                path: 'services',
                element: <Suspense fallback={<SectionLoader />}><Services /></Suspense>
            },
            {
                path: 'appointments',
                element: <Suspense fallback={<SectionLoader />}><Appointments /></Suspense>
            },
            {
                path: 'finance',
                element: <Suspense fallback={<SectionLoader />}><Finance /></Suspense>
            },
            {
                path: 'reports',
                element: <Suspense fallback={<SectionLoader />}><Reports /></Suspense>
            },
            {
                path: 'users',
                element: <Suspense fallback={<SectionLoader />}><Users /></Suspense>
            },
            {
                path: 'staff',
                element: <Suspense fallback={<SectionLoader />}><Staff /></Suspense>
            },
            {
                path: '*',
                element: <Navigate to="/dashboard" replace />
            }
        ]
    }
]);
