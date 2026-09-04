export type Role = 'STUDENT' | 'ADMIN';

export interface User {
  id: number;
  email: string;
  fullName: string;
  role: Role;
}

export interface AuthResponse {
  token: string;
  expiresInMs: number;
  user: User;
}

export interface TaskCard {
  id: number;
  title: string;
  statementLatex: string;
  solutionLatex?: string;
  subject: string;
  subjectCode: string;
  grade: number;
  difficulty: string;
  difficultyCode: string;
  published: boolean;
  topics: string[];
  videoEmbedUrl?: string;
  pdfUrl?: string;
  publishedAt: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  last: boolean;
}

export interface Option {
  code: string;
  title: string;
}

export interface Dictionaries {
  subjects: Option[];
  difficulties: Option[];
  statuses: Option[];
  topics: string[];
  grades: number[];
}

export interface TaskFilterValues {
  subject: string;
  grade: string;
  difficulty: string;
  topic: string;
}

export interface Student {
  id: number;
  fullName: string;
  email: string;
  grade?: number;
  subject?: string;
  subjectCode?: string;
  goals?: string;
  progressPercent: number;
  notes?: string;
  grades: number[];
}

export interface Assignment {
  id: number;
  taskId: number;
  taskTitle: string;
  deadline?: string;
  status: string;
  statusCode: string;
  grade?: number;
  comment?: string;
}

export interface Cabinet {
  student: Student;
  assignments: Assignment[];
}

export type ReviewStatusCode = 'PENDING' | 'PUBLISHED' | 'REJECTED';

export interface Review {
  id: number;
  authorName: string;
  text: string;
  rating?: number;
  status: string;
  statusCode: ReviewStatusCode;
  createdAt: string;
}

export interface SitePage {
  id: number;
  slug: string;
  title: string;
  htmlContent: string;
  updatedAt: string;
}

export interface TaskPayload {
  title: string;
  statementLatex: string;
  solutionLatex?: string;
  subject: string;
  grade: number;
  difficulty: string;
  topics?: string;
  videoEmbedUrl?: string;
  pdfUrl?: string;
  publishedAt?: string;
  published: boolean;
}

export interface StudentPayload {
  fullName: string;
  email: string;
  password?: string;
  grade?: number;
  subject?: string;
  goals?: string;
  progressPercent?: number;
  notes?: string;
}

export interface AssignmentPayload {
  studentId: number;
  taskId: number;
  deadline?: string;
  status?: string;
  grade?: number;
  comment?: string;
}
