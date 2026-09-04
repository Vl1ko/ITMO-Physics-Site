import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminApi, catalogApi } from '../../api/endpoints';
import { ApiError } from '../../api/client';
import type { Option, StudentPayload } from '../../types';
import type { ChangeEvent, FormEvent } from 'react';

interface FormState {
  fullName: string;
  email: string;
  password: string;
  grade: string;
  subject: string;
  goals: string;
  progressPercent: string;
  notes: string;
}

const EMPTY: FormState = {
  fullName: '',
  email: '',
  password: '',
  grade: '',
  subject: '',
  goals: '',
  progressPercent: '0',
  notes: '',
};

export function AdminStudentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState<FormState>(EMPTY);
  const [subjects, setSubjects] = useState<Option[]>([]);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    catalogApi
      .dictionaries()
      .then((dictionaries) => setSubjects(dictionaries.subjects))
      .catch(() => setSubjects([]));
  }, []);

  useEffect(() => {
    if (!id) return;
    adminApi.students
      .one(Number(id))
      .then((student) =>
        setForm({
          fullName: student.fullName,
          email: student.email,
          password: '',
          grade: student.grade != null ? String(student.grade) : '',
          subject: student.subjectCode ?? '',
          goals: student.goals ?? '',
          progressPercent: String(student.progressPercent ?? 0),
          notes: student.notes ?? '',
        }),
      )
      .catch(() => setError('Не удалось загрузить ученика'));
  }, [id]);

  const update =
    (field: keyof FormState) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setFieldErrors({});
    setSubmitting(true);

    const payload: StudentPayload = {
      fullName: form.fullName,
      email: form.email,
      password: form.password || undefined,
      grade: form.grade ? Number(form.grade) : undefined,
      subject: form.subject || undefined,
      goals: form.goals || undefined,
      progressPercent: form.progressPercent ? Number(form.progressPercent) : 0,
      notes: form.notes || undefined,
    };

    try {
      if (isEdit) {
        await adminApi.students.update(Number(id), payload);
      } else {
        await adminApi.students.create(payload);
      }
      navigate('/admin/students');
    } catch (e) {
      if (e instanceof ApiError) {
        setError(e.message);
        setFieldErrors(e.fields ?? {});
      } else {
        setError('Не удалось сохранить');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="form-card">
      <h2 className="section-title">{isEdit ? 'Редактирование ученика' : 'Новый ученик'}</h2>
      {error && <div className="alert alert-err">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="fullName">ФИО ученика</label>
          <input id="fullName" value={form.fullName} onChange={update('fullName')} required />
          {fieldErrors.fullName && <span className="error">{fieldErrors.fullName}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" value={form.email} onChange={update('email')} required />
          {fieldErrors.email && <span className="error">{fieldErrors.email}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="password">
            {isEdit ? 'Новый пароль (пусто - не менять)' : 'Пароль (пусто - student123)'}
          </label>
          <input id="password" type="password" value={form.password} onChange={update('password')} />
        </div>
        <div className="form-group">
          <label htmlFor="grade">Класс / курс</label>
          <input id="grade" type="number" min={1} max={11} value={form.grade} onChange={update('grade')} />
        </div>
        <div className="form-group">
          <label htmlFor="subject">Предмет</label>
          <select id="subject" value={form.subject} onChange={update('subject')}>
            <option value="">- не выбран -</option>
            {subjects.map((option) => (
              <option key={option.code} value={option.code}>
                {option.title}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="goals">Цели и задачи ученика</label>
          <textarea id="goals" value={form.goals} onChange={update('goals')} />
        </div>
        <div className="form-group">
          <label htmlFor="progressPercent">Текущий прогресс, %</label>
          <input
            id="progressPercent"
            type="number"
            min={0}
            max={100}
            value={form.progressPercent}
            onChange={update('progressPercent')}
          />
        </div>
        <div className="form-group">
          <label htmlFor="notes">Комментарий / заметки</label>
          <textarea id="notes" value={form.notes} onChange={update('notes')} />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn" disabled={submitting}>
            Сохранить
          </button>
          <button type="button" className="btn btn-outline" onClick={() => navigate('/admin/students')}>
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
}
