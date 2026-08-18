import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './hooks/useAuth';
import { WalletProvider } from './context/WalletContext';
import ProtectedRoute from './components/ProtectedRoute';
import AuthLayout from './components/Layout/AuthLayout';
import MainLayout from './components/Layout/MainLayout';

// Auth Pages
import Register from './pages/Auth/Register';
import Login from './pages/Auth/Login';
import TwoFA from './pages/Auth/TwoFA';

// Main Pages
import Dashboard from './pages/Dashboard/Dashboard';
import Transactions from './pages/Transactions/Transactions';
import Cards from './pages/Cards/Cards';
import Loans from './pages/Loans/Loans';
import Profile from './pages/Profile/Profile';
import Support from './pages/Support/Support';
import WalletPage from './pages/Wallet/Wallet';
import AdminDashboard from './pages/Admin/AdminDashboard';
// Landing Page
import LandingPage from './pages/Landing/LandingPage';
import { useAuth } from './hooks/useAuth';

import './styles/index.css';

// ✅ Function to wait for backend to wake up
async function waitForBackend(url, maxRetries = 10, delay = 3000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, { method: 'GET' });
      if (response.ok || response.status === 404) {
        console.log('✅ Backend is awake!');
        return true;
      }
    } catch (err) {
      console.log(`⏳ Backend still asleep... retrying (${i + 1}/${maxRetries})`);
    }
    await new Promise((res) => setTimeout(res, delay)); // Wait before retrying
  }
  throw new Error('❌ Backend failed to wake up in time.');
}

function AppRoutes() {
  const { isAdmin } = useAuth();

  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/register" element={<AuthLayout><Register /></AuthLayout>} />
      <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
      <Route path="/twofa" element={<AuthLayout><TwoFA /></AuthLayout>} />

      {/* Main Routes - all protected by the route guard */}
      <Route path="/dashboard" element={<ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute>} />
      <Route path="/transactions" element={<ProtectedRoute><MainLayout><Transactions /></MainLayout></ProtectedRoute>} />
      <Route path="/cards" element={<ProtectedRoute><MainLayout><Cards /></MainLayout></ProtectedRoute>} />
      <Route path="/loans" element={<ProtectedRoute><MainLayout><Loans /></MainLayout></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><MainLayout><Profile /></MainLayout></ProtectedRoute>} />
      <Route path="/support" element={<ProtectedRoute><MainLayout><Support /></MainLayout></ProtectedRoute>} />
      <Route path="/wallet" element={<ProtectedRoute><MainLayout><WalletPage /></MainLayout></ProtectedRoute>} />
      {isAdmin && <Route path="/admin" element={<ProtectedRoute><MainLayout><AdminDashboard /></MainLayout></ProtectedRoute>} />}

      {/* Default Route - public landing page */}
      <Route path="/" element={<LandingPage />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <WalletProvider>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Toaster
            position="top-right"
            toastOptions={{
              className:
                'bg-white dark:bg-primary-800 text-primary-900 dark:text-cream border border-silver/20',
              duration: 4000,
            }}
          />
          <AppRoutes />
        </Router>
      </WalletProvider>
    </AuthProvider>
  );
}

export default App;
