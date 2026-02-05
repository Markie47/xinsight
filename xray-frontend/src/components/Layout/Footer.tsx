import React from 'react';
import { Activity, Mail, Phone, MapPin } from 'lucide-react';

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
                <span className="text-sm">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <Mail className="h-4 w-4" />
                <span className="text-sm">contact@x-insight.com</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Platform</h3>
            <ul className="space-y-2">
              <li><a href="/upload" className="text-gray-300 hover:text-blue-400 transition-colors duration-200">Upload X-Ray</a></li>
              <li><a href="/explainable-ai" className="text-gray-300 hover:text-blue-400 transition-colors duration-200">Explainable AI</a></li>
              <li><a href="/information" className="text-gray-300 hover:text-blue-400 transition-colors duration-200">Information</a></li>
              <li><a href="/login" className="text-gray-300 hover:text-blue-400 transition-colors duration-200">Login</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal & Privacy</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-blue-400 transition-colors duration-200">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-300 hover:text-blue-400 transition-colors duration-200">HIPAA Compliance</a></li>
              <li><a href="#" className="text-gray-300 hover:text-blue-400 transition-colors duration-200">Terms of Service</a></li>
              <li><a href="#" className="text-gray-300 hover:text-blue-400 transition-colors duration-200">Data Security</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 X-Insight. All rights reserved. HIPAA & GDPR Compliant.
            </p>
            <div className="flex items-center space-x-2 text-gray-400 text-sm mt-4 md:mt-0">
              <MapPin className="h-4 w-4" />
              <span>Healthcare Innovation Center, Medical District</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}