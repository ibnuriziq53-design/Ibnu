import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { BookOpen, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setError("Supabase belum dikonfigurasi. Silakan periksa .env file Anda.");
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: email.split('@')[0], 
            }
          }
        });
        
        if (signUpError) {
          if (signUpError.message.includes('Password')) {
             throw new Error('Password terlalu lemah (minimal 6 karakter).');
          } else if (signUpError.message.includes('already registered')) {
             throw new Error('Email ini sudah terdaftar.');
          }
          throw signUpError;
        }
        
        setError('Pendaftaran berhasil! Silakan login.');
        setIsSignUp(false);
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        navigate('/app');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat otentikasi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h1 className="text-4xl font-extrabold tracking-tighter text-red-600 mb-2">
          PRIMA<span className="text-slate-900 underline decoration-4 decoration-red-600 underline-offset-4">UNGGUL</span>
        </h1>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-4">
          {isSignUp ? 'Pembuatan Akun Siswa' : 'Portal Login Sistem'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-6 shadow-2xl shadow-slate-200/50 rounded-3xl sm:px-10 border border-slate-200">
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-600 p-4 rounded-r-xl">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-600" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-bold text-red-900">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleAuth}>
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-900 uppercase tracking-widest">
                Email / NIS
              </label>
              <div className="mt-2 text-slate-900">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent font-medium transition-shadow"
                  placeholder="email@sekolah.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-slate-900 uppercase tracking-widest">
                Password
              </label>
              <div className="mt-2 text-slate-900">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent font-medium transition-shadow"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg shadow-red-200 text-sm font-bold tracking-wide text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600 disabled:opacity-50 transition-all active:scale-[0.98]"
              >
                {loading ? 'MEMPROSES...' : isSignUp ? 'DAFTAR SEKARANG' : 'LOGIN SECURE'}
              </button>
            </div>
          </form>

          <div className="mt-8">
             <div className="relative">
               <div className="absolute inset-0 flex items-center">
                 <div className="w-full border-t border-slate-200" />
               </div>
               <div className="relative flex justify-center text-sm">
                 <span className="px-4 bg-white text-xs font-bold text-slate-400 uppercase tracking-widest">Demo Access</span>
               </div>
             </div>
             
             <div className="mt-6 text-center">
                <button 
                  type="button" 
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-sm font-bold text-slate-500 hover:text-red-600 transition-colors"
                >
                  {isSignUp ? 'Sudah punya akun? Login' : 'Belum punya akun? Daftar sebagai Siswa'}
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
