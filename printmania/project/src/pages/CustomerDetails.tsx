import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { Phone, Mail, MapPin, Briefcase, Package, Calendar, Clock, ArrowLeft } from 'lucide-react';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { useAppDispatch } from '../store/hooks';
import { setSelectedCustomer } from '../store/slices/customersSlice';
import { notify } from '../utils/notifications';

interface Order {
  id: string;
  productName: string;
  quantity: number;
  amount: number;
  status: string;
  createdAt: string;
}

export default function CustomerDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const dispatch = useAppDispatch();
  
  const [customer, setCustomer] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomerDetails = async () => {
      if (!currentUser || !id) return;

      try {
        const customerDoc = await getDoc(doc(db, 'customers', id));
        if (!customerDoc.exists()) {
          notify.error('Customer not found');
          navigate('/');
          return;
        }

        const customerData = { id: customerDoc.id, ...customerDoc.data() };
        setCustomer(customerData);
        dispatch(setSelectedCustomer(customerData));

        const ordersQuery = query(
          collection(db, 'orders'),
          where('userId', '==', currentUser.uid),
          where('customerId', '==', id)
        );

        const ordersSnapshot = await getDocs(ordersQuery);
        const ordersData = ordersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Order[];

        setOrders(ordersData);
      } catch (error) {
        console.error('Error fetching customer details:', error);
        notify.error('Failed to load customer details');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerDetails();
  }, [id, currentUser, dispatch, navigate]);

  const handleNewOrder = () => {
    navigate('/orders');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!customer) {
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
          onClick={() => navigate('/')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-2xl font-semibold">Customer Details</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <Phone className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{customer.phoneNumber}</p>
              </div>
            </div>

            {customer.email && (
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <Mail className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{customer.email}</p>
                </div>
              </div>
            )}

            {customer.address && (
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-full">
                  <MapPin className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium">{customer.address}</p>
                </div>
              </div>
            )}

            {customer.job && (
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 rounded-full">
                  <Briefcase className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Job</p>
                  <p className="font-medium">{customer.job}</p>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleNewOrder}
            className="w-full mt-6 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <Package className="w-5 h-5" />
            <span>Create New Order</span>
          </button>
        </div>

        <div className="col-span-2 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Order History</h2>
          {orders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No orders found for this customer
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{order.productName}</h3>
                      <p className="text-sm text-gray-500">Quantity: {order.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{order.amount}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className={`text-sm ${
                        order.status === 'Completed' ? 'text-green-600' :
                        order.status === 'In Progress' ? 'text-yellow-600' :
                        'text-gray-600'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <button
                      onClick={() => navigate(`/orders/${order.id}`)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}