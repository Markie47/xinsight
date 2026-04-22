import React from 'react';

export default function History() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">User History</h1>
      
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-600 mb-4">View your past X-ray uploads and analysis reports below.</p>
        
        {/* Placeholder for your future data table */}
        <div className="border rounded-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scan Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* This is a dummy row. You will replace this with real data later! */}
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Oct 24, 2026</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Chest X-Ray</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">Completed</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:underline cursor-pointer">View Report</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}