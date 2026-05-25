import React, { useState } from 'react';
import { useTheme } from '../context/ThemeProvider';

export default function LandingPage({ onNavigateToLogin }) {
  const { isDark, toggleTheme } = useTheme();
  const [email, setEmail] = useState('');

  return (
    <div className={`min-h-screen ${isDark ? 'dark bg-slate-950' : 'bg-white'} transition-colors duration-300`}>
      {/* Navigation */}
      <nav className={`fixed w-full top-0 z-50 ${isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-white/80 border-slate-200'} backdrop-blur-md border-b transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">🔄</span>
            </div>
            <span className={`text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent`}>
              Axiom Recon
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg ${isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-100 hover:bg-slate-200'} transition-colors`}
            >
              {isDark ? '☀️' : '🌙'}
            </button>
            <button
              onClick={onNavigateToLogin}
              className="px-6 py-2 rounded-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300"
            >
              Sign In
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className={`absolute top-20 right-10 w-72 h-72 ${isDark ? 'bg-blue-500/10' : 'bg-blue-200/30'} rounded-full mix-blend-multiply filter blur-3xl animate-pulse`}></div>
            <div className={`absolute bottom-20 left-10 w-72 h-72 ${isDark ? 'bg-purple-500/10' : 'bg-purple-200/30'} rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-2000`}></div>
          </div>

          <div className="relative z-10">
            <div className={`inline-block px-4 py-2 rounded-full ${isDark ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-600'} mb-6 font-semibold text-sm backdrop-blur-sm border ${isDark ? 'border-blue-500/30' : 'border-blue-200'}`}>
              ✨ AI-Powered Reconciliation Platform
            </div>

            <h1 className={`text-6xl sm:text-7xl font-black mb-6 leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Reconcile with <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">Precision</span>
            </h1>

            <p className={`text-xl ${isDark ? 'text-slate-400' : 'text-slate-600'} max-w-3xl mx-auto mb-10 leading-relaxed`}>
              Say goodbye to manual reconciliation. Our AI-powered platform matches transactions instantly with 95%+ accuracy, saving hours of tedious work.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
              <button
                onClick={onNavigateToLogin}
                className="px-8 py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 transform hover:-translate-y-1"
              >
                Get Started Free →
              </button>
              <button
                className={`px-8 py-4 rounded-xl font-bold text-lg ${isDark ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'} transition-all duration-300`}
              >
                Watch Demo
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className={`p-6 rounded-lg ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'} border backdrop-blur-sm`}>
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">95%+</div>
                <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Match Accuracy</div>
              </div>
              <div className={`p-6 rounded-lg ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'} border backdrop-blur-sm`}>
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">10K+</div>
                <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Transactions/Sec</div>
              </div>
              <div className={`p-6 rounded-lg ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'} border backdrop-blur-sm`}>
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">99.9%</div>
                <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Uptime SLA</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={`py-20 px-4 ${isDark ? 'bg-slate-900/50' : 'bg-slate-50'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Powerful Features
            </h2>
            <p className={`text-xl ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Everything you need for seamless reconciliation
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: '🤖', title: 'AI-Powered Matching', desc: 'Advanced algorithms match transactions instantly with confidence scores' },
              { icon: '📊', title: 'Real-Time Analytics', desc: 'Track match rates, confidence levels, and performance metrics live' },
              { icon: '🎯', title: 'Custom Rules Engine', desc: 'Create rules to handle complex matching scenarios' },
              { icon: '📁', title: 'Multiple Formats', desc: 'Import CSV, Excel, JSON, and more file formats' },
              { icon: '📥', title: 'Export & Reports', desc: 'Download results as CSV, PDF, or Excel with detailed reports' },
              { icon: '🔒', title: 'Enterprise Security', desc: 'Bank-level encryption and compliance with industry standards' },
            ].map((feature, i) => (
              <div
                key={i}
                className={`p-8 rounded-2xl ${isDark ? 'bg-slate-800/50 border-slate-700 hover:bg-slate-800' : 'bg-white border-slate-200 hover:bg-slate-50'} border backdrop-blur-sm transition-all duration-300 hover:shadow-lg`}
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {feature.title}
                </h3>
                <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className={`text-5xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Ready to Transform Your Reconciliation?
          </h2>
          <p className={`text-xl ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-10`}>
            Join thousands of companies automating their financial reconciliation today.
          </p>
          <button
            onClick={onNavigateToLogin}
            className="px-10 py-5 rounded-xl font-bold text-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 transform hover:-translate-y-1"
          >
            Start Free Trial Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className={`${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-900 border-slate-200'} border-t py-10 px-4`}>
        <div className="max-w-7xl mx-auto text-center">
          <p className={`${isDark ? 'text-slate-400' : 'text-slate-300'}`}>
            © 2026 Axiom Recon. All rights reserved. | Privacy Policy | Terms of Service
          </p>
        </div>
      </footer>
    </div>
  );
}
