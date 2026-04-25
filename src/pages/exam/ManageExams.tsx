import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Trash2, Edit2, Settings, ListChecks } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

interface Exam {
  id: string;
  title: string;
  duration: number;
}

export default function ManageExams() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const { appUser } = useAuthStore();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [formData, setFormData] = useState({ title: '', duration: 60 });
  
  // For managing questions in an exam
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [currentExamId, setCurrentExamId] = useState<string | null>(null);
  const [allQuestions, setAllQuestions] = useState<any[]>([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [assignLoading, setAssignLoading] = useState(false);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    setLoading(true);
    if (!supabase) return;
    const { data } = await supabase.from('exams').select('*').order('created_at', { ascending: false });
    if (data) setExams(data as Exam[]);
    setLoading(false);
  };

  const handleOpenModal = (exam?: Exam) => {
    if (exam) {
      setEditingExam(exam);
      setFormData({ title: exam.title, duration: exam.duration });
    } else {
      setEditingExam(null);
      setFormData({ title: '', duration: 60 });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !appUser) return;
    
    try {
      if (editingExam) {
        await supabase.from('exams').update(formData).eq('id', editingExam.id);
      } else {
        await supabase.from('exams').insert({
          ...formData,
          created_by: appUser.id
        });
      }
      setIsModalOpen(false);
      fetchExams();
    } catch (err: any) {
      alert("Gagal menyimpan ujian: " + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Yakin ingin menghapus ujian ini? Ini juga akan menghapus hasil ujian siswa terkait.")) return;
    if (!supabase) return;
    await supabase.from('exams').delete().eq('id', id);
    fetchExams();
  };

  const openAssignModal = async (examId: string) => {
    setCurrentExamId(examId);
    if (!supabase) return;
    
    // Fetch all questions
    const { data: questions } = await supabase.from('questions').select('id, question, correct_answer');
    if (questions) setAllQuestions(questions);
    
    // Fetch currently mapped questions
    const { data: mapped } = await supabase.from('exam_questions').select('question_id').eq('exam_id', examId);
    if (mapped) setSelectedQuestionIds(mapped.map(m => m.question_id));
    
    setIsAssignModalOpen(true);
  };

  const toggleQuestionSelection = (questionId: string) => {
    setSelectedQuestionIds(prev => 
      prev.includes(questionId) ? prev.filter(id => id !== questionId) : [...prev, questionId]
    );
  };

  const handleSaveAssignments = async () => {
    if (!supabase || !currentExamId) return;
    setAssignLoading(true);
    
    try {
      // 1. Delete all existing mappings for this exam
      await supabase.from('exam_questions').delete().eq('exam_id', currentExamId);
      
      // 2. Insert new mappings
      if (selectedQuestionIds.length > 0) {
        const inserts = selectedQuestionIds.map(qId => ({ exam_id: currentExamId, question_id: qId }));
        await supabase.from('exam_questions').insert(inserts);
      }
      
      setIsAssignModalOpen(false);
      alert("Soal berhasil dihubungkan ke ujian.");
    } catch (err: any) {
      alert("Gagal menyimpan soal ujian: " + err.message);
    } finally {
      setAssignLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 h-full font-sans">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Manajemen Ujian</h2>
          <p className="text-sm font-medium text-slate-500 mt-1">Buat jadwal ujian dan atur soal di dalamnya.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="bg-slate-900 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition shadow-sm">
          <Plus className="w-5 h-5" /> <span className="hidden sm:inline">Buat Ujian Baru</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
             <div className="col-span-full py-12 text-center text-slate-500">Memuat...</div>
        ) : exams.length > 0 ? exams.map((exam) => (
          <div key={exam.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col hover:border-slate-300 transition-all">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center font-black mb-4">
              {exam.title.substring(0, 2).toUpperCase()}
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 mb-2 truncate" title={exam.title}>{exam.title}</h3>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6">Durasi: {exam.duration} Menit</p>
            
            <div className="mt-auto flex flex-col gap-3">
              <button onClick={() => openAssignModal(exam.id)} className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 py-3 rounded-xl font-bold hover:bg-red-100 transition-colors">
                <ListChecks className="w-5 h-5" /> Pilih Soal (Link)
              </button>
              <div className="flex justify-between border-t border-slate-100 pt-3">
                <button onClick={() => handleOpenModal(exam)} className="text-slate-500 hover:text-indigo-600 font-bold text-sm tracking-wide flex items-center gap-1">
                  <Edit2 className="w-4 h-4"/> Edit
                </button>
                <button onClick={() => handleDelete(exam.id)} className="text-slate-500 hover:text-red-600 font-bold text-sm tracking-wide flex items-center gap-1">
                  <Trash2 className="w-4 h-4"/> Hapus
                </button>
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
            <p className="text-slate-500 font-medium">Belum ada ujian yang dibuat.</p>
          </div>
        )}
      </div>

      {/* Modal Buat/Edit Ujian */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 sm:p-8">
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-6">{editingExam ? 'Edit Ujian' : 'Buat Ujian Baru'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Nama Ujian</label>
                <input 
                  required autoFocus
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-red-600 focus:outline-none"
                  placeholder="Misal: UTS Matematika Terapan"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Durasi Pengerjaan (Menit)</label>
                <input 
                  required type="number" min="1" max="300"
                  value={formData.duration}
                  onChange={e => setFormData({...formData, duration: parseInt(e.target.value) || 0})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-red-600 focus:outline-none"
                />
              </div>
              <div className="flex gap-3 justify-end mt-8 pt-6 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 hover:bg-slate-50 rounded-xl font-bold text-slate-500">Batal</button>
                <button type="submit" className="px-5 py-2 bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-200 hover:bg-red-700">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Assign Soal */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[85vh] shadow-2xl flex flex-col overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 bg-slate-50 shrink-0">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Pilih Soal untuk Ujian</h3>
              <p className="text-sm font-medium text-slate-500 mt-1">Pilih soal dari bank soal yang tersedia di bawah.</p>
              <div className="mt-4 p-3 bg-red-100 border border-red-200 rounded-xl text-red-800 text-sm font-bold flex items-center justify-between">
                <span>Soal Terpilih:</span>
                <span className="bg-red-600 text-white px-3 py-1 rounded-lg">{selectedQuestionIds.length} Soal</span>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50">
              {allQuestions.length > 0 ? (
                <div className="space-y-3">
                  {allQuestions.map(q => {
                    const isSelected = selectedQuestionIds.includes(q.id);
                    return (
                      <div 
                        key={q.id} 
                        onClick={() => toggleQuestionSelection(q.id)}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex gap-4 ${isSelected ? 'border-red-600 bg-red-50' : 'border-slate-200 bg-white hover:border-red-300'}`}
                      >
                         <div className={`w-6 h-6 rounded flex items-center justify-center border shrink-0 mt-1 ${isSelected ? 'bg-red-600 border-red-600' : 'bg-white border-slate-300'}`}>
                           {isSelected && <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                         </div>
                         <div className="flex-1">
                           <p className={`text-sm ${isSelected ? 'font-bold text-red-900' : 'font-medium text-slate-700'}`}>{q.question}</p>
                         </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500 font-medium">Bank soal kosong. Tambahkan soal dulu.</div>
              )}
            </div>

            <div className="px-8 py-6 border-t border-slate-100 bg-white shrink-0 flex justify-end gap-3">
              <button type="button" onClick={() => setIsAssignModalOpen(false)} className="px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors tracking-wide">BATAL</button>
              <button type="button" onClick={handleSaveAssignments} disabled={assignLoading} className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-200 hover:bg-red-700 transition-colors tracking-wide flex items-center gap-2 disabled:opacity-50">
                {assignLoading ? 'Menyimpan...' : 'SIMPAN SOAL'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
