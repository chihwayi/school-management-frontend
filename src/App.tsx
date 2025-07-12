import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';

// Common Components
import ProtectedRoute from './components/common/ProtectedRoute';
import ThemeProvider from './components/common/ThemeProvider';
import LoadingSpinner from './components/common/LoadingSpinner';
import MainLayout from './components/layout/MainLayout';

// Auth & Setup Pages
import LoginPage from './pages/auth/LoginPage';
import SchoolSetupPage from './pages/setup/SchoolSetupPage';

// Dashboard Pages
import DashboardPage from './pages/dashboard/DashboardPage';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import TeacherDashboard from './pages/dashboard/TeacherDashboard';
import ClassTeacherDashboard from './pages/dashboard/ClassTeacherDashboard';

// Management Pages
import { StudentsPage, StudentDetailPage } from './pages/students';
import { TeachersPage, TeacherDetailPage } from './pages/teachers';
import { ClassesPage, ClassDetailPage } from './pages/classes';
import { SubjectsPage, SubjectDetailPage } from './pages/subjects';
import { AssessmentsPage, AssessmentDetailPage } from './pages/assessments';
import { AttendancePage, AttendanceDetailPage } from './pages/attendance';
import { ReportsPage, ReportDetailPage } from './pages/reports';
import { GuardiansPage, GuardianDetailPage } from './pages/guardians';
import { FeePaymentPage, PaymentStatusPage, FinancialReportsPage } from './pages/fees';

// Hooks
import { useAuth } from './hooks/useAuth';
import { ERole } from './types';

// Create a client instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
    },
  },
});

// Route Guard Component
const RouteGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isSchoolConfigured, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Check school setup first, before authentication
  if (!isSchoolConfigured) {
    return <Navigate to="/setup" replace />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Root Route Component - handles initial redirect
const RootRoute: React.FC = () => {
  const { isAuthenticated, isSchoolConfigured, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Check school setup first
  if (!isSchoolConfigured) {
    return <Navigate to="/setup" replace />;
  }

  // Then check authentication
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If both are good, go to dashboard
  return <Navigate to="/app" replace />;
};

// Dashboard Route Component
const DashboardRoute: React.FC = () => {
  return <DashboardPage />;
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              {/* Root Route - handles initial redirect */}
              <Route path="/" element={<RootRoute />} />
              
              {/* Setup Route - Should be accessible without auth */}
              <Route path="/setup" element={<SchoolSetupPage />} />
              
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />

              {/* Protected Routes */}
              <Route path="/app" element={
                <RouteGuard>
                  <MainLayout>
                    <Outlet />
                  </MainLayout>
                </RouteGuard>
              }>
                {/* Dashboard */}
                <Route index element={<DashboardRoute />} />
                <Route path="dashboard" element={<DashboardRoute />} />

                {/* Student Management */}
                <Route path="students" element={<StudentsPage />} />
                <Route path="students/:id" element={<StudentDetailPage />} />

                {/* Teacher Management */}
                <Route path="teachers" element={<TeachersPage />} />
                <Route path="teachers/:id" element={<TeacherDetailPage />} />

                {/* Class Management */}
                <Route path="classes" element={<ClassesPage />} />
                <Route path="classes/:id" element={<ClassDetailPage />} />

                {/* Subject Management */}
                <Route path="subjects" element={<SubjectsPage />} />
                <Route path="subjects/:id" element={<SubjectDetailPage />} />

                {/* Assessment Management */}
                <Route path="assessments" element={<AssessmentsPage />} />
                <Route path="assessments/:id" element={<AssessmentDetailPage />} />

                {/* Attendance Management */}
                <Route path="attendance" element={<AttendancePage />} />
                <Route path="attendance/:date" element={<AttendanceDetailPage />} />

                {/* Report Management */}
                <Route path="reports" element={<ReportsPage />} />
                <Route path="reports/:id" element={<ReportDetailPage />} />

                {/* Guardian Management */}
                <Route path="guardians" element={<GuardiansPage />} />
                <Route path="guardians/:id" element={<GuardianDetailPage />} />

                {/* Fee Management */}
                <Route path="fees/payment" element={<FeePaymentPage />} />
                <Route path="fees/status" element={<PaymentStatusPage />} />
                <Route path="fees/reports" element={<FinancialReportsPage />} />

                {/* Catch all - redirect to dashboard */}
                <Route path="*" element={<Navigate to="/app" replace />} />
              </Route>
            </Routes>

            {/* Global Components */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  style: {
                    background: '#22c55e',
                  },
                },
                error: {
                  style: {
                    background: '#ef4444',
                  },
                },
              }}
            />
          </div>
        </Router>
        <ReactQueryDevtools initialIsOpen={false} />
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;