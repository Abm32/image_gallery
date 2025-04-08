import React from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Key, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAppSelector } from '../store/hooks';
import { notify } from '../utils/notifications';

export default function Profile() {
  const { logout } = useAuth();
  const user = useAppSelector(state => state.user.currentUser);
  const productKeyValid = useAppSelector(state => state.user.productKeyValid);
  const productKeyExpirationDate = useAppSelector(state => state.user.productKeyExpirationDate);

  const handleLogout = async () => {
    try {
      await logout();
      notify.success('Logged out successfully');
      window.location.href = '/auth';
    } catch (error) {
      console.error('Error logging out:', error);
      notify.error('Failed to log out');
    }
  };

  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4"
      >
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">Please sign in to view your profile.</p>
          <button
            onClick={() => window.location.href = '/auth'}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-4xl mx-auto p-6"
    >
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-8">
          <div className="flex items-center justify-center">
            <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center">
              <User className="h-12 w-12 text-blue-600" />
            </div>
          </div>
          <h1 className="text-white text-2xl font-bold text-center mt-4">
            {user.displayName || 'User Profile'}
          </h1>
        </div>

        <div className="p-8">
          <div className="space-y-6">
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <Mail className="text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <Key className="text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Product Key Status</p>
                <p className="font-medium">
                  {productKeyValid ? (
                    <span className="text-green-600">Active until {new Date(productKeyExpirationDate!).toLocaleDateString()}</span>
                  ) : (
                    <span className="text-red-600">Expired</span>
                  )}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 bg-red-500 text-white p-4 rounded-lg hover:bg-red-600 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}