import { api } from './client';
import type {
  Assignment,
  AssignmentPayload,
  AuthResponse,
  Cabinet,
  Dictionaries,
  Page,
  Review,
  SitePage,
  Student,
  StudentPayload,
  TaskCard,
  TaskFilterValues,
  TaskPayload,
  User,
} from '../types';

export function buildTaskQuery(filter: Partial<TaskFilterValues>, page = 0, size = 10): string {
  const params = new URLSearchParams();
  if (filter.subject) params.set('subject', filter.subject);
  if (filter.grade) params.set('grade', filter.grade);
  if (filter.difficulty) params.set('difficulty', filter.difficulty);
  if (filter.topic) params.set('topic', filter.topic);
  params.set('page', String(page));
  params.set('size', String(size));
  return params.toString();
}

export const authApi = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>('/api/auth/login', { email, password }),
  register: (payload: {
    fullName: string;
    email: string;
    password: string;
    grade?: number;
    subject?: string;
  }) => api.post<AuthResponse>('/api/auth/register', payload),
  me: () => api.get<User>('/api/auth/me'),
};

export const catalogApi = {
  list: (filter: Partial<TaskFilterValues>, page = 0, size = 10) =>
    api.get<Page<TaskCard>>(`/api/tasks?${buildTaskQuery(filter, page, size)}`),
  dictionaries: () => api.get<Dictionaries>('/api/tasks/dictionaries'),
};

export const publicApi = {
  page: (slug: string) => api.get<SitePage>(`/api/pages/${slug}`),
  reviews: () => api.get<Review[]>('/api/reviews'),
};

export const cabinetApi = {
  load: () => api.get<Cabinet>('/api/cabinet'),
  submitReview: (text: string, rating?: number) =>
    api.post<Review>('/api/cabinet/reviews', { text, rating }),
};

export const adminApi = {
  students: {
    list: () => api.get<Student[]>('/api/admin/students'),
    one: (id: number) => api.get<Student>(`/api/admin/students/${id}`),
    create: (payload: StudentPayload) => api.post<Student>('/api/admin/students', payload),
    update: (id: number, payload: StudentPayload) =>
      api.put<Student>(`/api/admin/students/${id}`, payload),
    remove: (id: number) => api.delete<void>(`/api/admin/students/${id}`),
    exportExcel: () => api.download('/api/admin/students/export', 'students.xlsx'),
    assignments: (id: number) => api.get<Assignment[]>(`/api/admin/students/${id}/assignments`),
    createAssignment: (id: number, payload: AssignmentPayload) =>
      api.post<Assignment>(`/api/admin/students/${id}/assignments`, payload),
    removeAssignment: (id: number, assignmentId: number) =>
      api.delete<void>(`/api/admin/students/${id}/assignments/${assignmentId}`),
  },
  tasks: {
    list: () => api.get<TaskCard[]>('/api/admin/tasks'),
    one: (id: number) => api.get<TaskCard>(`/api/admin/tasks/${id}`),
    create: (payload: TaskPayload) => api.post<TaskCard>('/api/admin/tasks', payload),
    update: (id: number, payload: TaskPayload) => api.put<TaskCard>(`/api/admin/tasks/${id}`, payload),
    remove: (id: number) => api.delete<void>(`/api/admin/tasks/${id}`),
  },
  reviews: {
    list: () => api.get<Review[]>('/api/admin/reviews'),
    setStatus: (id: number, status: string) =>
      api.patch<void>(`/api/admin/reviews/${id}/status`, { status }),
    remove: (id: number) => api.delete<void>(`/api/admin/reviews/${id}`),
  },
  pages: {
    list: () => api.get<SitePage[]>('/api/admin/pages'),
    one: (slug: string) => api.get<SitePage>(`/api/admin/pages/${slug}`),
    update: (slug: string, title: string, htmlContent: string) =>
      api.put<SitePage>(`/api/admin/pages/${slug}`, { title, htmlContent }),
  },
};
