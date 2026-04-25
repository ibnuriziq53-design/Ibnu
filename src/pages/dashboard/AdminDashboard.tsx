import { Users, FileQuestion, BookOpenCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const stats = [
    { name: 'Total Pengguna', value: '124', icon: Users, color: 'bg-red-600' },
    { name: 'Total Soal', value: '840', icon: FileQuestion, color: 'bg-slate-900' },
    { name: 'Total Ujian', value: '12', icon: BookOpenCheck, color: 'bg-slate-700' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
      <div className="lg:col-span-8 flex flex-col gap-6">
        <div className="bg-red-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-red-200/50">
          <div className="relative z-10">
            <h4 className="text-4xl font-black mb-2 leading-none uppercase">Admin Control Panel</h4>
            <p className="text-red-100 text-sm font-semibold opacity-90 max-w-md mt-4">
              Kelola pengguna, soal, dan ujian dari satu tempat. Sistem CBT Prima Unggul berjalan normal.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/app/users" className="px-6 py-3 bg-white text-red-600 font-bold rounded-xl shadow-lg hover:scale-105 transition-transform inline-flex items-center gap-2">
                <Users size={18} strokeWidth={2.5} /> Kelola User
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
        <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Aktivitas Terbaru</h4>
        <div className="flex-1 space-y-6 overflow-y-auto pr-2">
          <div className="border-l-4 border-red-600 pl-4 py-1">
            <p className="text-xs text-slate-400 font-bold mb-1">Baru Saja</p>
            <p className="text-sm font-bold text-slate-800 leading-tight">Guru "Budi" menambahkan 15 soal baru.</p>
          </div>
          <div className="border-l-4 border-slate-200 pl-4 py-1">
            <p className="text-xs text-slate-400 font-bold mb-1">2 Jam Lalu</p>
            <p className="text-sm font-bold text-slate-800 leading-tight">Ujian "Simulasi UN" telah selesai dengan 45 peserta.</p>
          </div>
          <div className="border-l-4 border-slate-200 pl-4 py-1">
            <p className="text-xs text-slate-400 font-bold mb-1">Kemarin</p>
            <p className="text-sm font-bold text-slate-800 leading-tight">Backup database berhasil dilakukan otomatis.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
