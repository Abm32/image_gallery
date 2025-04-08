import React from 'react';
import { NavLink } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Heart } from 'lucide-react';

const footerLinks = [
  { label: 'Home', path: '/' },
  { label: 'Orders', path: '/orders' },
  { label: 'Customers', path: '/customers' },
  { label: 'Tasks', path: '/tasks' },
  { label: 'Finance', path: '/finance' },
];

const socialLinks = [
  { icon: Facebook, url: 'https://www.facebook.com', label: 'Facebook' },
  { icon: Twitter, url: 'https://www.twitter.com', label: 'Twitter' },
  { icon: Instagram, url: 'https://www.instagram.com', label: 'Instagram' },
  { icon: Linkedin, url: 'https://www.linkedin.com', label: 'LinkedIn' },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 py-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Navigation Links */}
          <div>
            <h3 className="text-gray-800 font-semibold mb-4">Quick Links</h3>
            <nav className="flex flex-col space-y-2">
              {footerLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-gray-800 font-semibold mb-4">Connect With Us</h3>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-gray-800 font-semibold mb-4">Contact</h3>
            <div className="space-y-2 text-gray-600">
              <p>Email: support@printflow.com</p>
              <p>Phone: +1 (555) 123-4567</p>
              <p>Hours: Mon-Fri 9am-6pm</p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 text-sm">
              &copy; {currentYear} PrintFlow. All rights reserved.
            </p>
            <div className="flex items-center space-x-1 text-sm text-gray-600 mt-2 md:mt-0">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500" />
              <span>by PrintFlow Team</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}