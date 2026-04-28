import React, { useState } from 'react';
import api from '../services/api';
import { ShieldAlert, ShieldCheck, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const AdminBlockButton = ({ userId, initialStatus, onStatusChange }) => {
  const [isBlocked, setIsBlocked] = useState(initialStatus);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      const response = await api.put(`/api/users/${userId}/toggle-block`);
      const newStatus = response.data.data.isBlocked;
      setIsBlocked(newStatus);
      toast.success(response.data.message);
      if (onStatusChange) onStatusChange(newStatus);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update user status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
        isBlocked 
          ? 'bg-success/10 text-success hover:bg-success/20' 
          : 'bg-red-100 text-red-600 hover:bg-red-200'
      } disabled:opacity-50`}
    >
      {loading ? <Loader2 className="animate-spin" size={18} /> : (isBlocked ? <ShieldCheck size={18} /> : <ShieldAlert size={18} />)}
      {isBlocked ? 'Unblock User' : 'Block User'}
    </button>
  );
};

export default AdminBlockButton;