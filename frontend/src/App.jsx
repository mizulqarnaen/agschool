import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

// Pages
import { PublicPortal } from './pages/PublicPortal';
import { PublicEventDetail } from './pages/PublicEventDetail';
import { PublicBADetail } from './pages/PublicBADetail';
import { LoginPage } from './pages/LoginPage';
import { InternalDashboard } from './pages/InternalDashboard';
import { IncomePage } from './pages/IncomePage';
import { ExpensePage } from './pages/ExpensePage';
import { PaymentPage } from './pages/PaymentPage';
import { MemberPage } from './pages/MemberPage';
import { EventManagementPage } from './pages/EventManagementPage';
import { BrandAmbassadorPage } from './pages/BrandAmbassadorPage';
import { UserManagementPage } from './pages/UserManagementPage';
import { ReportPage } from './pages/ReportPage';
import { SettingsPage } from './pages/SettingsPage';
import { ActivityLogPage } from './pages/ActivityLogPage';
import { NotFoundPage } from './pages/NotFoundPage';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  const token = localStorage.getItem('token');

  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }
  if (allowedRoles && !allowedRoles.includes(user.role_slug)) {
    return <Navigate to="/internal/dashboard" replace />;
  }
  return children;
};

import { ThemeProvider } from './context/ThemeContext';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <Routes>
        {/* Public Transparency Portal Routes */}
        <Route path="/" element={<PublicPortal />} />
        <Route path="/events/:id" element={<PublicEventDetail />} />
        <Route path="/brand-ambassadors/:id" element={<PublicBADetail />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Internal Management Routes */}
        <Route
          path="/internal/dashboard"
          element={
            <ProtectedRoute>
              <InternalDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/internal/incomes"
          element={
            <ProtectedRoute allowedRoles={['administrator', 'finance']}>
              <IncomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/internal/expenses"
          element={
            <ProtectedRoute allowedRoles={['administrator', 'finance']}>
              <ExpensePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/internal/payments"
          element={
            <ProtectedRoute allowedRoles={['administrator', 'finance']}>
              <PaymentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/internal/members"
          element={
            <ProtectedRoute allowedRoles={['administrator', 'finance', 'secretary']}>
              <MemberPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/internal/events"
          element={
            <ProtectedRoute allowedRoles={['administrator', 'secretary']}>
              <EventManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/internal/brand-ambassadors"
          element={
            <ProtectedRoute allowedRoles={['administrator', 'finance', 'secretary']}>
              <BrandAmbassadorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/internal/users"
          element={
            <ProtectedRoute allowedRoles={['administrator']}>
              <UserManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/internal/reports"
          element={
            <ProtectedRoute allowedRoles={['administrator', 'finance']}>
              <ReportPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/internal/settings"
          element={
            <ProtectedRoute allowedRoles={['administrator']}>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/internal/logs"
          element={
            <ProtectedRoute allowedRoles={['administrator']}>
              <ActivityLogPage />
            </ProtectedRoute>
          }
        />

        {/* 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  </ThemeProvider>
);
}
