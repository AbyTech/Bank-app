import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../services/api'; // Assuming your API service is here
import BlockedUserModal from '../../components/BlockedUserModal';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isBlockedModalOpen, setIsBlockedModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/auth/login', { email, password });
      // Assuming your API returns a token and user data
      localStorage.setItem('token', res.data.token);
      // You might also store user role or other info
      toast.success('Login successful!');
      navigate('/dashboard'); // Redirect to dashboard or home
    } catch (error) {
      if (error.response && error.response.status === 403) {
        // If the user is blocked (403 status), open the modal
        setIsBlockedModalOpen(true);
      } else {
        // For other login errors, show a toast notification
        toast.error(error.response?.data?.error || 'Login failed');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream dark:bg-primary-900">
      <div className="bg-white dark:bg-primary-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-primary dark:text-cream mb-6 text-center">Login to PrimeWave Bank</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-silver dark:text-gray-300 mb-2">Email</label>
            <input
              type="email"
              id="email"
              className="w-full px-4 py-2 border border-silver/30 dark:border-primary-600 rounded-lg bg-cream dark:bg-primary-700 text-primary dark:text-cream focus:outline-none focus:ring-2 focus:ring-gold"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-silver dark:text-gray-300 mb-2">Password</label>
            <input
              type="password"
              id="password"
              className="w-full px-4 py-2 border border-silver/30 dark:border-primary-600 rounded-lg bg-cream dark:bg-primary-700 text-primary dark:text-cream focus:outline-none focus:ring-2 focus:ring-gold"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary text-white py-2 rounded-lg hover:bg-gray-800 transition-colors duration-200"
          >
            Login
          </button>
        </form>
      </div>

      {/* The BlockedUserModal component, rendered conditionally */}
      <BlockedUserModal
        isOpen={isBlockedModalOpen}
        onClose={() => setIsBlockedModalOpen(false)} // Allows closing the modal
      />
    </div>
  );
};

export default Login;