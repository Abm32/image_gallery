import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Orders from './pages/Orders';
import Tasks from './pages/Tasks';
import Finance from './pages/Finance';
import History from './pages/History';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import CustomerDetails from './pages/CustomerDetails';
import OrderDetails from './pages/OrderDetails';
import Customers from './pages/Customers';
import { AuthProvider, useAuth } from './context/AuthContext';
import useCheckProductKey from './hooks/useCheckProductKey';
import Footer from './components/Footer';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  useCheckProductKey();
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/auth" element={
        isAuthenticated ? <Navigate to="/" replace /> : <Auth />
      } />
      <Route
        path="/*"
        element={
          <PrivateRoute>
            <div className="flex">
              <Sidebar />
              <div className="flex-1">
                <Navbar />
                <main className="p-6">
                  <AnimatePresence mode="wait">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/orders" element={<Orders />} />
                      <Route path="/orders/:orderId" element={<OrderDetails />} />
                      <Route path="/customers" element={<Customers />} />
                      <Route path="/customer/:id" element={<CustomerDetails />} />
                      <Route path="/tasks" element={<Tasks />} />
                      <Route path="/finance" element={<Finance />} />
                      <Route path="/history" element={<History />} />
                      <Route path="/profile" element={<Profile />} />
                    </Routes>
                  </AnimatePresence>
                </main>
                <Footer />
              </div>
            </div>
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;