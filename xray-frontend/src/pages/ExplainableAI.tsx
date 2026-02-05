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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-100 p-4 rounded-full">
              <Brain className="h-12 w-12 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Explainable AI in Medical Imaging
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Understanding how AI makes diagnostic decisions through visual explanations, 
            attention maps, and transparent reasoning processes.
          </p>
        </div>

        {/* AI Transparency Importance */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Why Explainable AI Matters in Healthcare
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Eye className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Clinical Trust</h3>
              <p className="text-gray-600">
                Healthcare professionals need to understand AI reasoning to trust and validate diagnostic decisions.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Diagnostic Accuracy</h3>
              <p className="text-gray-600">
                Visual explanations help identify if the AI is focusing on clinically relevant regions.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Layers className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Learning Tool</h3>
              <p className="text-gray-600">
                Explainable AI serves as an educational resource for medical training and continuous learning.
              </p>
            </div>
          </div>
        </div>

        {/* Interactive Examples */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Interactive AI Explanation Examples
          </h2>
          
          {/* Example Selector */}
          <div className="flex flex-wrap gap-2 mb-8">
            {examples.map((example, index) => (
              <button
                key={index}
                onClick={() => setSelectedExample(index)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  selectedExample === index
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {example.title}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image and Heatmap */}
            <div className="space-y-6">
              <div className="relative">
                <img
                  src={examples[selectedExample].image}
                  alt={examples[selectedExample].title}
                  className="w-full h-80 object-cover rounded-lg bg-black"
                />
                {/* Simulated attention heatmap overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-yellow-500/30 to-transparent rounded-lg pointer-events-none" />
                <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-lg text-sm">
                  Attention Heatmap
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Heatmap Legend</h4>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span className="text-sm text-gray-600">High attention</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                    <span className="text-sm text-gray-600">Medium attention</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-gray-300 rounded"></div>
                    <span className="text-sm text-gray-600">Low attention</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Analysis Details */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {examples[selectedExample].condition}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <span className="text-lg font-bold text-green-600">
                      {examples[selectedExample].confidence}%
                    </span>
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-blue-800 text-sm">
                      {examples[selectedExample].explanation}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Key Features Analyzed</h4>
                <div className="space-y-2">
                  {examples[selectedExample].keyFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="font-semibold text-gray-900 mb-3">Model Confidence Breakdown</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Feature Detection</span>
                      <span className="text-gray-900">94%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{width: '94%'}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Pattern Recognition</span>
                      <span className="text-gray-900">89%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{width: '89%'}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Contextual Analysis</span>
                      <span className="text-gray-900">91%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{width: '91%'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Details */}
        <div className="bg-white rounded-xl shadow-lg p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            How Our Explainable AI Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Grad-CAM Visualization</h3>
              <p className="text-gray-600 mb-4">
                Our system uses Gradient-weighted Class Activation Mapping (Grad-CAM) to highlight 
                the regions in the X-ray image that were most important for the AI's diagnostic decision.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Generates visual explanations for deep learning models</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Highlights discriminative regions without architectural changes</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Provides class-specific visualizations</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Attention Mechanisms</h3>
              <p className="text-gray-600 mb-4">
                Our neural network architecture incorporates attention mechanisms that automatically 
                focus on clinically relevant anatomical structures and pathological features.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Self-attention for spatial feature relationships</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Multi-scale attention for different pathology sizes</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
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