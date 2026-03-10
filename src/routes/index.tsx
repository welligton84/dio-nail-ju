import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { MainLayout } from '../components/MainLayout';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { SectionLoader } from '../components/SectionLoader';

// Lazy load sections for better performance
const Dashboard = lazy(() => import('../sections/Dashboard').then(m => ({ default: m.Dashboard })));
const Clients = lazy(() => import('../sections/Clients').then(m => ({ default: m.Clients })));
const Services = lazy(() => import('../sections/Services').then(m => ({ default: m.Services })));
const Appointments = lazy(() => import('../sections/Appointments').then(m => ({ default: m.Appointments })));
const Finance = lazy(() => import('../sections/Finance').then(m => ({ default: m.Finance })));
const Reports = lazy(() => import('../sections/Reports').then(m => ({ default: m.Reports })));
const Users = lazy(() => import('../sections/Users').then(m => ({ default: m.Users })));
const Staff = lazy(() => import('../sections/Staff').then(m => ({ default: m.Staff })));
const Settings = lazy(() => import('../sections/Settings').then(m => ({ default: m.Settings })));
const NFSeRecords = lazy(() => import('../sections/NFSeRecords').then(m => ({ default: m.NFSeRecords })));
const Login = lazy(() => import('../sections/Login').then(m => ({ default: m.Login })));

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
                <ErrorBoundary>
                    <MainLayout />
                </ErrorBoundary>
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
                path: 'settings',
                element: <Suspense fallback={<SectionLoader />}><Settings /></Suspense>
            },
            {
                path: 'nfse',
                element: <Suspense fallback={<SectionLoader />}><NFSeRecords /></Suspense>
            },
            {
                path: '*',
                element: <Navigate to="/dashboard" replace />
            }
        ]
    }
]);
