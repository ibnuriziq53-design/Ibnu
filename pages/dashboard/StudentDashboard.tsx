import { useState, useEffect } from 'react';
import { BookOpenCheck, Clock, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function StudentDashboard() {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    if (!supabase) return;
    try {
      // Get assigned exams (all for demo) and check results
      const { data, error } = await supabase
        .from('exams')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (data) setExams(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse flex space-x-4">
        <div className="flex-1 space-y-4 py-1">
          <div className="h-4 bg-slate-200 rounded w-3/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-slate-200 rounded"></div>
            <div className="h-4 bg-slate-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  const nextExam = exams.length > 0 ? exams[0] : null;
  const otherExams = exams.length > 1 ? exams.slice(1) : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
      <div className="lg:col-span-8 flex flex-col gap-6">
        {nextExam ? (
          <div className="bg-red-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-red-200/50">
            <div className="relative z-10">
              <h4 className="text-4xl font-black mb-2 leading-none uppercase">{nextExam.title}</h4>
              <p className="text-red-100 text-sm font-semibold opacity-90 max-w-md mt-4">
                Pastikan koneksi internet stabil sebelum memulai ujian. Waktu akan berjalan otomatis setelah Anda klik mulai.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <button 
                  onClick={() => navigate(`/app/exams/take/${nextExam.id}`)}
                  className="px-6 py-3 bg-white text-red-600 font-bold rounded-xl shadow-lg hover:scale-105 transition-transform"
                >
                  Mulai Ujian Sekarang
                </button>
                <div className="flex items-center gap-2 px-4 py-2 border border-white/30 rounded-xl backdrop-blur-sm">
                  <span className="text-xs font-bold uppercase opacity-60">Durasi:</span>
                  <span className="font-mono font-bold">{nextExam.duration} MENIT</span>
                </div>
              </div>
            </div>
            <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center shadow-sm">
            <BookOpenCheck className="mx-auto h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-800">Belum ada ujian</h3>
            <p className="mt-1 text-sm font-medium text-slate-500">Saat ini tidak ada ujian aktif yang tersedia untuk Anda.</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Ujian Lainnya</p>
            <div className="space-y-4">
              {otherExams.length > 0 ? (
                otherExams.slice(0, 3).map((exam) => (
                  <div key={exam.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border border-slate-100 rounded-2xl gap-3">
                    <div className="flex gap-3 items-center">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center font-black text-slate-700 shadow-sm shrink-0">
                        {exam.title.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 truncate max-w-[150px]">{exam.title}</p>
                        <p className="text-[10px] text-slate-400 font-semibold uppercase">{exam.duration} MENIT</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => navigate(`/app/exams/take/${exam.id}`)}
                      className="px-3 py-1.5 bg-red-50 text-red-600 text-[10px] font-bold rounded-lg hover:bg-red-100 transition-colors uppercase"
                    >
                      Mulai
                    </button>
                  </div>
                ))
              ) : (
                 <p className="text-sm font-medium text-slate-400">Tidak ada ujian lain di antrean.</p>
              )}
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Rata-rata Nilai (Contoh)</p>
            <div className="flex items-baseline gap-2">
              <span className="text-6xl font-black text-slate-900">88</span>
              <span className="text-xl font-bold text-red-600">/100</span>
            </div>
            <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-red-600 w-[88%]"></div>
            </div>
            <p className="text-[10px] text-slate-400 font-semibold mt-2 italic">Meningkat 4% dari bulan lalu</p>
          </div>
        </div>
      </div>

      <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col h-full min-h-[400px]">
        <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Pengumuman Akademik</h4>
        <div className="flex-1 space-y-6 overflow-y-auto pr-2">
          <div className="border-l-4 border-red-600 pl-4 py-1">
            <p className="text-xs text-slate-400 font-bold mb-1">12 Okt 2026</p>
            <p className="text-sm font-bold text-slate-800 leading-tight">Ujian Tengah Semester Ganjil akan dilaksanakan secara serentak.</p>
          </div>
          <div className="border-l-4 border-slate-200 pl-4 py-1">
            <p className="text-xs text-slate-400 font-bold mb-1">10 Okt 2026</p>
            <p className="text-sm font-bold text-slate-800 leading-tight">Mohon lengkapi biodata pada menu profil sebelum tanggal 15.</p>
          </div>
          <div className="border-l-4 border-slate-200 pl-4 py-1">
            <p className="text-xs text-slate-400 font-bold mb-1">08 Okt 2026</p>
            <p className="text-sm font-bold text-slate-800 leading-tight">Server CBT akan mengalami pemeliharaan rutin pada hari Minggu.</p>
          </div>
        </div>
        <div className="mt-auto pt-6 border-t border-slate-100 text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Butuh Bantuan?</p>
          <p className="text-xs font-black text-red-600">Hubungi Admin TU</p>
        </div>
      </div>
    </div>
  );
}
