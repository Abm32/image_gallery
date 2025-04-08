import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, FileText, CheckSquare, PieChart, History, Printer, Users } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

const navItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: FileText, label: 'Orders', path: '/orders' },
  { icon: Users, label: 'Customers', path: '/customers' },
  { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
  { icon: PieChart, label: 'Finance', path: '/finance' },
  { icon: History, label: 'History', path: '/history' },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <div className="p-6">
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => window.location.href = '/'}>
          <Printer className="w-8 h-8 text-blue-600" />
          <span className="text-xl font-bold">PrintFlow</span>
        </div>
      </div>
      <nav className="mt-6">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              twMerge(
                'flex items-center space-x-3 px-6 py-3 text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors',
                isActive && 'text-blue-600 bg-blue-50 border-r-4 border-blue-600'
              )
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}