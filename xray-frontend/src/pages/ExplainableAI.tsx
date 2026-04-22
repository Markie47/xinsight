import React, { useState } from 'react';
import { Brain, Eye, Layers, Target, AlertCircle, TrendingUp } from 'lucide-react';

export default function ExplainableAI() {
  const [selectedExample, setSelectedExample] = useState(0);

  const examples = [
    {
      title: 'Pneumonia Detection',
      image: 'https://images.pexels.com/photos/7089020/pexels-photo-7089020.jpeg?auto=compress&cs=tinysrgb&w=800',
      condition: 'Pneumonia',
      confidence: 92.3,
      explanation: 'The AI model detected consolidation patterns in the lower right lobe, characterized by increased opacity and air bronchograms. The heatmap shows high attention to these regions.',
      keyFeatures: ['Consolidation pattern', 'Air bronchograms', 'Increased opacity', 'Lower lobe location']
    },
    {
      title: 'Fracture Identification',
      image: 'https://images.pexels.com/photos/7089360/pexels-photo-7089360.jpeg?auto=compress&cs=tinysrgb&w=800',
      condition: 'Rib Fracture',
      confidence: 87.6,
      explanation: 'The model identified a clear discontinuity in the cortical bone structure of the 6th rib. The attention mechanism focused on the fracture line and surrounding bone architecture.',
      keyFeatures: ['Cortical discontinuity', 'Bone alignment', 'Fracture line visibility', 'Surrounding tissue']
    },
    {
      title: 'Normal X-Ray Analysis',
      image: 'https://images.pexels.com/photos/7089341/pexels-photo-7089341.jpeg?auto=compress&cs=tinysrgb&w=800',
      condition: 'Normal',
      confidence: 96.1,
      explanation: 'The AI classified this as normal by recognizing proper lung expansion, clear diaphragm borders, and absence of abnormal opacities or structural abnormalities.',
      keyFeatures: ['Clear lung fields', 'Normal heart size', 'Sharp diaphragm', 'No abnormal opacities']
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
              <Brain className="h-10 w-10 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-indigo-900 mb-6 tracking-tight">
            Explainable AI in Medical Imaging
          </h1>
          <p className="text-lg md:text-xl text-slate-600 font-medium max-w-3xl mx-auto leading-relaxed">
            Understanding how AI makes diagnostic decisions through visual explanations, 
            attention maps, and transparent reasoning processes.
          </p>
        </div>

        {/* AI Transparency Importance */}
        <div className="bg-white rounded-xl shadow-md border border-slate-100 p-8 sm:p-10 mb-12 hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-2xl font-bold text-indigo-900 mb-8 border-b border-slate-100 pb-4">
            Why Explainable AI Matters in Healthcare
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="bg-slate-50 border border-slate-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
                <Eye className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-indigo-900 mb-3">Clinical Trust</h3>
              <p className="text-slate-600 font-medium leading-relaxed">
                Healthcare professionals need to understand AI reasoning to trust and validate diagnostic decisions.
              </p>
            </div>
            <div className="text-center group">
              <div className="bg-slate-50 border border-slate-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
                <Target className="h-7 w-7 text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-indigo-900 mb-3">Diagnostic Accuracy</h3>
              <p className="text-slate-600 font-medium leading-relaxed">
                Visual explanations help identify if the AI is focusing on clinically relevant regions.
              </p>
            </div>
            <div className="text-center group">
              <div className="bg-slate-50 border border-slate-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
                <Layers className="h-7 w-7 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-indigo-900 mb-3">Learning Tool</h3>
              <p className="text-slate-600 font-medium leading-relaxed">
                Explainable AI serves as an educational resource for medical training and continuous learning.
              </p>
            </div>
          </div>
        </div>

        {/* Interactive Examples */}
        <div className="bg-white rounded-xl shadow-md border border-slate-100 p-8 sm:p-10 mb-12 hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-2xl font-bold text-indigo-900 mb-8 border-b border-slate-100 pb-4">
            Interactive AI Explanation Examples
          </h2>
          
          {/* Example Selector */}
          <div className="flex flex-wrap gap-3 mb-8">
            {examples.map((example, index) => (
              <button
                key={index}
                onClick={() => setSelectedExample(index)}
                className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 shadow-sm ${
                  selectedExample === index
                    ? 'bg-blue-600 text-white shadow-md scale-105'
                    : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-white hover:border-blue-300 hover:text-blue-600'
                }`}
              >
                {example.title}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Image and Heatmap */}
            <div className="space-y-6">
              <div className="relative overflow-hidden rounded-xl shadow-md border border-slate-200 group">
                <img
                  src={examples[selectedExample].image}
                  alt={examples[selectedExample].title}
                  className="w-full h-[400px] object-cover bg-slate-900 group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-amber-500/30 to-transparent pointer-events-none" />
                <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-sm font-semibold shadow-sm border border-white/10">
                  Attention Heatmap
                </div>
              </div>
              
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 shadow-sm">
                <h4 className="font-bold text-indigo-900 mb-3 text-sm uppercase tracking-wider">Heatmap Legend</h4>
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-4 h-4 bg-red-500 rounded-md shadow-sm"></div>
                    <span className="text-sm font-medium text-slate-700">High attention</span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <div className="w-4 h-4 bg-amber-500 rounded-md shadow-sm"></div>
                    <span className="text-sm font-medium text-slate-700">Medium attention</span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <div className="w-4 h-4 bg-slate-300 rounded-md shadow-sm"></div>
                    <span className="text-sm font-medium text-slate-700">Low attention</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Analysis Details */}
            <div className="space-y-6 bg-slate-50/50 p-6 sm:p-8 rounded-xl border border-slate-100">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-4">
                  <h3 className="text-2xl font-bold text-indigo-900 leading-tight">
                    {examples[selectedExample].condition}
                  </h3>
                  <div className="flex items-center space-x-2 bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-100 shadow-sm">
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                    <span className="text-lg font-extrabold text-emerald-600">
                      {examples[selectedExample].confidence}%
                    </span>
                  </div>
                </div>
                
                <div className="bg-white border text-slate-600 border-slate-200 shadow-sm rounded-xl p-5 mb-8 transition-all hover:border-blue-200">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-6 w-6 text-blue-600 flex-shrink-0" />
                    <p className="font-medium text-slate-700 leading-relaxed">
                      {examples[selectedExample].explanation}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-indigo-900 mb-4 text-sm uppercase tracking-wider">Key Features Analyzed</h4>
                <div className="space-y-3">
                  {examples[selectedExample].keyFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3 bg-white border border-slate-100 p-3 rounded-lg shadow-sm">
                      <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                      <span className="text-slate-700 font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-200">
                <h4 className="font-bold text-indigo-900 mb-5 text-sm uppercase tracking-wider">Model Confidence Breakdown</h4>
                <div className="space-y-5">
                  <div className="group">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-600 font-medium group-hover:text-blue-600 transition-colors">Feature Detection</span>
                      <span className="text-slate-900 font-bold">94%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{width: '94%'}}></div>
                    </div>
                  </div>
                  <div className="group">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-600 font-medium group-hover:text-emerald-600 transition-colors">Pattern Recognition</span>
                      <span className="text-slate-900 font-bold">89%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                      <div className="bg-emerald-600 h-2.5 rounded-full" style={{width: '89%'}}></div>
                    </div>
                  </div>
                  <div className="group">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-600 font-medium group-hover:text-purple-600 transition-colors">Contextual Analysis</span>
                      <span className="text-slate-900 font-bold">91%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                      <div className="bg-purple-600 h-2.5 rounded-full" style={{width: '91%'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Details */}
        <div className="bg-white rounded-xl shadow-md border border-slate-100 p-8 sm:p-10 hover:shadow-lg transition-shadow duration-300 mb-12">
          <h2 className="text-2xl font-bold text-indigo-900 mb-8 border-b border-slate-100 pb-4">
            How Our Explainable AI Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
              <h3 className="text-xl font-bold text-indigo-900 mb-4">Grad-CAM Visualization</h3>
              <p className="text-slate-600 font-medium leading-relaxed mb-6">
                Our system uses Gradient-weighted Class Activation Mapping (Grad-CAM) to highlight 
                the regions in the X-ray image that were most important for the AI's diagnostic decision.
              </p>
              <ul className="space-y-3 font-medium text-slate-700">
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0 shadow-sm"></div>
                  <span>Generates visual explanations for deep learning models</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0 shadow-sm"></div>
                  <span>Highlights discriminative regions without architectural changes</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0 shadow-sm"></div>
                  <span>Provides class-specific visualizations</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
              <h3 className="text-xl font-bold text-indigo-900 mb-4">Attention Mechanisms</h3>
              <p className="text-slate-600 font-medium leading-relaxed mb-6">
                Our neural network architecture incorporates attention mechanisms that automatically 
                focus on clinically relevant anatomical structures and pathological features.
              </p>
              <ul className="space-y-3 font-medium text-slate-700">
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-emerald-600 rounded-full mt-2 flex-shrink-0 shadow-sm"></div>
                  <span>Self-attention for spatial feature relationships</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-emerald-600 rounded-full mt-2 flex-shrink-0 shadow-sm"></div>
                  <span>Multi-scale attention for different pathology sizes</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-emerald-600 rounded-full mt-2 flex-shrink-0 shadow-sm"></div>
                  <span>Channel attention for feature importance weighting</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}