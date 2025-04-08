import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Phone, Mail, MapPin, Briefcase, Package } from 'lucide-react';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { notify } from '../utils/notifications';

interface Customer {
  id: string;
  name: string;
  phoneNumber: string;
  email?: string;
  address?: string;
  job?: string;
  createdAt: string;
}

interface CustomerStats {
  totalOrders: number;
  completedOrders: number;
  totalSpent: number;
}

export default function Customers() {
  const [customers, setCustomers] = useState<(Customer & { stats?: CustomerStats })[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCustomers = async () => {
      if (!currentUser) return;

      try {
        const customersQuery = query(
          collection(db, 'customers'),
          where('userId', '==', currentUser.uid),
          orderBy('createdAt', 'desc')
        );

        const customersSnapshot = await getDocs(customersQuery);
        const customersData = customersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Customer[];

        // Fetch stats for each customer
        const customersWithStats = await Promise.all(
          customersData.map(async (customer) => {
            const ordersQuery = query(
              collection(db, 'orders'),
              where('userId', '==', currentUser.uid),
              where('customerId', '==', customer.id)
            );

            const ordersSnapshot = await getDocs(ordersQuery);
            const orders = ordersSnapshot.docs.map(doc => doc.data());

            const stats: CustomerStats = {
              totalOrders: orders.length,
              completedOrders: orders.filter(order => order.status === 'Completed').length,
              totalSpent: orders.reduce((sum, order) => sum + (order.amount || 0), 0)
            };

            return { ...customer, stats };
          })
        );

        setCustomers(customersWithStats);
      } catch (error) {
        console.error('Error fetching customers:', error);
        notify.error('Failed to load customers');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [currentUser]);

  const filteredCustomers = customers.filter(customer => {
    const searchLower = searchQuery.toLowerCase();
    return (
      customer.name.toLowerCase().includes(searchLower) ||
      customer.phoneNumber.includes(searchQuery) ||
      customer.email?.toLowerCase().includes(searchLower) ||
      customer.address?.toLowerCase().includes(searchLower) ||
      customer.job?.toLowerCase().includes(searchLower)
    );
  });

  if (!currentUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4"
      >
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">Please sign in to view customers.</p>
          <button
            onClick={() => navigate('/auth')}
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
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Customers</h1>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search customers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map((customer) => (
            <motion.div
              key={customer.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/customer/${customer.id}`)}
              className="bg-white p-6 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{customer.name}</h3>
                <div className="flex space-x-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {customer.stats?.totalOrders || 0} Orders
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <span>{customer.phoneNumber}</span>
                </div>

                {customer.email && (
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <span>{customer.email}</span>
                  </div>
                )}

                {customer.address && (
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <span className="truncate">{customer.address}</span>
                  </div>
                )}

                {customer.job && (
                  <div className="flex items-center space-x-3">
                    <Briefcase className="w-5 h-5 text-gray-400" />
                    <span>{customer.job}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Total Spent</p>
                    <p className="font-semibold">₹{customer.stats?.totalSpent.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Completed Orders</p>
                    <p className="font-semibold">{customer.stats?.completedOrders || 0}/{customer.stats?.totalOrders || 0}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/orders');
                }}
                className="mt-4 w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Package className="w-4 h-4" />
                <span>Create Order</span>
              </button>
            </motion.div>
          ))}

          {filteredCustomers.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">No customers found</p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}