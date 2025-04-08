import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { PieChart as PieChartIcon, TrendingUp, DollarSign, Calendar } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  setTransactions,
  setStats,
  setLoading,
  setError,
  setTimeframe,
  resetFinance,
  type FinanceStats
} from '../store/slices/financeSlice';

const initialStats: FinanceStats = {
  totalRevenue: 0,
  pendingPayments: 0,
  totalGst: 0,
  completedOrders: 0,
  pendingOrders: 0,
  cancelledOrders: 0
};

export default function Finance() {
  const { currentUser } = useAuth();
  const dispatch = useAppDispatch();
  
  const {
    transactions,
    stats,
    loading,
    timeframe
  } = useAppSelector(state => state.finance);

  useEffect(() => {
    const calculateFinanceStats = async () => {
      if (!currentUser) {
        dispatch(setLoading(false));
        return;
      }

      try {
        dispatch(setLoading(true));
        const startDate = new Date();
        if (timeframe === 'monthly') {
          startDate.setMonth(startDate.getMonth() - 1);
        } else {
          startDate.setFullYear(startDate.getFullYear() - 1);
        }

        const ordersQuery = query(
          collection(db, 'orders'),
          where('userId', '==', currentUser.uid),
          where('createdAt', '>=', startDate.toISOString())
        );

        const ordersSnapshot = await getDocs(ordersQuery);
        const transactionData = [];
        let totalRev = 0;
        let pendingPay = 0;
        let totalGstAmount = 0;
        let completed = 0;
        let pending = 0;
        let cancelled = 0;

        ordersSnapshot.forEach((doc) => {
          const order = doc.data();
          const amount = Number(order.amount) || 0;
          const gstAmount = amount * 0.18; // 18% GST
          
          const transaction = {
            id: doc.id,
            productName: order.productName,
            amount: amount,
            gst: gstAmount,
            createdAt: order.createdAt,
            status: order.status,
            paymentDate: order.paymentDate
          };

          transactionData.push(transaction);

          if (order.status === 'Completed') {
            totalRev += amount;
            totalGstAmount += gstAmount;
            completed++;
          } else if (order.status === 'Pending' || order.status === 'In Progress') {
            pendingPay += amount;
            pending++;
          } else if (order.status === 'Cancelled') {
            cancelled++;
          }
        });

        dispatch(setTransactions(transactionData));
        dispatch(setStats({
          totalRevenue: totalRev,
          pendingPayments: pendingPay,
          totalGst: totalGstAmount,
          completedOrders: completed,
          pendingOrders: pending,
          cancelledOrders: cancelled
        }));
      } catch (error) {
        console.error('Error fetching finance data:', error);
        dispatch(setError(error instanceof Error ? error.message : 'An error occurred'));
        dispatch(resetFinance());
      } finally {
        dispatch(setLoading(false));
      }
    };

    calculateFinanceStats();
  }, [currentUser, timeframe, dispatch]);

  const pieChartData = [
    { name: 'Completed', value: stats.totalRevenue, color: '#10B981' },
    { name: 'Pending', value: stats.pendingPayments, color: '#F59E0B' },
    { name: 'Cancelled', value: 0, color: '#EF4444' }
  ];

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
          <p className="text-gray-600 mb-6">Please sign in to view financial data.</p>
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
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Finance Overview</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => dispatch(setTimeframe('monthly'))}
            className={`px-4 py-2 rounded-lg ${
              timeframe === 'monthly'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => dispatch(setTimeframe('yearly'))}
            className={`px-4 py-2 rounded-lg ${
              timeframe === 'yearly'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Yearly
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Total Revenue</h3>
                <DollarSign className="text-green-500" />
              </div>
              <p className="text-3xl font-bold mt-2">₹{stats.totalRevenue.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-1">{stats.completedOrders} completed orders</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Pending Payments</h3>
                <TrendingUp className="text-yellow-500" />
              </div>
              <p className="text-3xl font-bold mt-2">₹{stats.pendingPayments.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-1">{stats.pendingOrders} pending orders</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Total GST</h3>
                <PieChartIcon className="text-blue-500" />
              </div>
              <p className="text-3xl font-bold mt-2">₹{stats.totalGst.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-1">18% of total revenue</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Revenue Distribution</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No transactions found for this period
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.slice(0, 5).map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{transaction.productName}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹{transaction.amount.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">
                          GST: ₹{transaction.gst.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}