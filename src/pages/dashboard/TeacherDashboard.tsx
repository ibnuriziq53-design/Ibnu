import { FileQuestion, BookOpenCheck, Clock, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TeacherDashboard() {
  const stats = [
    { name: 'Soal Dibuat', value: '42', icon: FileQuestion, color: 'bg-red-600' },
    { name: 'Ujian Aktif', value: '3', icon: BookOpenCheck, color: 'bg-slate-900' },
    { name: 'Total Siswa', value: '145', icon: Users, color: 'bg-slate-700' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
      <div className="lg:col-span-8 flex flex-col gap-6">
        <div className="bg-red-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-red-200/50">
          <div className="relative z-10">
            <h4 className="text-4xl font-black mb-2 leading-none uppercase">Portal Guru</h4>
            <p className="text-red-100 text-sm font-semibold opacity-90 max-w-md mt-4">
              Selamat datang di pusat pengelolaan ujian. Tambahkan soal baru atau persiapkan ujian untuk siswa Anda hari ini.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/app/questions" className="px-6 py-3 bg-white text-red-600 font-bold rounded-xl shadow-lg hover:scale-105 transition-transform inline-flex items-center gap-2">
                <FileQuestion size={18} strokeWidth={2.5} /> Tambah Soal
              </Link>
              <Link to="/app/exams" className="flex items-center justify-center gap-2 px-6 py-3 border border-white/30 rounded-xl backdrop-blur-sm text-white font-bold hover:bg-white/10 transition-colors">
                <BookOpenCheck size={18} strokeWidth={2.5} /> Buat Ujian
              </Link>
            </div>
          </div>
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {stats.map((item) => (
            <div key={item.name} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-2xl ${item.color} text-white shadow-sm shrink-0`}>
                  <item.icon size={20} strokeWidth={2.5} />
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">{item.name}</p>
              </div>
              <div className="flex items-baseline gap-2 mt-auto">
                <span className="text-5xl font-black text-slate-900">{item.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col h-full min-h-[400px]">
        <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Jadwal Ujian Terdekat</h4>
        <div className="flex-1 space-y-4 overflow-y-auto pr-2">
          <div className="flex items-center justify-between p-3 border border-slate-100 rounded-2xl">
            <div className="flex gap-3 items-center">
              <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center font-black text-white shadow-sm">
                MM
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Matematika</p>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Besok, 08:00 WIB</p>
              </div>
            </div>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-[9px] font-bold rounded">PERSIAPAN</span>
          </div>
          <div className="flex items-center justify-between p-3 border border-slate-100 rounded-2xl">
            <div className="flex gap-3 items-center">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center font-black text-red-600 shadow-sm">
                BI
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Bahasa Ing.</p>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Lusa, 10:00 WIB</p>
              </div>
            </div>
            <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[9px] font-bold rounded">DRAFT</span>
          </div>
        </div>
        <div className="mt-auto pt-6 border-t border-slate-100 text-center">
          <Link to="/app/results" className="text-xs font-black text-red-600 hover:text-red-700 transition-colors uppercase tracking-widest flex items-center justify-center gap-1">
            Lihat Hasil Ujian <BookOpenCheck size={14} strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    </div>
  );
}
