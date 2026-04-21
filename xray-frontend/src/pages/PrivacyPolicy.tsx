import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fade-in-up">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-14">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Privacy Policy</h1>
        <p className="text-gray-400 font-medium mb-10 border-b border-gray-100 pb-8 uppercase tracking-wider text-sm">Effective Date: March 2026</p>
        
        <div className="space-y-8 text-gray-700 leading-relaxed text-lg">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
            <p className="mb-4">Welcome to X-Insight. This Privacy Policy describes how we collect, use, and protect your information when you use our AI-powered medical X-ray interpretation system. We are deeply committed to maintaining the highest standards of confidentiality and security for all medical, radiological, and personal data handled by our platform.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
            <ul className="list-disc pl-6 space-y-3 marker:text-blue-500">
              <li><strong>Medical Imagery:</strong> DICOM and standard image formats (.jpeg, .png) uploaded for Neural Network classification and heatmap generation.</li>
              <li><strong>Clinical Data:</strong> Findings synthesized by our BioBERT validation backend and multi-label pathology flags.</li>
              <li><strong>Account Credentials:</strong> Securely hashed information verifying roles for the Doctor Portal, Patient Portal, and Admin Dashboard.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Data Usage & Processing</h2>
            <p className="mb-4">Your image data is processed strictly to provide automated radiological insights. Medical imagery is temporarily securely buffered in memory during active neural network inference, and diagnostic outputs are directly mapped back to secure, authenticated user sessions. We strictly do not use patient imagery to train core neural models without explicit, separate consent, and we do not sell your data under any circumstances.</p>
          </section>
          
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Contact Us</h2>
            <p>If you have any questions, compliance requests, or concerns regarding your data, please reach out to our privacy operations response team securely at <a href="mailto:privacy@x-insight.tech" className="text-blue-600 font-medium hover:underline">privacy@x-insight.tech</a>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
