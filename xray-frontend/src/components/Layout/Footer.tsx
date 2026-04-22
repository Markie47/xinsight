import React from 'react';
import { Activity, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Activity className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-bold">X-Insight</span>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              AI-powered medical X-ray interpretation and reporting system, 
              designed to assist healthcare professionals with accurate, 
              explainable diagnostic insights.
            </p>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2 text-gray-300">
                <Phone className="h-4 w-4" />
                <span className="text-sm">+91 9972356748</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <Mail className="h-4 w-4" />
                <span className="text-sm">crce@gmail.com</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Platform</h3>
            <ul className="space-y-2">
              <li><Link to="/upload" className="text-gray-300 hover:text-blue-400 transition-colors duration-200">Upload X-Ray</Link></li>
              <li><Link to="/history" className="text-gray-300 hover:text-blue-400 transition-colors duration-200">Patient History</Link></li>
              <li><Link to="/information" className="text-gray-300 hover:text-blue-400 transition-colors duration-200">Learn More</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal & Privacy</h3>
            <ul className="space-y-2">
              <li><Link to="/privacy" className="text-gray-300 hover:text-blue-400 transition-colors duration-200">Privacy Policy</Link></li>
              <li><Link to="/hipaa" className="text-gray-300 hover:text-blue-400 transition-colors duration-200">HIPAA Compliance</Link></li>
              <li><Link to="/terms" className="text-gray-300 hover:text-blue-400 transition-colors duration-200">Terms of Service</Link></li>
              <li><Link to="/data-security" className="text-gray-300 hover:text-blue-400 transition-colors duration-200">Data Security</Link></li>
            </ul>
          </div>
        </div>
        
        
      </div>
    </footer>
  );
}