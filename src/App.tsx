/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/useAuthStore';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './components/DashboardLayout';
import DashboardIndex from './pages/dashboard/index';
import StudentDashboard from './pages/dashboard/StudentDashboard';
import TakeExam from './pages/exam/TakeExam';
import ManageUsers from './pages/admin/ManageUsers';
import ManageQuestions from './pages/exam/ManageQuestions';
import ManageExams from './pages/exam/ManageExams';
import ExamResults from './pages/exam/ExamResults';

export default function App() {
  const { initialize, isLoading } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        
        <Route path="/app" element={<DashboardLayout />}>
          <Route index element={<DashboardIndex />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="questions" element={<ManageQuestions />} />
          <Route path="exams" element={<ManageExams />} />
          <Route path="student-exams" element={<StudentDashboard />} />
          <Route path="results" element={<ExamResults />} />
          <Route path="exams/take/:id" element={<TakeExam />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}


