import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { Package, ArrowLeft, Clock, DollarSign, User, Phone } from 'lucide-react';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { notify } from '../utils/notifications';

interface Order {
  id: string;
  productName: string;
  quantity: number;
  deadline: string;
  materials: string;
  status: string;
  amount: number;
  gst: string;
  customerPhone: string;
  completionPercentage: string;
  createdAt: string;
  paymentReceived?: boolean;
  paymentDate?: string;
}

export default function OrderDetails() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!currentUser || !orderId) return;

      try {
        const orderDoc = await getDoc(doc(db, 'orders', orderId));
        if (!orderDoc.exists()) {
          notify.error('Order not found');
          navigate('/orders');
          return;
        }

        setOrder({ id: orderDoc.id, ...orderDoc.data() } as Order);
      } catch (error) {
        console.error('Error fetching order details:', error);
        notify.error('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, currentUser, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-2xl font-semibold">Order Details</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Order Information</h2>
            <Package className="w-6 h-6 text-blue-600" />
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Product Name</p>
              <p className="font-medium">{order.productName}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Quantity</p>
              <p className="font-medium">{order.quantity}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Materials</p>
              <p className="font-medium">{order.materials}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Deadline</p>
              <p className="font-medium">{order.deadline}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Created At</p>
              <p className="font-medium">
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Status & Payment</h2>
            <DollarSign className="w-6 h-6 text-green-600" />
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <div className="flex items-center space-x-2 mt-1">
                <Clock className={`w-5 h-5 ${
                  order.status === 'Completed' ? 'text-green-600' :
                  order.status === 'In Progress' ? 'text-yellow-600' :
                  'text-gray-600'
                }`} />
                <span className={`font-medium ${
                  order.status === 'Completed' ? 'text-green-600' :
                  order.status === 'In Progress' ? 'text-yellow-600' :
                  'text-gray-600'
                }`}>
                  {order.status}
                </span>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500">Progress</p>
              <div className="mt-1">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: order.completionPercentage || '0%' }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {order.completionPercentage || '0%'} Complete
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500">Amount</p>
              <p className="font-medium">₹{order.amount}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">GST (18%)</p>
              <p className="font-medium">₹{(order.amount * 0.18).toFixed(2)}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Total Amount</p>
              <p className="font-medium text-lg">
                ₹{(order.amount * 1.18).toFixed(2)}
              </p>
            </div>

            {order.paymentReceived && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-green-600 font-medium">
                  Payment received on {new Date(order.paymentDate!).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Customer Information</h2>
            <User className="w-6 h-6 text-purple-600" />
          </div>

          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-full">
              <Phone className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone Number</p>
              <p className="font-medium">{order.customerPhone}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}