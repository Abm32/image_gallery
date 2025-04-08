import React from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Linkedin, Github } from 'lucide-react';

export default function Footer() {
  return (
    <div className="w-full bg-gray-900">
      <footer className="text-white py-12 mt-15">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold">Research Hub</h3>
              <p className="mt-4 text-gray-400">Empowering researchers worldwide.</p>
            </div>
            <div>
              <h3 className="text-xl font-bold">Quick Links</h3>
              <ul className="mt-4 space-y-2">
                <li><Link to="/journey" className="text-gray-400 hover:text-white transition-colors">Start Your Journey</Link></li>
                <li><Link to="/communities" className="text-gray-400 hover:text-white transition-colors">Explore Communities</Link></li>
                <li><Link to="/resources" className="text-gray-400 hover:text-white transition-colors">Resources</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold">Contact Us</h3>
              <p className="mt-4 text-gray-400">Email: support@researchhub.com</p>
              <p className="text-gray-400">Phone: +1 (123) 456-7890</p>
            </div>
            <div>
              <h3 className="text-xl font-bold">Follow Us</h3>
              <div className="mt-4 flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Twitter className="w-6 h-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Linkedin className="w-6 h-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Github className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}