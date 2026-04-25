import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import { Clock, ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface Question {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
}

export default function TakeExam() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [exam, setExam] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [examResult, setExamResult] = useState<number | null>(null);

  useEffect(() => {
    fetchExamData();
  }, [id]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) {
      if (timeLeft === 0 && !submitting && questions.length > 0 && examResult === null) {
        handleSubmit();
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => (prev !== null ? prev - 1 : prev));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const fetchExamData = async () => {
    if (!supabase || !id) return;
    try {
      const { data: examData, error: examError } = await supabase
        .from('exams')
        .select('*')
        .eq('id', id)
        .single();
        
      if (examError || !examData) throw new Error('Ujian tidak ditemukan');
      setExam(examData);
      
      setTimeLeft(examData.duration * 60);

      const { data: mappedQ, error: mapError } = await supabase
        .from('exam_questions')
        .select('questions(id, question, option_a, option_b, option_c, option_d)')
        .eq('exam_id', id);
        
      if (mapError) throw mapError;
      
      if (mappedQ) {
        const parsedQ = mappedQ.map(q => q.questions).filter(Boolean) as any as Question[];
        setQuestions(parsedQ);
      }
      
    } catch (err) {
      console.error(err);
      // alert('Terjadi kesalahan saat memuat ujian. Mungkin Supabase belum dikonfigurasi.');
      navigate('/app');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmit = async () => {
    if (!supabase || !user || !exam) return;
    setSubmitting(true);
    setShowConfirmModal(false);
    
    try {
      const { data: correctAnswers } = await supabase
        .from('questions')
        .select('id, correct_answer')
        .in('id', questions.map(q => q.id));
        
      let score = 0;
      if (correctAnswers) {
        const correctMap = correctAnswers.reduce((acc, curr) => ({
           ...acc, 
           [curr.id]: curr.correct_answer 
        }), {} as Record<string, string>);
        
        let correctCount = 0;
        questions.forEach(q => {
          if (answers[q.id] === correctMap[q.id]) {
            correctCount++;
          }
        });
        score = Math.round((correctCount / questions.length) * 100);
      }
      
      await supabase.from('results').insert({
        user_id: user.id,
        exam_id: exam.id,
        score: score
      });
      
      setExamResult(score);
      
    } catch (err) {
      console.error(err);
      // alert('Gagal mengirim jawaban.');
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) return (
    <div className="flex items-center justify-center p-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-red-600"></div>
    </div>
  );
  if (!questions.length) return <div className="p-8 text-center text-red-600 font-bold">Ujian ini tidak memiliki soal.</div>;

  if (examResult !== null) {
    return (
      <div className="max-w-2xl mx-auto mt-12 bg-white rounded-3xl border border-slate-200 shadow-sm p-12 text-center flex flex-col items-center">
         <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
           <Check strokeWidth={3} className="w-12 h-12" />
         </div>
         <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-2">Ujian Selesai!</h2>
         <p className="text-slate-500 font-medium mb-8">Jawaban Anda berhasil disimpan. Berikut adalah nilai Anda:</p>
         
         <div className="text-8xl font-black text-red-600 mb-12">
           {examResult}
         </div>
         
         <button 
           onClick={() => navigate('/app/student-exams')}
           className="px-8 py-4 bg-slate-900 border border-transparent rounded-2xl shadow-lg text-sm font-black text-white hover:bg-black transition-colors uppercase tracking-widest w-full sm:w-auto"
         >
           Kembali ke Dashboard
         </button>
      </div>
    );
  }

  const currentQ = questions[currentIdx];

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col font-sans mb-8">
      {/* Header Info */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Mata Ujian</p>
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">{exam?.title}</h2>
        </div>
        
        <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-bold shadow-sm ${timeLeft && timeLeft < 300 ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-100 text-slate-800'}`}>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest opacity-80 leading-none">Sisa Waktu</span>
            <span className="text-2xl font-mono leading-none mt-1">{timeLeft !== null ? formatTime(timeLeft) : '00:00'}</span>
          </div>
          <Clock className="w-8 h-8 opacity-50" strokeWidth={2.5} />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Question Area */}
        <div className="flex-1 flex flex-col">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 min-h-[400px] flex flex-col">
            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
              <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center font-black text-xl shrink-0">
                {currentIdx + 1}
              </div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                Dari {questions.length} Soal Pilihan Ganda
              </p>
            </div>

            <div className="text-2xl font-bold text-slate-900 mb-10 whitespace-pre-wrap leading-relaxed">
              {currentQ.question}
            </div>

            <div className="space-y-4">
              {['option_a', 'option_b', 'option_c', 'option_d'].map((optKey, i) => {
                const label = String.fromCharCode(65 + i); // A, B, C, D
                const val = (currentQ as any)[optKey];
                const isSelected = answers[currentQ.id] === optKey;
                
                return (
                  <button
                    key={optKey}
                    onClick={() => handleSelectAnswer(currentQ.id, optKey)}
                    className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex items-center gap-6 group
                      ${isSelected 
                        ? 'border-red-600 bg-red-50 shadow-md shadow-red-100' 
                        : 'border-slate-200 hover:border-red-300 hover:bg-slate-50'
                      }
                    `}
                  >
                    <div className={`shrink-0 w-12 h-12 flex items-center justify-center rounded-xl border-2 font-black text-lg transition-colors
                      ${isSelected ? 'border-red-600 bg-red-600 text-white' : 'border-slate-300 text-slate-500 group-hover:border-red-300 group-hover:text-red-600 '}
                    `}>
                      {label}
                    </div>
                    <span className={`text-lg transition-colors ${isSelected ? 'text-red-900 font-bold' : 'text-slate-700 font-medium group-hover:text-slate-900'}`}>
                      {val}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
              disabled={currentIdx === 0}
              className="w-full sm:w-auto flex items-center justify-center px-6 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors uppercase tracking-wide"
            >
              <ChevronLeft className="w-5 h-5 mr-2" strokeWidth={3} />
              Kembali
            </button>
            
            {currentIdx === questions.length - 1 ? (
              <button
                onClick={() => setShowConfirmModal(true)}
                disabled={submitting}
                className="w-full sm:w-auto flex items-center justify-center px-8 py-4 bg-slate-900 border border-transparent rounded-2xl shadow-lg text-sm font-black text-white hover:bg-black disabled:opacity-50 transition-colors uppercase tracking-widest"
              >
                <Check className="w-5 h-5 mr-2" strokeWidth={3} />
                Akhiri Ujian
              </button>
            ) : (
              <button
                onClick={() => setCurrentIdx(prev => Math.min(questions.length - 1, prev + 1))}
                className="w-full sm:w-auto flex items-center justify-center px-8 py-4 bg-red-600 border border-transparent rounded-2xl shadow-lg shadow-red-200 text-sm font-black text-white hover:bg-red-700 transition-colors uppercase tracking-widest"
              >
                Lanjut
                <ChevronRight className="w-5 h-5 ml-2" strokeWidth={3} />
              </button>
            )}
          </div>
        </div>

        {/* Sidebar Nav */}
        <div className="lg:w-80 shrink-0">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 lg:sticky lg:top-4">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6 text-center">Peta Soal</h3>
            <div className="grid grid-cols-5 gap-3">
              {questions.map((q, idx) => {
                const isAnswered = !!answers[q.id];
                const isActive = currentIdx === idx;
                
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIdx(idx)}
                    className={`
                      aspect-square rounded-xl font-bold text-sm flex items-center justify-center transition-all
                      ${isActive 
                        ? 'ring-4 ring-red-200 bg-red-600 text-white' 
                        : isAnswered 
                          ? 'bg-slate-800 text-white hover:bg-slate-900' 
                          : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300'
                      }
                    `}
                  >
                    {idx + 1}
                  </button>
                )
              })}
            </div>
            
            <div className="mt-8 space-y-3 text-xs font-bold uppercase tracking-widest text-slate-500 border-t border-slate-100 pt-6">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-slate-800 rounded-md"></div>
                <span>Sudah Dijawab</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-slate-50 border border-slate-200 rounded-md"></div>
                <span>Belum Dijawab</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-red-600 rounded-md ring-4 ring-red-200"></div>
                <span>Posisi Anda</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-8 text-center flex flex-col items-center">
            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-4">Akhiri Ujian?</h3>
            <p className="text-slate-500 font-medium mb-8">Apakah Anda yakin ingin menyelesaikan ujian ini? Jawaban tidak dapat diubah kembali.</p>
            <div className="flex gap-4 w-full">
               <button 
                 onClick={() => setShowConfirmModal(false)}
                 className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-colors uppercase tracking-wide"
               >
                 Kembali
               </button>
               <button 
                 onClick={handleSubmit}
                 disabled={submitting}
                 className="flex-1 py-4 bg-red-600 text-white font-black rounded-2xl shadow-lg shadow-red-200 hover:bg-red-700 disabled:opacity-50 transition-colors uppercase tracking-wide flex justify-center items-center"
               >
                 {submitting ? 'Memproses...' : 'Ya, Selesai'}
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
