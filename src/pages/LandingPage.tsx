import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

export default function LandingPage() {
  const majors = [
    { id: 'TKJ', name: 'Teknik Komputer & Jaringan' },
    { id: 'DKV', name: 'Desain Komunikasi Visual' },
    { id: 'AK', name: 'Akuntansi' },
    { id: 'BC', name: 'Broadcasting' },
    { id: 'MPLB', name: 'Manajemen Perkantoran' },
    { id: 'BD', name: 'Bisnis Digital' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tighter text-red-600">
              PRIMA<span className="text-slate-900 underline decoration-4 decoration-red-600 underline-offset-4">UNGGUL</span>
            </h1>
          </div>
          <Link
            to="/login"
            className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm tracking-wide hover:bg-red-600 transition-colors shadow-sm"
          >
            LOGIN PORTAL
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <div className="relative bg-slate-50 pt-16 pb-20 lg:pt-24 lg:pb-32 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Sistem Ujian Online Terintegrasi</p>
              <h1 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-none mb-6">
                CBT SYSTEM <br/><span className="text-red-600">V2.0</span>
              </h1>
              <p className="text-lg text-slate-500 max-w-xl mx-auto lg:mx-0 mb-8 font-medium">
                Platform Computer Based Test (CBT) resmi SMK Prima Unggul untuk pelaksanaan ujian yang cepat, aman, dan transparan.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to="/login"
                  className="inline-flex justify-center items-center px-8 py-4 bg-red-600 text-white rounded-2xl font-black text-lg hover:bg-red-700 transition-colors shadow-xl shadow-red-200/50"
                >
                  Mulai Ujian Sekarang
                </Link>
              </div>
            </div>
            
            <div className="flex-1 hidden lg:block relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-600/10 rounded-full blur-3xl"></div>
              <div className="relative bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-12 w-12 bg-red-100 rounded-xl flex items-center justify-center font-black text-red-600">01</div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-lg">Simulasi UNBK</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sedang Berlangsung</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="h-4 bg-slate-100 rounded-full w-full"></div>
                  <div className="h-4 bg-slate-100 rounded-full w-5/6"></div>
                  <div className="h-4 bg-slate-100 rounded-full w-4/6"></div>
                </div>
                <div className="mt-8 flex justify-between items-center text-sm font-bold border-t border-slate-100 pt-6">
                  <span className="text-slate-400">Peserta Aktif</span>
                  <span className="text-red-600">420 Siswa</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Program Keahlian */}
        <div className="py-20 bg-white border-t border-slate-200 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="mb-16">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Program Keahlian</h2>
              <p className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">
                Fakultas <span className="text-red-600">Kejuruan</span>
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {majors.map((major) => (
                <div key={major.id} className="bg-slate-50 rounded-3xl p-6 border border-slate-100 hover:border-red-600 transition-colors group">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center font-black text-red-600 shadow-sm mb-6 group-hover:bg-red-600 group-hover:text-white transition-colors">
                    {major.id}
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900 leading-tight">{major.name}</h3>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-slate-900 py-12 border-t-8 border-red-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <h1 className="text-2xl font-extrabold tracking-tighter text-white opacity-50">
              PRIMA<span className="underline decoration-4 decoration-red-600 underline-offset-4">UNGGUL</span>
            </h1>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">
              &copy; 2026 Hak Cipta Dilindungi
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
