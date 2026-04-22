import React from 'react';

export default function DataSecurity() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fade-in-up">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-14">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Data Security</h1>
        <p className="text-gray-400 font-medium mb-10 border-b border-gray-100 pb-8 uppercase tracking-wider text-sm">Operations Protocol & Architecture</p>
        
        <div className="space-y-8 text-gray-700 leading-relaxed text-lg">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">End-to-End Encryption Architecture</h2>
            <p className="mb-4">X-Insight ensures that all patient diagnostic data is secured using military-grade cryptographic protocols. Every connection made from our user interface to our inference backends (e.g., hitting the `/predict` endpoints) utilizes Transport Layer Security (TLS 1.3) to prevent data interception during transmission over the network.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Backend Data Isolation</h2>
            <p className="mb-4">
              Our neural network inference models operate within isolated containerized environments. When an image is received:
            </p>
            <ul className="list-disc pl-6 space-y-3 marker:text-emerald-500 bg-slate-50 p-6 rounded-xl border border-slate-100">
              <li>It is temporarily held in protected memory buffers.</li>
              <li>Calculations producing multi-label outputs and Grad-CAM heatmaps are performed instantly.</li>
              <li>The buffer is subsequently purged from inference nodes to prevent unauthorized persistence.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Role-Based Access Control (RBAC)</h2>
            <p className="mb-4">Data visibility is strictly controlled by cryptographic token sessions linking accounts directly to their operational roles. Users on the Patient Portal have zero capability to access data from other patients, while the Doctor Portal and Admin Dashboard enforce strict verification thresholds before querying any repository logs.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
