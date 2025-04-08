import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Package, Printer, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';

interface HistoryItem {
  id: string;
  type: string;
  title: string;
  details: string;
  timestamp: string;
  userId: string;
  orderId?: string;
  taskId?: string;
}

export default function History() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'history'),
      where('userId', '==', currentUser.uid),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const historyData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as HistoryItem[];
      setHistory(historyData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'Order Created':
        return { icon: Package, color: 'text-blue-500 bg-blue-100' };
      case 'Order Completed':
        return { icon: CheckCircle, color: 'text-green-500 bg-green-100' };
      case 'Task Created':
        return { icon: Clock, color: 'text-yellow-500 bg-yellow-100' };
      case 'Task Updated':
        return { icon: AlertCircle, color: 'text-purple-500 bg-purple-100' };
      case 'Task Completed':
        return { icon: CheckCircle, color: 'text-green-500 bg-green-100' };
      default:
        return { icon: Printer, color: 'text-gray-500 bg-gray-100' };
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
          <p className="text-gray-600 mb-6">Please sign in to view history.</p>
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
        <h1 className="text-2xl font-semibold">Activity History</h1>
        <div className="flex items-center space-x-2">
          <Calendar className="text-gray-500" />
          <span className="text-gray-500">
            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <div className="flow-root">
              <ul className="-mb-8">
                {history.map((item, index) => {
                  const { icon: Icon, color } = getIcon(item.type);
                  return (
                    <li key={item.id}>
                      <div className="relative pb-8">
                        {index !== history.length - 1 && (
                          <span
                            className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                            aria-hidden="true"
                          />
                        )}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${color}`}>
                              <Icon className="h-5 w-5" aria-hidden="true" />
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="relative">
                              <p className="text-sm text-gray-500">
                                {formatDate(item.timestamp)}
                              </p>
                              <div className="mt-1">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium text-gray-900">
                                    {item.type}
                                  </p>
                                  <p className="text-sm text-gray-500">{item.title}</p>
                                </div>
                                <p className="mt-1 text-sm text-gray-500">
                                  {item.details}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}