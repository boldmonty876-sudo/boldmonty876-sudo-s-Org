import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, GraduationCap, Shield, UserCheck, Mail, Lock, User, Phone, BookOpen, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, setUser, loginAs, config, showToast } = useApp();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [semester, setSemester] = useState('Semester 4');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'signin') {
        const res = await api.login(email);
        setUser(res.user);
        setIsAuthModalOpen(false);
        showToast('Welcome!', `Logged in as ${res.user.name}`, 'success');
      } else {
        const res = await api.register({
          name,
          email,
          studentId,
          department,
          semester,
          phone,
          role: 'student'
        });
        setUser(res.user);
        setIsAuthModalOpen(false);
        showToast('Account Created!', `Welcome to ${config?.collegeName || 'Smart Campus Canteen'}, ${res.user.name}`, 'success');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-br from-emerald-800 to-emerald-950 text-white">
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="absolute top-4 right-4 text-emerald-300 hover:text-white p-1 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-8 h-8 rounded-lg bg-emerald-700/80 flex items-center justify-center text-white">
              <GraduationCap className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold tracking-wider uppercase text-emerald-200">
              Campus Student Portal
            </span>
          </div>
          <h2 className="text-xl font-bold">
            {mode === 'signin' ? 'Sign In to Campus Canteen' : 'Create Student Account'}
          </h2>
          <p className="text-xs text-emerald-200/80 mt-1">
            Skip long queues between lectures. Track your food live.
          </p>

          {/* Quick 1-Click Role Switchers for testing */}
          <div className="mt-4 pt-3 border-t border-emerald-700/50">
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-300 block mb-1.5">
              Instant Demo Access (1-Click)
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => loginAs('student')}
                className="py-1.5 px-2 bg-emerald-700/60 hover:bg-emerald-600 rounded-lg text-left text-[11px] font-semibold text-white transition-colors flex items-center gap-1.5"
              >
                <GraduationCap className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                <span>Student</span>
              </button>
              <button
                type="button"
                onClick={() => loginAs('staff')}
                className="py-1.5 px-2 bg-emerald-700/60 hover:bg-emerald-600 rounded-lg text-left text-[11px] font-semibold text-white transition-colors flex items-center gap-1.5"
              >
                <UserCheck className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span>Kitchen Staff</span>
              </button>
              <button
                type="button"
                onClick={() => loginAs('admin')}
                className="py-1.5 px-2 bg-emerald-700/60 hover:bg-emerald-600 rounded-lg text-left text-[11px] font-semibold text-white transition-colors flex items-center gap-1.5"
              >
                <Shield className="w-3.5 h-3.5 text-sky-300 shrink-0" />
                <span>Admin</span>
              </button>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Mode Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-xl mb-5 text-xs font-bold">
            <button
              type="button"
              onClick={() => { setMode('signin'); setError(null); }}
              className={`flex-1 py-2 rounded-lg transition-all ${
                mode === 'signin' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(null); }}
              className={`flex-1 py-2 rounded-lg transition-all ${
                mode === 'signup' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              New Registration
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aryan Sharma"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full text-xs pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Student Roll No</label>
                    <input
                      type="text"
                      placeholder="AIT/2024/CS/104"
                      value={studentId}
                      onChange={e => setStudentId(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Semester</label>
                    <select
                      value={semester}
                      onChange={e => setSemester(e.target.value)}
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                    >
                      <option>Semester 1</option>
                      <option>Semester 2</option>
                      <option>Semester 3</option>
                      <option>Semester 4</option>
                      <option>Semester 5</option>
                      <option>Semester 6</option>
                      <option>Semester 7</option>
                      <option>Semester 8</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                  <div className="relative">
                    <BookOpen className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      placeholder="Computer Science & Engineering"
                      value={department}
                      onChange={e => setDepartment(e.target.value)}
                      className="w-full text-xs pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mobile (for SMS tokens)</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full text-xs pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                College / Institutional Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder={config?.enforceCollegeDomain ? `student@${config.collegeEmailDomain}` : "student@campus.edu"}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full text-xs pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                />
              </div>
              {config?.enforceCollegeDomain && (
                <p className="text-[11px] text-emerald-700 mt-1 font-medium">
                  Verified campus domain required: @{config.collegeEmailDomain}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-md transition-all mt-4 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : mode === 'signin' ? 'Sign In to Order' : 'Complete Registration'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
