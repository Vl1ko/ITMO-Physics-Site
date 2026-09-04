import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Home } from './pages/Home';
import { StaticPage } from './pages/StaticPage';
import { Contacts } from './pages/Contacts';
import { Catalog } from './pages/Catalog';
import { Reviews } from './pages/Reviews';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Cabinet } from './pages/Cabinet';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminStudents } from './pages/admin/AdminStudents';
import { AdminStudentForm } from './pages/admin/AdminStudentForm';
import { AdminAssignments } from './pages/admin/AdminAssignments';
import { AdminTasks } from './pages/admin/AdminTasks';
import { AdminTaskForm } from './pages/admin/AdminTaskForm';
import { AdminReviews } from './pages/admin/AdminReviews';
import { AdminPages } from './pages/admin/AdminPages';
import { AdminPageEditor } from './pages/admin/AdminPageEditor';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<StaticPage slug="about" />} />
        <Route path="/research" element={<StaticPage slug="research" />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute role="STUDENT" />}>
          <Route path="/cabinet" element={<Cabinet />} />
        </Route>

        <Route element={<ProtectedRoute role="ADMIN" />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/students" replace />} />
            <Route path="students" element={<AdminStudents />} />
            <Route path="students/new" element={<AdminStudentForm />} />
            <Route path="students/:id/edit" element={<AdminStudentForm />} />
            <Route path="students/:id/assignments" element={<AdminAssignments />} />
            <Route path="tasks" element={<AdminTasks />} />
            <Route path="tasks/new" element={<AdminTaskForm />} />
            <Route path="tasks/:id/edit" element={<AdminTaskForm />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="pages" element={<AdminPages />} />
            <Route path="pages/:slug/edit" element={<AdminPageEditor />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
