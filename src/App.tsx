import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AdminLayout } from './components/layout/AdminLayout';

// Pages
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { ApplicationsList } from './pages/applications/ApplicationsList';
import { ApplicationDetail } from './pages/applications/ApplicationDetail';
import { ClientsList } from './pages/clients/ClientsList';
import { ClientDetail } from './pages/clients/ClientDetail';
import { DocumentsHub } from './pages/documents/DocumentsHub';
import { LeadsList } from './pages/leads/LeadsList';
import { AppointmentsList } from './pages/appointments/AppointmentsList';
import { PaymentsList } from './pages/payments/PaymentsList';
import { UsersList } from './pages/users/UsersList';
import { AuditLogs } from './pages/audit/AuditLogs';
import { Settings } from './pages/settings/Settings';
import { NotFound } from './pages/NotFound';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public Login Route */}
            <Route path="/login" element={<Login />} />

            {/* Authenticated Admin Portal Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="applications" element={<ApplicationsList />} />
              <Route path="applications/:id" element={<ApplicationDetail />} />
              <Route path="clients" element={<ClientsList />} />
              <Route path="clients/:id" element={<ClientDetail />} />
              <Route path="documents" element={<DocumentsHub />} />
              <Route path="leads" element={<LeadsList />} />
              <Route path="appointments" element={<AppointmentsList />} />
              <Route path="payments" element={<PaymentsList />} />

              {/* Admin Only Governance Routes */}
              <Route
                path="users"
                element={
                  <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
                    <UsersList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="audit-logs"
                element={
                  <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
                    <AuditLogs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="settings"
                element={
                  <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
                    <Settings />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;
