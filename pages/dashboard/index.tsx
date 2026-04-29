import { useAuthStore } from '@/store/useAuthStore';
import AdminDashboard from './AdminDashboard';
import TeacherDashboard from './TeacherDashboard';
import StudentDashboard from './StudentDashboard';

export default function DashboardIndex() {
  const { appUser } = useAuthStore();
  const role = appUser?.role || 'siswa';

  if (role === 'admin') return <AdminDashboard />;
  if (role === 'guru') return <TeacherDashboard />;
  return <StudentDashboard />;
}
