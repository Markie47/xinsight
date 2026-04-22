import React from 'react';

export default function Terms() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fade-in-up">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-14">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Terms of Service</h1>
        <p className="text-gray-400 font-medium mb-10 border-b border-gray-100 pb-8 uppercase tracking-wider text-sm">Effective Date: March 2026</p>
        
        <div className="space-y-8 text-gray-700 leading-relaxed text-lg">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="mb-4">By accessing and using the X-Insight platform (including the Upload Portal, Doctor Portal, and Patient Portal), you agree to comply with and be strictly bound by these Terms of Service. If you do not agree to these terms, you must refrain from using our radiological analysis systems.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-red-500 font-black">!</span> 2. No Medical Liability
            </h2>
            <p className="mb-4 text-gray-900 font-medium p-6 bg-red-50 border border-red-100 rounded-xl">
              X-Insight utilizes complex Neural Networks and BioBERT NLP to generate purely <strong>assistive</strong> radiological interpretations and heatmaps. It is <strong>NOT</strong> a certified final diagnostic tool. Any outputs, probability scores, or synthesized reports MUST be manually validated by a licensed physician or radiologist before a clinical diagnosis or treatment path is established. X-Insight bears zero liability for clinical misdiagnoses.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Permitted Platform Usage</h2>
            <p className="mb-4">You agree to use this system to upload valid DICOM or medical image arrays solely for professional, clinical, or authorized diagnostic purposes. You agree not to upload maliciously corrupted files to breach the model pipeline, deliberately reverse-engineer the explainable AI algorithms, or overload our inference servers.</p>
          </section>
          
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Intellectual Property</h2>
            <p>The proprietary Deep Learning models, BioBERT-based validation flows, visual interface designs, and architecture of X-Insight remain the exclusive intellectual property of the X-Insight development organization.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
