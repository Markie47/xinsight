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
      name: 'Tuberculosis (TB)',
      description: 'Bacterial infection primarily affecting the lungs',
      symptoms: 'Persistent cough, weight loss, night sweats, fatigue',
      xrayFindings: 'Upper lobe infiltrates, cavitation, lymph node enlargement',
      icon: AlertTriangle,
      color: 'orange'
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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-100 p-4 rounded-full">
              <BookOpen className="h-12 w-12 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Medical X-Ray Information & Awareness
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Learn about common X-ray findings, how AI assists radiologists, 
            and our commitment to data privacy and security.
          </p>
        </div>

        {/* How AI Assists Radiologists */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            How AI Assists Radiologists
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Speed</h3>
              <p className="text-gray-600 text-sm">
                Rapid initial screening and triage of X-ray images, reducing interpretation time from hours to seconds.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Accuracy</h3>
              <p className="text-gray-600 text-sm">
                High sensitivity for detecting subtle abnormalities that might be missed in initial review.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Consistency</h3>
              <p className="text-gray-600 text-sm">
                Standardized analysis approach that reduces inter-observer variability and human error.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Early Detection</h3>
              <p className="text-gray-600 text-sm">
                Identification of early-stage pathologies and critical findings requiring immediate attention.
              </p>
            </div>
          </div>
        </div>

        {/* Common X-Ray Conditions */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Common X-Ray Abnormalities
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {conditions.map((condition, index) => {
              const IconComponent = condition.icon;
              return (
                <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-start space-x-4">
                    <div className={`bg-${condition.color}-100 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <IconComponent className={`h-6 w-6 text-${condition.color}-600`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{condition.name}</h3>
                      <p className="text-gray-600 text-sm mb-3">{condition.description}</p>
                      
                      <div className="space-y-2">
                        <div>
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Symptoms</span>
                          <p className="text-sm text-gray-700">{condition.symptoms}</p>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">X-Ray Findings</span>
                          <p className="text-sm text-gray-700">{condition.xrayFindings}</p>
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
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center space-x-3 mb-8">
            <Shield className="h-8 w-8 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              Privacy & Data Security
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">HIPAA Compliance</h3>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">End-to-end encryption for all medical data transmission</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">Secure audit trails for all access and modifications</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">Role-based access control and user authentication</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">Automatic data retention and deletion policies</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">GDPR Compliance</h3>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">Data minimization and purpose limitation principles</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">Right to access, rectification, and erasure</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">Data portability and transparent consent management</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">Privacy by design and data protection impact assessments</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
            <h4 className="font-semibold text-blue-900 mb-2">Our Security Promise</h4>
            <p className="text-blue-800 text-sm">
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