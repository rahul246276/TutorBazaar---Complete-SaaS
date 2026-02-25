import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import './styles/index.css';

// Context
import { AuthProvider } from './context/AuthContext';

// Components
import { TutorRoute, AdminRoute } from './components/ProtectedRoute';
import { NotFound, ErrorBoundary } from './components/ErrorPages';

// Layouts
import MainLayout from './components/layout/MainLayout';
import TutorLayout from './components/layout/TutorLayout';
import AdminLayout from './components/layout/AdminLayout';

// Public Pages
const Home = lazy(() => import('./pages/public/Home'));
const FindTutor = lazy(() => import('./pages/public/FindTutor'));
const TutorProfile = lazy(() => import('./pages/public/TutorProfile'));
const Enquiry = lazy(() => import('./pages/public/Enquiry'));
const Contact = lazy(() => import('./pages/public/Contact'));
const Login = lazy(() => import('./pages/public/Login'));
const Register = lazy(() => import('./pages/public/Register'));

// Tutor Pages
const TutorDashboard = lazy(() => import('./pages/tutor/Dashboard'));
const TutorLeads = lazy(() => import('./pages/tutor/Leads'));
const TutorCredits = lazy(() => import('./pages/tutor/Credits'));
const TutorProfileEdit = lazy(() => import('./pages/tutor/Profile'));
const TutorAnalytics = lazy(() => import('./pages/tutor/Analytics'));

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminTutors = lazy(() => import('./pages/admin/Tutors'));
const AdminLeads = lazy(() => import('./pages/admin/Leads'));
const AdminPayments = lazy(() => import('./pages/admin/Payments'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-600">Loading...</div>}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<MainLayout />}>
                  <Route index element={<Home />} />
                  <Route path="find-tutor" element={<FindTutor />} />
                  <Route path="tutor/:id" element={<TutorProfile />} />
                  <Route path="enquiry" element={<Enquiry />} />
                  <Route path="contact" element={<Contact />} />
                  <Route path="login" element={<Login />} />
                  <Route path="register" element={<Register />} />
                </Route>

                {/* Tutor Routes */}
                <Route
                  path="/tutor"
                  element={
                    <TutorRoute>
                      <TutorLayout />
                    </TutorRoute>
                  }
                >
                  <Route path="dashboard" element={<TutorDashboard />} />
                  <Route path="leads" element={<TutorLeads />} />
                  <Route path="credits" element={<TutorCredits />} />
                  <Route path="profile" element={<TutorProfileEdit />} />
                  <Route path="analytics" element={<TutorAnalytics />} />
                </Route>

                {/* Admin Routes */}
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminLayout />
                    </AdminRoute>
                  }
                >
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="tutors" element={<AdminTutors />} />
                  <Route path="leads" element={<AdminLeads />} />
                  <Route path="payments" element={<AdminPayments />} />
                </Route>

                {/* 404 Page */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </Router>
          <Toaster position="top-right" />
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
