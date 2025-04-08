import React, { useState, useRef, useEffect } from 'react';
import { User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import NotificationCenter from './NotificationCenter';

export default function Navbar() {
  const { currentUser } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <nav className="bg-white border-b border-gray-200 px-6 py-3 fixed top-0 left-0 right-0 z-50">
        <div className="flex justify-between items-center">
          <h1 
            onClick={() => navigate('/')} 
            className="text-2xl font-semibold text-gray-800 cursor-pointer hover:text-gray-600"
          >
            Print Mania
          </h1>
          <div className="flex items-center space-x-4">
            <NotificationCenter />
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-full"
              >
                <User className="w-6 h-6 text-gray-600" />
              </button>
              
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
                  <button
                    onClick={() => {
                      navigate('/profile');
                      setShowDropdown(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    Profile
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
      {/* Add spacing to prevent content from going under navbar */}
      <div className="h-[4.5rem]"></div>
    </>
  );
}
