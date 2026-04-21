import React from 'react';

export default function HIPAA() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fade-in-up">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-14">
        <h1 className="text-4xl font-extrabold text-blue-900 mb-4 tracking-tight">HIPAA Compliance</h1>
        <p className="text-gray-400 font-medium mb-10 border-b border-gray-100 pb-8 uppercase tracking-wider text-sm">Regulatory & Protected Health Information (PHI)</p>
        
        <div className="space-y-8 text-gray-700 leading-relaxed text-lg">
          <section>
            <h2 className="text-2xl font-bold text-blue-900 mb-4">Our Commitment to HIPAA</h2>
            <p className="mb-4">As a cloud-first radiological interpretation service, X-Insight processes highly sensitive Protected Health Information (PHI). We have engineered our entire pipeline, from the Upload Portal up to our BioBERT analytical backend, according to the strict security, privacy, and breach notification directives set out by the Health Insurance Portability and Accountability Act (HIPAA) and the HITECH Act.</p>
          </section>

          <section className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
            <h2 className="text-2xl font-bold text-blue-900 mb-4">Core Compliance Operations</h2>
            <div className="space-y-4">
              <div>
                <strong className="text-blue-800">1. DICOM Anonymization:</strong>
                <p className="text-sm mt-1">Our image processing middleware supports the extraction or scrubbing of hardcoded patient attributes from DICOM headers prior to generating deep-learning inference to limit unnecessary PHI exposure to prediction layers.</p>
              </div>
              <div>
                <strong className="text-blue-800">2. Audit Controls:</strong>
                <p className="text-sm mt-1">Every authentication attempt, diagnostic test, and patient record query executed within the Doctor Portal or Patient Portal is securely logged to fulfill HIPAA auditing criteria natively.</p>
              </div>
              <div>
                <strong className="text-blue-800">3. Business Associate Agreements (BAA):</strong>
                <p className="text-sm mt-1">We enforce standard BAAs with all of our specialized cloud hosting providers (e.g., AWS / Azure / GCP) where our backend neural networks and secure databases are deployed, legally binding them to identical HIPAA PHI safety standards.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-blue-900 mb-4">Incident Response</h2>
            <p className="mb-4">X-Insight maintains an automated threat monitoring matrix. In the profoundly unlikely event of unauthorized interference with the clinical platform, automated protocols exist to severe API bridges and alert security teams pursuant to the HIPAA Breach Notification Rule.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
