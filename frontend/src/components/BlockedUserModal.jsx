import React from 'react';
import { AlertOctagon, Mail, Phone, X } from 'lucide-react';

const BlockedUserModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-primary-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
        <div className="p-6 text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
            <AlertOctagon className="text-red-600 dark:text-red-500" size={32} />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Account Restricted</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your access to PrimeWave Bank has been suspended. Please contact our support desk for further assistance and account verification.
          </p>

          <div className="space-y-3 mb-8">
            <div className="flex items-center justify-center gap-3 p-3 bg-gray-50 dark:bg-primary rounded-lg text-gray-700 dark:text-gray-300">
              <Mail size={18} className="text-gold" />
              <span className="font-medium text-sm">support@primewavebank.com</span>
            </div>
            <div className="flex items-center justify-center gap-3 p-3 bg-gray-50 dark:bg-primary rounded-lg text-gray-700 dark:text-gray-300">
              <Phone size={18} className="text-gold" />
              <span className="font-medium text-sm">+1 (800) PRIME-WAVE</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 px-4 bg-primary text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Understood
          </button>
        </div>
        
        <div className="bg-gray-50 dark:bg-primary/50 py-3 px-6 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Security Reference: ACC-BLOCK-403</p>
        </div>
      </div>
    </div>
  );
};

export default BlockedUserModal;