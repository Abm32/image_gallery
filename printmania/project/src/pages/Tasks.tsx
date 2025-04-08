import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, CheckCircle, Clock, AlertCircle, Package, ChevronRight, DollarSign, Archive } from 'lucide-react';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { addHistoryItem } from '../utils/history';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setTasks, addTask, updateTask, deleteTask, setLoading, setError } from '../store/slices/tasksSlice';
import { notify } from '../utils/notifications';

interface Task {
  id: string;
  orderId: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  deadline: string;
  priority: 'low' | 'medium' | 'high';
  userId: string;
  orderDetails?: {
    productName: string;
    quantity: number;
    deadline: string;
  };
}

interface Order {
  id: string;
  productName: string;
  quantity: number;
  deadline: string;
  materials: string;
  status: string;
  amount: number;
  completionPercentage: string;
  paymentReceived?: boolean;
  paymentDate?: string;
}

export default function Tasks() {
  const [showAddTask, setShowAddTask] = useState(false);
  const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const { currentUser } = useAuth();
  const dispatch = useAppDispatch();

  const tasks = useAppSelector(state => state.tasks.items);
  const loading = useAppSelector(state => state.tasks.loading);
  const error = useAppSelector(state => state.tasks.error);
  const orders = useAppSelector(state => 
    state.orders.items.filter(order => order.status !== 'Completed')
  );
  const completedOrders = useAppSelector(state => 
    state.orders.items.filter(order => order.status === 'Completed')
  );

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    priority: 'medium' as const,
  });

  useEffect(() => {
    if (!currentUser) return;

    dispatch(setLoading(true));

    if (selectedOrder) {
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('userId', '==', currentUser.uid),
        where('orderId', '==', selectedOrder.id),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(tasksQuery, (snapshot) => {
        const taskData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Task[];
        
        // Deduplicate tasks based on id
        const uniqueTasks = Array.from(
          new Map(taskData.map(task => [task.id, task])).values()
        );
        
        dispatch(setTasks(uniqueTasks));
        dispatch(setLoading(false));

        if (uniqueTasks.length > 0 && uniqueTasks.every(task => task.status === 'completed')) {
          setShowPaymentConfirm(true);
        }
      }, (error) => {
        dispatch(setError(error.message));
        dispatch(setLoading(false));
      });

      return () => unsubscribe();
    } else {
      dispatch(setLoading(false));
    }
  }, [currentUser, selectedOrder, dispatch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedOrder) return;

    try {
      const taskData = {
        ...formData,
        userId: currentUser.uid,
        orderId: selectedOrder.id,
        status: 'pending' as const,
        createdAt: new Date().toISOString(),
        orderDetails: {
          productName: selectedOrder.productName,
          quantity: selectedOrder.quantity,
          deadline: selectedOrder.deadline
        }
      };

      const taskRef = await addDoc(collection(db, 'tasks'), taskData);
      const newTask = { id: taskRef.id, ...taskData };
      
      // Only dispatch addTask if the task doesn't already exist
      if (!tasks.some(task => task.id === taskRef.id)) {
        dispatch(addTask(newTask));
      }
      
      await addHistoryItem({
        type: 'Task Created',
        title: taskData.title,
        details: `Created new task: ${taskData.title}`,
        userId: currentUser.uid,
        orderId: selectedOrder.id,
        taskId: taskRef.id
      });

      await updateDoc(doc(db, 'orders', selectedOrder.id), {
        status: 'In Progress',
        completionPercentage: '0%'
      });

      notify.success('Task created successfully');
      setShowAddTask(false);
      resetForm();
    } catch (error) {
      console.error('Error saving task:', error);
      notify.error('Failed to save task. Please try again.');
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: Task['status']) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task || !selectedOrder) return;

      await updateDoc(doc(db, 'tasks', taskId), {
        status: newStatus
      });

      dispatch(updateTask({ ...task, status: newStatus }));

      await addHistoryItem({
        type: newStatus === 'completed' ? 'Task Completed' : 'Task Updated',
        title: task.title,
        details: `Task status changed to ${newStatus}`,
        userId: currentUser.uid,
        orderId: task.orderId,
        taskId: taskId
      });

      notify.success(`Task ${newStatus === 'completed' ? 'completed' : 'updated'} successfully`);

      const completedTasks = tasks.filter(t => t.status === 'completed' || (t.id === taskId && newStatus === 'completed')).length;
      const totalTasks = tasks.length;
      const completionPercentage = Math.round((completedTasks / totalTasks) * 100);

      await updateDoc(doc(db, 'orders', selectedOrder.id), {
        completionPercentage: `${completionPercentage}%`,
        status: completionPercentage === 100 ? 'Ready for Payment' : 'In Progress'
      });

      if (completionPercentage === 100) {
        setShowPaymentConfirm(true);
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      notify.error('Failed to update task status. Please try again.');
    }
  };

  const handlePaymentConfirm = async () => {
    if (!selectedOrder) return;

    try {
      await updateDoc(doc(db, 'orders', selectedOrder.id), {
        status: 'Completed',
        paymentReceived: true,
        paymentDate: new Date().toISOString()
      });

      await addHistoryItem({
        type: 'Payment Received',
        title: selectedOrder.productName,
        details: `Payment received for order: ${selectedOrder.productName}`,
        userId: currentUser.uid,
        orderId: selectedOrder.id
      });

      notify.success('Payment confirmed successfully');
      setShowPaymentConfirm(false);
      setSelectedOrder(null);
    } catch (error) {
      console.error('Error confirming payment:', error);
      notify.error('Failed to confirm payment. Please try again.');
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      await addHistoryItem({
        type: 'Task Deleted',
        title: task.title,
        details: `Deleted task: ${task.title}`,
        userId: currentUser.uid,
        orderId: task.orderId,
        taskId: taskId
      });

      await deleteDoc(doc(db, 'tasks', taskId));
      dispatch(deleteTask(taskId));
      notify.success('Task deleted successfully');
    } catch (error) {
      console.error('Error deleting task:', error);
      notify.error('Failed to delete task. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      deadline: '',
      priority: 'medium'
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
          <p className="text-gray-600 mb-6">Please sign in to view and manage tasks.</p>
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

  if (!selectedOrder) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="space-y-6"
      >
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Orders</h1>
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Archive className="w-5 h-5" />
            <span>{showCompleted ? 'Show Active Orders' : 'Show Completed Orders'}</span>
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(showCompleted ? completedOrders : orders).map((order, index) => (
              <motion.div
                key={`order-${order.id}-${index}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedOrder(order)}
                className={`bg-white p-6 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-all ${
                  order.status === 'Completed' ? 'border-l-4 border-green-500' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <Package className={`w-6 h-6 ${order.status === 'Completed' ? 'text-green-600' : 'text-blue-600'}`} />
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{order.productName}</h3>
                <p className="text-sm text-gray-500 mb-4">Quantity: {order.quantity}</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Deadline</span>
                    <span className="font-medium">{order.deadline}</span>
                  </div>
                  {order.status === 'Completed' ? (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Completed On</span>
                      <span className="font-medium text-green-600">
                        {new Date(order.paymentDate!).toLocaleDateString()}
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: order.completionPercentage || '0%' }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Progress</span>
                        <span className="font-medium">{order.completionPercentage || '0%'}</span>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
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
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSelectedOrder(null)}
            className="text-gray-600 hover:text-gray-800"
          >
            <ChevronRight className="w-6 h-6 transform rotate-180" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold">{selectedOrder.productName}</h1>
            <p className="text-sm text-gray-500">Tasks for Order #{selectedOrder.id}</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddTask(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Task</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Pending</h2>
            <Clock className="text-yellow-500" />
          </div>
          <div className="space-y-4">
            {tasks
              .filter(task => task.status === 'pending')
              .map((task, index) => (
                <div
                  key={`pending-${task.id}-${index}`}
                  className="p-4 bg-gray-50 rounded-lg border-l-4 border-yellow-500"
                >
                  <h3 className="font-medium">{task.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-gray-500">Due: {task.deadline}</span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleStatusChange(task.id, 'in-progress')}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Start
                      </button>
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">In Progress</h2>
            <AlertCircle className="text-blue-500" />
          </div>
          <div className="space-y-4">
            {tasks
              .filter(task => task.status === 'in-progress')
              .map((task, index) => (
                <div
                  key={`in-progress-${task.id}-${index}`}
                  className="p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500"
                >
                  <h3 className="font-medium">{task.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-gray-500">Due: {task.deadline}</span>
                    <button
                      onClick={() => handleStatusChange(task.id, 'completed')}
                      className="text-green-600 hover:text-green-800"
                    >
                      Complete
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Completed</h2>
            <CheckCircle className="text-green-500" />
          </div>
          <div className="space-y-4">
            {tasks
              .filter(task => task.status === 'completed')
              .map((task, index) => (
                <div
                  key={`completed-${task.id}-${index}`}
                  className="p-4 bg-gray-50 rounded-lg border-l-4 border-green-500"
                >
                  <h3 className="font-medium">{task.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-gray-500">Completed</span>
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {showAddTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-lg w-full"
          >
            <h2 className="text-xl font-semibold mb-4">Add New Task</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
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
                <label className="block text-sm font-medium text-gray-700">Priority</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddTask(false);
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
                  Add Task
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {showPaymentConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-md w-full"
          >
            <div className="text-center">
              <DollarSign className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Payment Confirmation</h2>
              <p className="text-gray-600 mb-6">
                All tasks for order "{selectedOrder.productName}" are completed. Has the payment been received?
              </p>
              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => setShowPaymentConfirm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Not Yet
                </button>
                <button
                  onClick={handlePaymentConfirm}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Confirm Payment
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}