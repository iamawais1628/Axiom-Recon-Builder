import React, { useState } from 'react';
import { useTheme } from '../context/ThemeProvider';

export default function SessionDetailsModal({ session, onClose, onExport }) {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('matched');

  if (!session) return null;

  const matchedTransactions = [
    { bank: 5000.00, bankDesc: 'Salary Payment', erp: 5000.00, erpDesc: 'Payroll', confidence: 95 },
    { bank: 1500.50, bankDesc: 'Office Supplies', erp: 1500.50, erpDesc: 'Supplies Expense', confidence: 90 },
    { bank: 2300.00, bankDesc: 'Software License', erp: 2300.00, erpDesc: 'Software Subscription', confidence: 88 },
  ];

  const unmatchedTransactions = [
    { bank: 750.00, bankDesc: 'Internet Bill', status: 'unmatched' },
    { bank: 4200.00, bankDesc: 'Equipment Purchase', status: 'unmatched' },
  ];

  return (
    <div className={`fixed inset-0 ${isDark ? 'bg-black/50' : 'bg-black/30'} backdrop-blur-sm z-50 flex items-center justify-center p-4`}>
      <div className={`w-full max-w-4xl max-h-[90vh] ${isDark ? 'bg-slate-900' : 'bg-white'} rounded-2xl shadow-2xl overflow-hidden`}>
        {/* Header */}
        <div className={`${isDark ? 'bg-gradient-to-r from-slate-800 to-slate-700 border-slate-700' : 'bg-gradient-to-r from-blue-50 to-purple-50 border-slate-200'} border-b px-8 py-6 flex justify-between items-center`}>
          <div>
            <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {session.session_name || 'Unnamed Session'}
            </h2>
            <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'} mt-2`}>
              Created {new Date(session.created_at).toLocaleString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-100 hover:bg-slate-200'} transition-colors`}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Stats Grid */}
          <div className={`grid grid-cols-4 gap-4 p-8 ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'} border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-700/50' : 'bg-white'}`}>
              <div className="text-sm font-semibold text-slate-500 mb-1">Match Rate</div>
              <div className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                {session.match_rate.toFixed(1)}%
              </div>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-700/50' : 'bg-white'}`}>
              <div className="text-sm font-semibold text-slate-500 mb-1">Avg Confidence</div>
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                {session.avg_confidence.toFixed(1)}%
              </div>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-700/50' : 'bg-white'}`}>
              <div className="text-sm font-semibold text-slate-500 mb-1">Matched</div>
              <div className="text-3xl font-bold text-green-500">
                {session.total_matched}
              </div>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-700/50' : 'bg-white'}`}>
              <div className="text-sm font-semibold text-slate-500 mb-1">Unmatched</div>
              <div className="text-3xl font-bold text-red-500">
                {session.total_unmatched}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className={`flex gap-4 px-8 py-6 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
            <button
              onClick={() => setActiveTab('matched')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 ${
                activeTab === 'matched'
                  ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white'
                  : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ✅ Matched ({session.total_matched})
            </button>
            <button
              onClick={() => setActiveTab('unmatched')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 ${
                activeTab === 'unmatched'
                  ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
                  : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ❌ Unmatched ({session.total_unmatched})
            </button>
          </div>

          {/* Tables */}
          <div className="p-8">
            {activeTab === 'matched' && (
              <div>
                <div className={`rounded-lg overflow-hidden border ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                  <table className="w-full">
                    <thead>
                      <tr className={`${isDark ? 'bg-slate-800' : 'bg-slate-50'} border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                        <th className={`px-6 py-3 text-left text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-900'}`}>Bank Amount</th>
                        <th className={`px-6 py-3 text-left text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-900'}`}>Bank Description</th>
                        <th className={`px-6 py-3 text-left text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-900'}`}>ERP Amount</th>
                        <th className={`px-6 py-3 text-left text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-900'}`}>ERP Description</th>
                        <th className={`px-6 py-3 text-left text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-900'}`}>Confidence</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                      {matchedTransactions.map((tx, i) => (
                        <tr key={i} className={`hover:${isDark ? 'bg-slate-800/50' : 'bg-slate-50'} transition-colors`}>
                          <td className={`px-6 py-4 text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            ${tx.bank.toFixed(2)}
                          </td>
                          <td className={`px-6 py-4 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            {tx.bankDesc}
                          </td>
                          <td className={`px-6 py-4 text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            ${tx.erp.toFixed(2)}
                          </td>
                          <td className={`px-6 py-4 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            {tx.erpDesc}
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r from-green-400/20 to-blue-400/20 text-green-500">
                              {tx.confidence}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'unmatched' && (
              <div>
                <div className={`rounded-lg overflow-hidden border ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                  <table className="w-full">
                    <thead>
                      <tr className={`${isDark ? 'bg-slate-800' : 'bg-slate-50'} border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                        <th className={`px-6 py-3 text-left text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-900'}`}>Amount</th>
                        <th className={`px-6 py-3 text-left text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-900'}`}>Description</th>
                        <th className={`px-6 py-3 text-left text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-900'}`}>Type</th>
                        <th className={`px-6 py-3 text-left text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-900'}`}>Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                      {unmatchedTransactions.map((tx, i) => (
                        <tr key={i} className={`hover:${isDark ? 'bg-slate-800/50' : 'bg-slate-50'} transition-colors`}>
                          <td className={`px-6 py-4 text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            ${tx.bank.toFixed(2)}
                          </td>
                          <td className={`px-6 py-4 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            {tx.bankDesc}
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r from-red-400/20 to-orange-400/20 text-red-500">
                              Unmatched
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button className="text-blue-500 hover:text-blue-600 font-semibold text-sm">
                              Manually Match
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={`flex gap-4 p-8 border-t ${isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50'}`}>
          <button
            onClick={() => onExport(session.id, 'csv')}
            className="flex-1 px-6 py-3 rounded-lg font-semibold bg-blue-500 hover:bg-blue-600 text-white transition-colors"
          >
            📥 Export as CSV
          </button>
          <button
            onClick={() => onExport(session.id, 'pdf')}
            className="flex-1 px-6 py-3 rounded-lg font-semibold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white transition-colors"
          >
            📄 Export as PDF
          </button>
          <button
            onClick={onClose}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-900'} transition-colors`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
