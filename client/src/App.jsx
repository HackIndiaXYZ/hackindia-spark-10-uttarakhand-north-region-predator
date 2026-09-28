import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import CustomerDashboard from './pages/CustomerDashboard';
import MyRidesPage from './pages/MyRidesPage';
import CustomerPackages from './pages/CustomerPackages';
import CustomerPools from './pages/CustomerPools';
import DriverDashboard from './pages/DriverDashboard';
import AdminDashboard from './pages/AdminDashboard';
import DriverPackages from './pages/DriverPackages';
import MessagePage from './pages/MessagePage';
import CustomerSettings from './pages/CustomerSettings';
import DriverSettings from './pages/DriverSettings';
import DriverHistory from './pages/DriverHistory';
import NotFound from './pages/NotFound';
import Home from './pages/Home';
import SupportPage from './pages/SupportPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';

// Advanced Bouncer: Checks token existence AND user role
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');

  // 1. If no token is found, kick the user back to the login screen
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    // 2. Decode the JWT to find the user's role securely
    const payload = JSON.parse(atob(token.split('.')[1]));

    // 3. If their role is not in the allowed list, route them to their actual dashboard
    if (allowedRoles && !allowedRoles.includes(payload.role)) {
      if (payload.role === 'ADMIN') return <Navigate to="/admin" replace />;
      if (payload.role === 'DRIVER') return <Navigate to="/driver" replace />;
      return <Navigate to="/customer" replace />;
    }

    // 4. Authorized! Let them in.
    return children;
  } catch (error) {
    // If the token is corrupted or manually edited, destroy it and force login
    localStorage.removeItem('token');
    return <Navigate to="/login" replace />;
  }
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<AuthPage />} />

        {/* Protected Customer Routes */}
        <Route path="/customer" element={
          <ProtectedRoute allowedRoles={['CUSTOMER']}>
            <CustomerDashboard />
          </ProtectedRoute>
        } />

        <Route path="/customer/rides" element={
          <ProtectedRoute allowedRoles={['CUSTOMER']}>
            <MyRidesPage />
          </ProtectedRoute>
        } />

        {/* NEW: Dedicated Customer Packages Route */}
        <Route path="/customer/packages" element={
          <ProtectedRoute allowedRoles={['CUSTOMER']}>
            <CustomerPackages />
          </ProtectedRoute>
        } />

        {/* NEW: Dedicated Customer Pools Route */}
        <Route path="/customer/pools" element={
          <ProtectedRoute allowedRoles={['CUSTOMER']}>
            <CustomerPools />
          </ProtectedRoute>
        } />

        <Route path="/customer/settings" element={
          <ProtectedRoute allowedRoles={['CUSTOMER']}>
            <CustomerSettings />
          </ProtectedRoute>
        } />

        {/* Protected Driver Routes */}
        <Route path="/driver" element={
          <ProtectedRoute allowedRoles={['DRIVER']}>
            <DriverDashboard />
          </ProtectedRoute>
        } />

        <Route path="/driver/settings" element={
          <ProtectedRoute allowedRoles={['DRIVER']}>
            <DriverSettings />
          </ProtectedRoute>
        } />

        <Route path="/driver/packages" element={
          <ProtectedRoute allowedRoles={['DRIVER']}>
            <DriverPackages />
          </ProtectedRoute>
        } />

        <Route path="/driver/history" element={
          <ProtectedRoute allowedRoles={['DRIVER']}>
            <DriverHistory />
          </ProtectedRoute>
        } />

        {/* Protected Admin Route */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        {/* SECURE MESSAGING (Both Customer and Driver) */}
        <Route path="/messages" element={
          <ProtectedRoute allowedRoles={['CUSTOMER', 'DRIVER']}>
            <MessagePage />
          </ProtectedRoute>
        } />

        {/* SUPPORT / CONTACT US (Both Customer and Driver) */}
        <Route path="/support" element={
          <ProtectedRoute allowedRoles={['CUSTOMER', 'DRIVER']}>
            <SupportPage />
          </ProtectedRoute>
        } />

        {/* PUBLIC STATIC PAGES */}
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />

        {/* 404 Catch-All Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
