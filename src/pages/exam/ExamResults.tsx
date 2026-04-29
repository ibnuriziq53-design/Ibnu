import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import { ClipboardList, GraduationCap, CheckCircle } from 'lucide-react';

export default function ExamResults() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { appUser } = useAuthStore();

  useEffect(() => {
    fetchResults();
  }, [appUser]);

  const fetchResults = async () => {
    if (!supabase || !appUser) return;
    setLoading(true);
    
    try {
      let query = supabase
        .from('results')
        .select(`
          id,
          score,
          created_at,
          exams (title, duration),
          users (name, email)
        `)
        .order('created_at', { ascending: false });

      // Jika user adalah siswa, hanya lihat nilainya sendiri
      if (appUser.role === 'siswa') {
        query = query.eq('user_id', appUser.id);
      }
      
      const { data, error } = await query;
      if (data) setResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-100 border-emerald-200';
    if (score >= 60) return 'text-amber-600 bg-amber-100 border-amber-200';
    return 'text-red-600 bg-red-100 border-red-200';
  };

  return (
    <div className="flex flex-col gap-6 h-full font-sans">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
        <div className="p-4 bg-red-100 text-red-600 rounded-2xl shrink-0">
          <ClipboardList className="w-8 h-8" strokeWidth={2.5} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Hasil Ujian</h2>
          <p className="text-sm font-medium text-slate-500 mt-1">
            {appUser?.role === 'siswa' ? 'Daftar nilai dari ujian yang telah Anda kerjakan.' : 'Rekapitulasi nilai hasil ujian seluruh siswa.'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex-1 overflow-hidden flex flex-col">
        {loading ? (
          <div className="flex-1 flex justify-center items-center">
             <div className="animate-spin rounded-full h-8 w-8 border-b-4 border-red-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="py-5 px-6 text-xs font-black text-slate-500 uppercase tracking-widest rounded-tl-3xl">Waktu Selesai</th>
                  <th className="py-5 px-6 text-xs font-black text-slate-500 uppercase tracking-widest">Judul Ujian</th>
                  {appUser?.role !== 'siswa' && (
                    <th className="py-5 px-6 text-xs font-black text-slate-500 uppercase tracking-widest">Nama Peserta</th>
                  )}
                  <th className="py-5 px-6 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Skor Akhir</th>
                  <th className="py-5 px-6 rounded-tr-3xl"></th>
                </tr>
              </thead>
              <tbody>
                {results.length > 0 ? results.map((r) => {
                  const score = r.score;
                  return (
                    <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="text-sm font-bold text-slate-600">
                          {new Date(r.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                        <div className="text-[10px] uppercase font-bold text-slate-400">
                          {new Date(r.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-extrabold text-slate-900">{r.exams?.title || 'Ujian Terhapus'}</div>
                      </td>
                      {appUser?.role !== 'siswa' && (
                        <td className="py-4 px-6">
                          <div className="font-bold text-slate-700">{r.users?.name || 'User Tidak Diketahui'}</div>
                          <div className="text-xs text-slate-500">{r.users?.email}</div>
                        </td>
                      )}
                      <td className="py-4 px-6 text-right">
                        <span className={`inline-flex items-center justify-center px-4 py-1.5 rounded-lg border font-black text-lg ${getScoreColor(score)}`}>
                          {score}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex justify-center text-emerald-500">
                           <CheckCircle className="w-5 h-5" />
                        </div>
                      </td>
                    </tr>
                  )
                }) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center">
                      <GraduationCap className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                      <p className="text-slate-500 font-bold text-lg">Belum ada hasil ujian</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
