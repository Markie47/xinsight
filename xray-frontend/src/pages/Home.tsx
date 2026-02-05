import React from 'react';
import { Link } from 'react-router-dom';
import { Upload } from 'lucide-react';

export default function Home() {
  return (
    <div className="bg-gradient-to-br from-blue-600 to-blue-400 min-h-[60vh] flex flex-col justify-center items-center text-white rounded-b-3xl shadow-lg">
      <div className="max-w-3xl text-center py-16">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
          AI-Powered Medical X-ray
          <br />Interpretation & Reporting
        </h1>
        <p className="text-lg md:text-xl mb-8 font-medium">
          Fast, accurate, and explainable AI technology that assists healthcare
          professionals in diagnosing medical conditions from X-ray images.
        </p>
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Link
            to="/upload"
            className="inline-flex items-center justify-center px-6 py-3 bg-white text-blue-700 font-semibold rounded-lg shadow hover:bg-blue-50 transition"
          >
            <Upload className="w-5 h-5 mr-2" />
            Upload an X-ray
          </Link>
          <Link
            to="/information"
            className="inline-flex items-center justify-center px-6 py-3 border border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-700 transition"
          >
            Learn More
          </Link>
        </div>
      </div>
      <div className="w-full bg-white text-blue-900 rounded-t-3xl shadow-lg py-10 px-4 mt-8">
        <h2 className="text-2xl font-bold text-center mb-4">Why Choose X-Insight?</h2>
        <p className="text-center max-w-2xl mx-auto">
          Our advanced AI system provides comprehensive analysis with transparency,
          security, and accuracy at its core.
        </p>
      </div>
    </div>
  );
}