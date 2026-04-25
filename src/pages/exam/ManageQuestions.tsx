import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Trash2, Edit2, CheckCircle2, Search } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

interface Question {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
}

export default function ManageQuestions() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { appUser } = useAuthStore();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    question: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: 'option_a'
  });

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (data) setQuestions(data as Question[]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (q?: Question) => {
    if (q) {
      setEditingId(q.id);
      setFormData({
        question: q.question,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        correct_answer: q.correct_answer
      });
    } else {
      setEditingId(null);
      setFormData({
        question: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_answer: 'option_a'
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !appUser) return;
    
    try {
      if (editingId) {
        await supabase.from('questions').update(formData).eq('id', editingId);
      } else {
        await supabase.from('questions').insert({
          ...formData,
          created_by: appUser.id
        });
      }
      setIsModalOpen(false);
      fetchQuestions();
    } catch (err: any) {
      alert("Gagal menyimpan soal: " + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Yakin ingin menghapus soal ini?")) return;
    if (!supabase) return;
    try {
      await supabase.from('questions').delete().eq('id', id);
      fetchQuestions();
    } catch (err: any) {
      alert("Gagal menghapus soal: " + err.message);
    }
  };

  const filtered = questions.filter(q => q.question.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col gap-6 h-full font-sans">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Bank Soal</h2>
          <p className="text-sm font-medium text-slate-500 mt-1">Kelola daftar soal untuk pembuatan ujian.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              placeholder="Cari..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-white transition-colors font-medium"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          </div>
          <button onClick={() => handleOpenModal()} className="bg-red-600 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-red-700 transition shadow-sm shrink-0">
            <Plus className="w-5 h-5" /> <span className="hidden sm:inline">Tambah Soal</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex-1 overflow-hidden flex flex-col">
        {loading ? (
          <div className="flex-1 flex justify-center items-center">
             <div className="animate-spin rounded-full h-8 w-8 border-b-4 border-red-600"></div>
          </div>
        ) : (
          <div className="overflow-y-auto flex-1 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.length > 0 ? filtered.map((q, idx) => (
                <div key={q.id} className="border border-slate-100 bg-slate-50 p-5 rounded-2xl flex flex-col hover:border-slate-300 hover:shadow-md transition-all">
                  <div className="text-sm font-bold text-slate-900 line-clamp-3 mb-4 flex-1">
                    {q.question}
                  </div>
                  <div className="space-y-2 mb-4">
                     {['option_a', 'option_b', 'option_c', 'option_d'].map((opt, i) => (
                       <div key={opt} className={`text-xs px-3 py-2 rounded-lg font-medium border flex items-center gap-2 ${q.correct_answer === opt ? 'bg-red-50 border-red-200 text-red-800' : 'bg-white border-slate-100 text-slate-600'}`}>
                         <span className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] ${q.correct_answer === opt ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
                           {String.fromCharCode(65 + i)}
                         </span>
                         <span className="truncate">{q[opt as keyof Question]}</span>
                       </div>
                     ))}
                  </div>
                  <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
                    <button onClick={() => handleOpenModal(q)} className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(q.id)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )) : (
                <div className="col-span-full py-12 text-center">
                  <p className="text-slate-500 font-medium">Belum ada soal tersedia.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8">
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-6">{editingId ? 'Edit Soal' : 'Tambah Soal Baru'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Pertanyaan</label>
                <textarea 
                  required
                  value={formData.question}
                  onChange={e => setFormData({...formData, question: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 min-h-[100px] text-sm font-medium focus:ring-2 focus:ring-red-600 focus:outline-none"
                  placeholder="Tuliskan pertanyaan di sini..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {['a', 'b', 'c', 'd'].map(opt => (
                  <div key={opt}>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Opsi {opt.toUpperCase()}</label>
                    <input 
                      required
                      type="text"
                      value={formData[`option_${opt}` as keyof typeof formData]}
                      onChange={e => setFormData({...formData, [`option_${opt}`]: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-red-600 focus:outline-none"
                    />
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Jawaban Benar</label>
                <select 
                  value={formData.correct_answer}
                  onChange={e => setFormData({...formData, correct_answer: e.target.value})}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-red-600 focus:outline-none uppercase tracking-wide cursor-pointer"
                >
                  <option value="option_a">Opsi A</option>
                  <option value="option_b">Opsi B</option>
                  <option value="option_c">Opsi C</option>
                  <option value="option_d">Opsi D</option>
                </select>
              </div>

              <div className="flex gap-3 justify-end mt-8 pt-6 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors tracking-wide">
                  BATAL
                </button>
                <button type="submit" className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-200 hover:bg-red-700 transition-colors tracking-wide flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5"/> SIMPAN SOAL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
