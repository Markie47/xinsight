import React from 'react';
import { BookOpen, Shield, Users, Zap, CheckCircle, AlertTriangle, Heart, Bone } from 'lucide-react';

export default function Information() {
  const conditions = [
    {
      name: 'Pneumonia',
      description: 'Infection that inflames air sacs in one or both lungs',
      symptoms: 'Cough, fever, difficulty breathing, chest pain',
      xrayFindings: 'Consolidation, air bronchograms, pleural effusion',
      icon: Heart,
      color: 'red'
    },
    {
      name: 'Osteoporosis',
      description: 'A condition characterized by decreased bone mass and deterioration of bone tissue',
      symptoms: 'back pain, loss of height, stooped posture',
      xrayFindings: 'Decreased Bone density, cortical thinning',
      icon: Bone, // (Make sure to import { Bone } from 'lucide-react')
      color: 'slate',
    },
    {
      name: 'Fractures',
      description: 'Breaks or cracks in bone structure',
      symptoms: 'Pain, swelling, deformity, inability to bear weight',
      xrayFindings: 'Cortical disruption, bone displacement, callus formation',
      icon: Bone,
      color: 'blue'
    },
    {
      name: 'Pleural Effusion',
      description: 'Excess fluid accumulation in pleural space',
      symptoms: 'Shortness of breath, chest pain, dry cough',
      xrayFindings: 'Fluid level, blunted costophrenic angles, mediastinal shift',
      icon: Heart,
      color: 'teal'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-12 relative overflow-hidden">
      {/* Background blobs for depth */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-blue-100/40 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-50/40 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 pt-8">
          <div className="flex justify-center mb-6">
            <div className="bg-white p-4 justify-center items-center rounded-2xl shadow-sm border border-slate-100 inline-flex">
              <BookOpen className="h-10 w-10 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-indigo-900 mb-6 tracking-tight">
            Medical X-Ray Information & Awareness
          </h1>
          <p className="text-lg md:text-xl text-slate-600 font-medium max-w-3xl mx-auto leading-relaxed">
            Learn about common X-ray findings, how AI assists radiologists, 
            and our commitment to data privacy and security.
          </p>
        </div>

        {/* How AI Assists Radiologists */}
        <div className="bg-white rounded-xl shadow-md border border-slate-100 p-8 sm:p-10 mb-12 hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-2xl font-bold text-indigo-900 mb-8 border-b border-slate-100 pb-4">
            How AI Assists Radiologists
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="bg-slate-50 border border-slate-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
                <Zap className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-indigo-900 mb-2">Speed</h3>
              <p className="text-slate-600 text-sm font-medium leading-relaxed">
                Rapid initial screening and triage of X-ray images, reducing interpretation time from hours to seconds.
              </p>
            </div>
            <div className="text-center group">
              <div className="bg-slate-50 border border-slate-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
                <CheckCircle className="h-7 w-7 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-indigo-900 mb-2">Accuracy</h3>
              <p className="text-slate-600 text-sm font-medium leading-relaxed">
                High sensitivity for detecting subtle abnormalities that might be missed in initial review.
              </p>
            </div>
            <div className="text-center group">
              <div className="bg-slate-50 border border-slate-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
                <Users className="h-7 w-7 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-indigo-900 mb-2">Consistency</h3>
              <p className="text-slate-600 text-sm font-medium leading-relaxed">
                Standardized analysis approach that reduces inter-observer variability and human error.
              </p>
            </div>
            <div className="text-center group">
              <div className="bg-slate-50 border border-slate-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
                <AlertTriangle className="h-7 w-7 text-orange-600" />
              </div>
              <h3 className="text-lg font-bold text-indigo-900 mb-2">Early Detection</h3>
              <p className="text-slate-600 text-sm font-medium leading-relaxed">
                Identification of early-stage pathologies and critical findings requiring immediate attention.
              </p>
            </div>
          </div>
        </div>

        {/* Common X-Ray Conditions */}
        <div className="bg-white rounded-xl shadow-md border border-slate-100 p-8 sm:p-10 mb-12 hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-2xl font-bold text-indigo-900 mb-8 border-b border-slate-100 pb-4">
            Common X-Ray Abnormalities
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {conditions.map((condition, index) => {
              const IconComponent = condition.icon;
              return (
                <div key={index} className="bg-slate-50 border border-slate-100 rounded-xl p-6 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-start space-x-5">
                    <div className={`bg-${condition.color}-100 w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border border-${condition.color}-200/50`}>
                      <IconComponent className={`h-7 w-7 text-${condition.color}-600`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-indigo-900 mb-2">{condition.name}</h3>
                      <p className="text-slate-600 text-sm mb-4 font-medium">{condition.description}</p>
                      
                      <div className="space-y-4 bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
                        <div>
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">Symptoms</span>
                          <p className="text-sm text-slate-700 font-medium">{condition.symptoms}</p>
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">X-Ray Findings</span>
                          <p className="text-sm text-slate-700 font-medium">{condition.xrayFindings}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Privacy and Security */}
        <div className="bg-white rounded-xl shadow-md border border-slate-100 p-8 sm:p-10 mb-12 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center space-x-4 mb-8 border-b border-slate-100 pb-4">
            <div className="bg-emerald-100 p-3 rounded-xl border border-emerald-200/50">
              <Shield className="h-8 w-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-indigo-900">
              Privacy & Data Security
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
              <h3 className="text-xl font-bold text-indigo-900 mb-6">HIPAA Compliance</h3>
              <ul className="space-y-4">
                <li className="flex items-start space-x-3 group">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="text-slate-700 font-medium">End-to-end encryption for all medical data transmission</span>
                </li>
                <li className="flex items-start space-x-3 group">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="text-slate-700 font-medium">Secure audit trails for all access and modifications</span>
                </li>
                <li className="flex items-start space-x-3 group">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="text-slate-700 font-medium">Role-based access control and user authentication</span>
                </li>
                <li className="flex items-start space-x-3 group">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="text-slate-700 font-medium">Automatic data retention and deletion policies</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
              <h3 className="text-xl font-bold text-indigo-900 mb-6">GDPR Compliance</h3>
              <ul className="space-y-4">
                <li className="flex items-start space-x-3 group">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="text-slate-700 font-medium">Data minimization and purpose limitation principles</span>
                </li>
                <li className="flex items-start space-x-3 group">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="text-slate-700 font-medium">Right to access, rectification, and erasure</span>
                </li>
                <li className="flex items-start space-x-3 group">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="text-slate-700 font-medium">Data portability and transparent consent management</span>
                </li>
                <li className="flex items-start space-x-3 group">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="text-slate-700 font-medium">Privacy by design and data protection impact assessments</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-8 mt-10 shadow-inner">
            <h4 className="text-lg font-bold text-blue-900 mb-3">Our Security Promise</h4>
            <p className="text-blue-800 font-medium leading-relaxed">
              X-Insight is committed to maintaining the highest standards of data security and privacy. 
              We employ enterprise-grade security measures, regular security audits, and strict compliance 
              protocols to ensure your medical data remains protected at all times. Our systems are 
              designed with privacy by default, and we never use patient data for any purpose other 
              than providing diagnostic services.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}