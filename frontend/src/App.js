import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';

// Context
import { AuthProvider } from './context/AuthContext';

// Layouts
import MainLayout from './components/layout/MainLayout';
import TutorLayout from './components/layout/TutorLayout';
import AdminLayout from './components/layout/AdminLayout';

// Public Pages
import Home from './pages/public/Home';
import FindTutor from './pages/public/FindTutor';
import TutorProfile from './pages/public/TutorProfile';
import Enquiry from './pages/public/Enquiry';
import Contact from './pages/public/Contact';
import Login from './pages/public/Login';
import Register from './pages/public/Register';

// Tutor Pages
import TutorDashboard from './pages/tutor/Dashboard';
import TutorLeads from './pages/tutor/Leads';
import TutorCredits from './pages/tutor/Credits';
import TutorProfileEdit from './pages/tutor/Profile';
import TutorAnalytics from './pages/tutor/Analytics';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminTutors from './pages/admin/Tutors';
import AdminLeads from './pages/admin/Leads';
import AdminPayments from './pages/admin/Payments';

// Styles
import './styles/index.css';

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
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
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
            <Route path="/tutor" element={<TutorLayout />}>
              <Route path="dashboard" element={<TutorDashboard />} />
              <Route path="leads" element={<TutorLeads />} />
              <Route path="credits" element={<TutorCredits />} />
              <Route path="profile" element={<TutorProfileEdit />} />
              <Route path="analytics" element={<TutorAnalytics />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="tutors" element={<AdminTutors />} />
              <Route path="leads" element={<AdminLeads />} />
              <Route path="payments" element={<AdminPayments />} />
            </Route>
          </Routes>
        </Router>
        <Toaster position="top-right" />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
