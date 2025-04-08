import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Loader2, Archive } from 'lucide-react';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, onSnapshot } from 'firebase/firestore';
import { addHistoryItem } from '../utils/history';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setOrders, addOrder, updateOrder, deleteOrder, setLoading, setError } from '../store/slices/ordersSlice';
import { notify } from '../utils/notifications';

interface Order {
  id: string;
  productName: string;
  quantity: number;
  deadline: string;
  materials: string;
  status: string;
  gst: string;
  amount: number;
  userId: string;
  customerId?: string;
  customerPhone?: string;
  completionPercentage?: string;
  paymentReceived?: boolean;
  paymentDate?: string;
}

export default function Orders() {
  const [showAddOrder, setShowAddOrder] = useState(false);
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const { currentUser } = useAuth();
  const dispatch = useAppDispatch();
  
  const orders = useAppSelector(state => state.orders.items);
  const loading = useAppSelector(state => state.orders.loading);
  const error = useAppSelector(state => state.orders.error);
  const selectedCustomer = useAppSelector(state => state.customers.selectedCustomer);

  const [formData, setFormData] = useState({
    productName: '',
    quantity: '',
    deadline: '',
    materials: '',
    amount: '',
    gst: '18',
    customerPhone: selectedCustomer?.phoneNumber || ''
  });

  useEffect(() => {
    if (selectedCustomer) {
      setFormData(prev => ({
        ...prev,
        customerPhone: selectedCustomer.phoneNumber
      }));
    }
  }, [selectedCustomer]);

  useEffect(() => {
    if (!currentUser) return;

    dispatch(setLoading(true));

    const activeOrdersQuery = query(
      collection(db, 'orders'),
      where('userId', '==', currentUser.uid),
      where('status', 'in', ['Pending', 'In Progress', 'Ready for Payment'])
    );

    const completedOrdersQuery = query(
      collection(db, 'orders'),
      where('userId', '==', currentUser.uid),
      where('status', '==', 'Completed')
    );

    const unsubscribeActive = onSnapshot(activeOrdersQuery, (snapshot) => {
      const orderData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      dispatch(setOrders(orderData));
      dispatch(setLoading(false));
    }, (error) => {
      dispatch(setError(error.message));
      dispatch(setLoading(false));
    });

    const unsubscribeCompleted = onSnapshot(completedOrdersQuery, (snapshot) => {
      const completedData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      setCompletedOrders(completedData);
    });

    return () => {
      unsubscribeActive();
      unsubscribeCompleted();
    };
  }, [currentUser, dispatch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      const orderData = {
        ...formData,
        quantity: parseInt(formData.quantity),
        amount: parseFloat(formData.amount),
        userId: currentUser.uid,
        customerId: selectedCustomer?.id,
        customerPhone: formData.customerPhone,
        status: 'Pending',
        completionPercentage: '0%',
        createdAt: new Date().toISOString()
      };

      if (currentOrder) {
        await updateDoc(doc(db, 'orders', currentOrder.id), orderData);
        dispatch(updateOrder({ id: currentOrder.id, ...orderData }));
        await addHistoryItem({
          type: 'Order Updated',
          title: orderData.productName,
          details: `Updated order details for ${orderData.productName}`,
          userId: currentUser.uid,
          orderId: currentOrder.id
        });
        notify.success('Order updated successfully');
      } else {
        const orderRef = await addDoc(collection(db, 'orders'), orderData);
        dispatch(addOrder({ id: orderRef.id, ...orderData }));
        await addHistoryItem({
          type: 'Order Created',
          title: orderData.productName,
          details: `New order created for ${orderData.quantity} ${orderData.productName}`,
          userId: currentUser.uid,
          orderId: orderRef.id
        });
        notify.success('Order created successfully');
      }

      setShowAddOrder(false);
      resetForm();
    } catch (error) {
      console.error('Error saving order:', error);
      notify.error('Failed to save order. Please try again.');
    }
  };

  const handleDelete = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;

    try {
      const orderToDelete = orders.find(o => o.id === orderId);
      if (!orderToDelete) return;

      await addHistoryItem({
        type: 'Order Deleted',
        title: orderToDelete.productName,
        details: `Deleted order ${orderToDelete.productName}`,
        userId: currentUser.uid,
        orderId: orderId
      });

      await deleteDoc(doc(db, 'orders', orderId));
      dispatch(deleteOrder(orderId));
      notify.success('Order deleted successfully');
    } catch (error) {
      console.error('Error deleting order:', error);
      notify.error('Failed to delete order. Please try again.');
    }
  };

  const handleEdit = (order: Order) => {
    setCurrentOrder(order);
    setFormData({
      productName: order.productName,
      quantity: order.quantity.toString(),
      deadline: order.deadline,
      materials: order.materials,
      amount: order.amount.toString(),
      gst: order.gst,
      customerPhone: order.customerPhone || ''
    });
    setShowAddOrder(true);
  };

  const resetForm = () => {
    setFormData({
      productName: '',
      quantity: '',
      deadline: '',
      materials: '',
      amount: '',
      gst: '18',
      customerPhone: selectedCustomer?.phoneNumber || ''
    });
    setCurrentOrder(null);
  };

  const filteredOrders = (showCompleted ? completedOrders : orders).filter(order => {
    const searchLower = searchQuery.toLowerCase();
    return (
      (order.productName?.toLowerCase() || '').includes(searchLower) ||
      (order.materials?.toLowerCase() || '').includes(searchLower) ||
      (order.customerPhone || '').includes(searchLower)
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
          <p className="text-gray-600 mb-6">Please sign in to view and manage orders.</p>
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

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-600">{error}</div>
      </div>
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
        <h1 className="text-2xl font-semibold">Orders</h1>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Archive className="w-5 h-5" />
            <span>{showCompleted ? 'Show Active Orders' : 'Show Completed Orders'}</span>
          </button>
          {!showCompleted && (
            <button
              onClick={() => {
                resetForm();
                setShowAddOrder(true);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Add Order</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex space-x-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button className="px-4 py-2 border border-gray-300 rounded-lg flex items-center space-x-2 hover:bg-gray-50">
          <Filter className="w-5 h-5" />
          <span>Filter</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deadline
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Materials
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {showCompleted ? 'Completed Date' : 'Progress'}
                </th>
                {!showCompleted && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                    No orders found
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className={order.status === 'Completed' ? 'bg-green-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">{order.productName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{order.customerPhone || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{order.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{order.deadline}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{order.materials}</td>
                    <td className="px-6 py-4 whitespace-nowrap">₹{order.amount}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {order.status === 'Completed' ? (
                        <span className="text-green-600">
                          {new Date(order.paymentDate!).toLocaleDateString()}
                        </span>
                      ) : (
                        <div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-blue-600 h-2.5 rounded-full"
                              style={{ width: order.completionPercentage || '0%' }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-500 mt-1">
                            {order.completionPercentage || '0%'}
                          </span>
                        </div>
                      )}
                    </td>
                    {!showCompleted && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => handleEdit(order)}
                          className="text-blue-600 hover:text-blue-800 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(order.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showAddOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-lg w-full"
          >
            <h2 className="text-xl font-semibold mb-4">
              {currentOrder ? 'Edit Order' : 'Add New Order'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Product Name</label>
                <input
                  type="text"
                  name="productName"
                  value={formData.productName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Customer Phone</label>
                <input
                  type="tel"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Deadline</label>
                <input
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Materials</label>
                <input
                  type="text"
                  name="materials"
                  value={formData.materials}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Amount</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddOrder(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {currentOrder ? 'Update Order' : 'Add Order'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}