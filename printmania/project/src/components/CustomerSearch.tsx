import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, UserPlus, Phone, Mail, MapPin, Briefcase, Package, Clock } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc, orderBy, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setCustomers, addCustomer, setSelectedCustomer, setSearchQuery } from '../store/slices/customersSlice';
import { notify } from '../utils/notifications';
import { useNavigate } from 'react-router-dom';

export default function CustomerSearch() {
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [customerOrders, setCustomerOrders] = useState<any[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const { currentUser } = useAuth();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const searchQuery = useAppSelector(state => state.customers.searchQuery);
  const customers = useAppSelector(state => state.customers.items);

  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    email: '',
    address: '',
    job: ''
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchCustomers = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        setShowResults(false);
        return;
      }

      const customersRef = collection(db, 'customers');
      const phoneQuery = query(
        customersRef,
        where('userId', '==', currentUser?.uid),
        where('phoneNumber', '>=', searchQuery),
        where('phoneNumber', '<=', searchQuery + '\uf8ff')
      );

      const nameQuery = query(
        customersRef,
        where('userId', '==', currentUser?.uid),
        where('name', '>=', searchQuery.toLowerCase()),
        where('name', '<=', searchQuery.toLowerCase() + '\uf8ff')
      );

      try {
        const [phoneSnapshot, nameSnapshot] = await Promise.all([
          getDocs(phoneQuery),
          getDocs(nameQuery)
        ]);

        const phoneResults = phoneSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const nameResults = nameSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Combine and deduplicate results
        const combinedResults = [...phoneResults];
        nameResults.forEach(nameResult => {
          if (!combinedResults.find(r => r.id === nameResult.id)) {
            combinedResults.push(nameResult);
          }
        });

        setSearchResults(combinedResults);
        setShowResults(true);
      } catch (error) {
        console.error('Error searching customers:', error);
        notify.error('Failed to search customers');
      }
    };

    // Only search if we have at least 2 characters
    if (searchQuery.length >= 2) {
      searchCustomers();
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [searchQuery, currentUser]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'searchQuery') {
      dispatch(setSearchQuery(value));
      // Show results dropdown as soon as user starts typing
      setShowResults(true);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const fetchCustomerOrders = async (customerId: string) => {
    try {
      const ordersQuery = query(
        collection(db, 'orders'),
        where('customerId', '==', customerId),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(ordersQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching customer orders:', error);
      return [];
    }
  };

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      const customerData = {
        ...formData,
        userId: currentUser.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'customers'), customerData);
      const newCustomer = { id: docRef.id, ...customerData };
      
      dispatch(addCustomer(newCustomer));
      dispatch(setSelectedCustomer(newCustomer));
      
      setShowAddCustomer(false);
      setFormData({
        name: '',
        phoneNumber: '',
        email: '',
        address: '',
        job: ''
      });
      
      notify.success('Customer added successfully');
      navigate('/orders');
    } catch (error) {
      console.error('Error adding customer:', error);
      notify.error('Failed to add customer');
    }
  };

  const handleSelectCustomer = async (customer: any) => {
    dispatch(setSelectedCustomer(customer));
    const orders = await fetchCustomerOrders(customer.id);
    setCustomerOrders(orders);
    setShowResults(false);
    navigate(`/customer/${customer.id}`);
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          name="searchQuery"
          value={searchQuery}
          onChange={handleInputChange}
          placeholder="Search customers by name or phone number..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <AnimatePresence>
        {showResults && searchQuery.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute w-full mt-2 bg-white rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
          >
            {searchResults.length > 0 ? (
              searchResults.map((customer) => (
                <div
                  key={customer.id}
                  onClick={() => handleSelectCustomer(customer)}
                  className="p-4 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{customer.name}</h3>
                      <p className="text-sm text-gray-500">{customer.phoneNumber}</p>
                    </div>
                    <button className="text-blue-600 hover:text-blue-800 text-sm">
                      View Details
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4">
                <p className="text-gray-600 mb-2">No customers found</p>
                <button
                  onClick={() => {
                    setShowAddCustomer(true);
                    setFormData(prev => ({
                      ...prev,
                      phoneNumber: searchQuery
                    }));
                  }}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Add New Customer</span>
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {showAddCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-lg w-full mx-4"
          >
            <h2 className="text-xl font-semibold mb-4">Add New Customer</h2>
            <form onSubmit={handleAddCustomer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number *</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="block w-full pl-10 rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="block w-full pl-10 rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="block w-full pl-10 rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Job</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Briefcase className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="job"
                    value={formData.job}
                    onChange={handleInputChange}
                    className="block w-full pl-10 rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddCustomer(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add Customer
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}