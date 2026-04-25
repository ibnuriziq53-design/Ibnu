import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { 
  LogOut, 
  LayoutDashboard, 
  Users, 
  FileQuestion, 
  BookOpenCheck,
  ClipboardList,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

export default function DashboardLayout() {
  const { user, appUser, isLoading, signOut } = useAuthStore();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const role = appUser?.role || 'siswa';

  const navItems = [
    { name: 'Dashboard', href: '/app', icon: LayoutDashboard, roles: ['admin', 'guru', 'siswa'] },
    { name: 'Manajemen User', href: '/app/users', icon: Users, roles: ['admin'] },
    { name: 'Bank Soal', href: '/app/questions', icon: FileQuestion, roles: ['admin', 'guru'] },
    { name: 'Manajemen Ujian', href: '/app/exams', icon: BookOpenCheck, roles: ['admin', 'guru'] },
    { name: 'Daftar Ujian', href: '/app/student-exams', icon: BookOpenCheck, roles: ['siswa'] },
    { name: 'Hasil Ujian', href: '/app/results', icon: ClipboardList, roles: ['admin', 'guru', 'siswa'] },
  ];

  const allowedNavItems = navItems.filter(item => item.roles.includes(role));

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden flex-col md:flex-row">
      {/* Mobile Sidebar Toggle */}
      <div className="md:hidden bg-white border-b border-slate-200 text-slate-900 flex justify-between items-center p-4 shrink-0">
        <div className="font-bold text-lg flex items-center gap-2">
          <BookOpenCheck className="w-5 h-5 text-red-600" />
          CBT App
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 mb-4">
          <h1 className="text-2xl font-extrabold tracking-tighter text-red-600">PRIMA<span className="text-slate-900 underline decoration-4 decoration-red-600 underline-offset-4">UNGGUL</span></h1>
          <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">CBT System v2.0</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {allowedNavItems.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-red-50 text-red-600 font-bold' 
                    : 'text-slate-500 hover:bg-slate-50 font-semibold'
                }`}
              >
                <Icon className={`${isActive ? 'text-red-600' : 'text-slate-500'} shrink-0`} size={20} strokeWidth={2.5} />
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-slate-100 mt-auto">
          <button
            onClick={() => signOut()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-red-600 transition-colors"
          >
            <LogOut size={18} strokeWidth={2.5} />
            LOGOUT SYSTEM
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0 hidden md:flex">
          <div className="flex flex-col">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Selamat Datang</h2>
            <h3 className="text-xl font-extrabold text-slate-900">{appUser?.name || user.email}</h3>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right mr-2">
              <p className="text-xs font-bold text-slate-500">{role.toUpperCase()}</p>
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Sistem Ujian Online</p>
            </div>
            <div className="h-10 w-10 bg-red-100 border-2 border-red-600 rounded-full flex items-center justify-center font-bold text-red-600">
              {(appUser?.name || user.email || 'U').substring(0, 2).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          <Outlet />
        </div>
      </main>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-30 md:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
