import React from 'react';      
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer'
import Home from './pages/Home';
import Upload from './pages/Upload';
import Login from './pages/Login';
import ExplainableAI from './pages/ExplainableAI';
import Information from './pages/Information';
import PatientPortal from './pages/PatientPortal';
import DoctorPortal from './pages/DoctorPortal';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/login" element={<Login />} />
              <Route path="/explainable-ai" element={<ExplainableAI />} />
              <Route path="/information" element={<Information />} />
              <Route path="/patient-portal" element={<PatientPortal />} />
              <Route path="/doctor-portal" element={<DoctorPortal />} />
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;