import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, User, LogOut } from 'lucide-react';
import { useAuth } from './auth/AuthContext';
import { auth } from '../config/firebase';

export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-indigo-600">ResearchQuest</span>
            </Link>
            {user && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link to="/communities" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md">
                  Communities
                </Link>
                <Link to="/resources" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md">
                  Resources
                </Link>
                <Link to="/journey" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md">
                  Research Journey
                </Link>
              </div>
            )}
          </div>
          
          <div className="flex items-center">
            {user ? (
              <>
                <div className="flex-shrink-0">
                  <button className="p-2 rounded-full text-gray-500 hover:text-indigo-600">
                    <Search className="h-6 w-6" />
                  </button>
                  <button className="p-2 rounded-full text-gray-500 hover:text-indigo-600">
                    <Bell className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="ml-3 relative flex items-center space-x-4">
                  <Link to="/profile" className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                      {user.photoURL ? (
                        <img className="h-8 w-8 rounded-full" src={user.photoURL} alt="" />
                      ) : (
                        <User className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{user.displayName}</span>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="p-2 rounded-full text-gray-500 hover:text-indigo-600"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md"
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}