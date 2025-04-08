import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, AlertCircle, Package, CheckCircle, AlertTriangle } from 'lucide-react';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setOrders } from '../store/slices/ordersSlice';
import { setTasks } from '../store/slices/tasksSlice';
import CustomerSearch from '../components/CustomerSearch';

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  details: string;
  timestamp: string;
}

export default function Home() {
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const dispatch = useAppDispatch();

  const orders = useAppSelector(state => state.orders.items);
  const tasks = useAppSelector(state => state.tasks.items);

  const stats = {
    totalOrders: orders.length,
    completedOrders: orders.filter(order => order.status === 'Completed').length,
    pendingTasks: tasks.filter(task => task.status !== 'completed').length
  };

  useEffect(() => {
    if (!currentUser) return;

    setLoading(true);

    const ordersQuery = query(
      collection(db, 'orders'),
      where('userId', '==', currentUser.uid)
    );

    const tasksQuery = query(
      collection(db, 'tasks'),
      where('userId', '==', currentUser.uid),
      where('status', 'in', ['pending', 'in-progress']),
      orderBy('deadline', 'asc')
    );

    const activityQuery = query(
      collection(db, 'history'),
      where('userId', '==', currentUser.uid),
      orderBy('timestamp', 'desc')
    );

    const unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
      const orderData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      dispatch(setOrders(orderData));
    });

    const unsubscribeTasks = onSnapshot(tasksQuery, (snapshot) => {
      const taskData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      dispatch(setTasks(taskData));
    });

    const unsubscribeActivity = onSnapshot(activityQuery, (snapshot) => {
      const activity = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as ActivityItem[];

      setRecentActivity(activity.slice(0, 5));
      setLoading(false);
    });

    return () => {
      unsubscribeOrders();
      unsubscribeTasks();
      unsubscribeActivity();
    };
  }, [currentUser, dispatch]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'Order Created':
        return <Package className="text-blue-500" />;
      case 'Order Completed':
      case 'Task Completed':
        return <CheckCircle className="text-green-500" />;
      case 'Task Created':
      case 'Task Updated':
        return <Clock className="text-yellow-500" />;
      default:
        return <AlertTriangle className="text-gray-500" />;
    }
  };

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
          <p className="text-gray-600 mb-6">Please sign in to view dashboard.</p>
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
      <div className="mb-8">
        <CustomerSearch />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg"
            >
              <h3 className="text-lg font-semibold opacity-90">Total Orders</h3>
              <p className="text-3xl font-bold mt-2">{stats.totalOrders}</p>
              <div className="mt-2 text-sm opacity-75">
                <Package className="inline-block w-4 h-4 mr-1" />
                All time orders
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg"
            >
              <h3 className="text-lg font-semibold opacity-90">Completed Orders</h3>
              <p className="text-3xl font-bold mt-2">{stats.completedOrders}</p>
              <div className="mt-2 text-sm opacity-75">
                <CheckCircle className="inline-block w-4 h-4 mr-1" />
                Successfully delivered
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-6 rounded-lg shadow-lg"
            >
              <h3 className="text-lg font-semibold opacity-90">Pending Tasks</h3>
              <p className="text-3xl font-bold mt-2">{stats.pendingTasks}</p>
              <div className="mt-2 text-sm opacity-75">
                <Clock className="inline-block w-4 h-4 mr-1" />
                Require attention
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Upcoming Deadlines</h2>
                <Clock className="text-gray-500" />
              </div>
              <div className="space-y-4">
                {tasks.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">No upcoming tasks</p>
                ) : (
                  tasks
                    .filter(task => task.status !== 'completed')
                    .slice(0, 5)
                    .map((task, index) => (
                      <div
                        key={`task-${task.id}-${index}`}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-l-4 border-yellow-500"
                      >
                        <div>
                          <h3 className="font-medium">{task.title}</h3>
                          <p className="text-sm text-gray-500">
                            {task.orderDetails?.productName}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                            {formatDate(task.deadline)}
                          </span>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Recent Activity</h2>
                <AlertCircle className="text-gray-500" />
              </div>
              <div className="space-y-4">
                {recentActivity.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">No recent activity</p>
                ) : (
                  recentActivity.map((activity, index) => (
                    <div
                      key={`activity-${activity.id}-${index}`}
                      className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-shrink-0">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{activity.title}</p>
                        <p className="text-sm text-gray-500">{activity.details}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </motion.div>
  );
}