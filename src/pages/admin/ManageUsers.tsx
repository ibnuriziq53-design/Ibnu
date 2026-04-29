import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Trash2, UserCog, Search } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

export default function ManageUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { appUser } = useAuthStore();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (data) setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    if (!supabase || appUser?.role !== 'admin') return;
    
    // Prevent removing own admin access directly to stay safe
    if (userId === appUser.id && newRole !== 'admin') {
      alert('Tidak bisa mengubah role admin Anda sendiri secara langsung.');
      return;
    }

    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId);
        
      if (error) throw error;
      fetchUsers();
    } catch (err: any) {
      alert('Gagal update role: ' + err.message);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(search.toLowerCase()) || 
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 h-full font-sans">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Manajemen Pengguna</h2>
          <p className="text-sm font-medium text-slate-500 mt-1">Kelola hak akses dan data pengguna CBT.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Cari user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-white transition-colors font-medium"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex-1 overflow-hidden flex flex-col">
        {loading ? (
          <div className="flex-1 flex justify-center items-center">
             <div className="animate-spin rounded-full h-8 w-8 border-b-4 border-red-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="py-4 px-6 text-xs font-black text-slate-500 uppercase tracking-widest">Nama Lengkap</th>
                  <th className="py-4 px-6 text-xs font-black text-slate-500 uppercase tracking-widest">Email / NIS</th>
                  <th className="py-4 px-6 text-xs font-black text-slate-500 uppercase tracking-widest">Role Akses</th>
                  <th className="py-4 px-6 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? filteredUsers.map((u) => (
                  <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-800">{u.name}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-slate-600 font-medium">{u.email}</div>
                    </td>
                    <td className="py-4 px-6">
                      <select 
                        value={u.role}
                        onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                        disabled={appUser?.role !== 'admin'}
                        className={`text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg outline-none
                          ${u.role === 'admin' ? 'bg-red-100 text-red-700 border-red-200' : 
                            u.role === 'guru' ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 
                            'bg-slate-100 text-slate-700 border-slate-200'} border cursor-pointer`
                        }
                      >
                        <option value="admin">Admin</option>
                        <option value="guru">Guru</option>
                        <option value="siswa">Siswa</option>
                      </select>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button 
                        onClick={async () => {
                          if (window.confirm('Yakin ingin menghapus pengguna ini? Semua data terkait juga akan terhapus.')) {
                            if (!supabase) return;
                            try {
                              const { error } = await supabase.rpc('delete_user', { target_user_id: u.id });
                              if (error) throw error;
                              fetchUsers();
                            } catch (err: any) {
                              alert('Gagal menghapus user: ' + err.message);
                            }
                          }
                        }}
                        disabled={appUser?.role !== 'admin' || u.id === appUser.id}
                        className={`p-2 rounded-lg transition-colors ${
                          appUser?.role !== 'admin' || u.id === appUser.id 
                            ? 'text-slate-300 cursor-not-allowed' 
                            : 'text-slate-500 hover:text-red-600 hover:bg-red-50'
                        }`}
                        title={u.id === appUser?.id ? "Tidak bisa menghapus diri sendiri" : "Hapus Pengguna"}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-500 font-medium">TIdak ada user yang ditemukan.</td>
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
