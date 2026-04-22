import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const success = await login(email, password); 
      
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Invalid credentials. Please try again.');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const demoCredentials = [
    { role: 'Demo User', email: 'user@xinsight.com', icon: User }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-1.5 bg-blue-600 rounded-lg group-hover:bg-blue-700 transition-colors">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-indigo-900 text-lg tracking-tight">X-Insight</span>
          </Link>
          <Link
            to="/"
            className="text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors duration-200 flex items-center gap-1.5"
          >
            ← Back to Home
          </Link>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 mt-16">
        <div className="w-full max-w-md bg-white rounded-xl shadow-md border border-slate-100 p-6 sm:p-8 transition-all duration-300 hover:shadow-lg">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-indigo-900 tracking-tight">
              Sign in to X-Insight
            </h2>
            <p className="mt-2 text-sm text-slate-500 font-medium">
              Access your medical imaging analysis portal
            </p>
          </div>
          
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-600">
                  <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                </div>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-indigo-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all duration-200 shadow-sm"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-600">
                  <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="block w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-indigo-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all duration-200 shadow-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center shadow-sm font-medium">
                {error}
              </div>
            )}

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center items-center py-3 px-4 rounded-lg text-white bg-blue-600 hover:bg-blue-700 font-bold shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 focus:ring-offset-white transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

          <div className="mt-8 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-slate-500 font-semibold tracking-wide uppercase text-xs">Demo Access</span>
            </div>
          </div>
          
          <div className="mt-6 space-y-3">
            {demoCredentials.map(({ role: demoRole, email: demoEmail, icon: Icon }) => (
              <button
                key={demoRole}
                onClick={() => {
                  setEmail(demoEmail);
                  setPassword('demo123');
                }}
                className="group w-full flex items-center justify-between p-3.5 border border-slate-200 rounded-xl hover:border-blue-300 hover:bg-slate-50 hover:shadow-sm transition-all duration-200 text-left"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-2.5 rounded-lg text-blue-600 bg-blue-50 group-hover:bg-blue-100 transition-colors duration-200">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-indigo-900 capitalize group-hover:text-blue-700 transition-colors">{demoRole}</p>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">{demoEmail}</p>
                  </div>
                </div>
                <span className="text-xs text-slate-400 group-hover:text-blue-600 transition-colors font-medium">Click to use</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}