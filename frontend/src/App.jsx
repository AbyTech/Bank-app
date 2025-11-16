import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './hooks/useAuth';
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
import AdminDashboard from './pages/Admin/AdminDashboard';

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

function App() {
  const [backendReady, setBackendReady] = useState(false);

  useEffect(() => {
    // ✅ Try to wake backend before rendering routes
    waitForBackend('https://banking-system-1-qeky.onrender.com/')
      .then(() => setBackendReady(true))
      .catch(() => setBackendReady(true)); // continue even if fails
  }, []);

  if (!backendReady) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-primary-50 dark:bg-primary-900 text-primary-800 dark:text-cream">
        <h1 className="text-2xl font-semibold mb-4">🚀 Starting Server...</h1>
        <p className="text-base opacity-70">Please wait a few seconds while we wake the backend.</p>
      </div>
    );
  }

  return (
    <AuthProvider>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            className:
              'bg-white dark:bg-primary-800 text-primary-900 dark:text-cream border border-silver/20',
            duration: 4000,
          }}
        />
        <Routes>
          {/* Auth Routes */}
          <Route path="/register" element={<AuthLayout><Register /></AuthLayout>} />
          <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
          <Route path="/twofa" element={<AuthLayout><TwoFA /></AuthLayout>} />

          {/* Main Routes */}
          <Route path="/dashboard" element={<MainLayout><Dashboard /></MainLayout>} />
          <Route path="/transactions" element={<MainLayout><Transactions /></MainLayout>} />
          <Route path="/cards" element={<MainLayout><Cards /></MainLayout>} />
          <Route path="/loans" element={<MainLayout><Loans /></MainLayout>} />
          <Route path="/profile" element={<MainLayout><Profile /></MainLayout>} />
          <Route path="/support" element={<MainLayout><Support /></MainLayout>} />
          <Route path="/admin" element={<MainLayout><AdminDashboard /></MainLayout>} />

          {/* Default Route */}
          <Route path="/" element={<AuthLayout><Register /></AuthLayout>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
