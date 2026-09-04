import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { catalogApi } from '../api/endpoints';
import { ApiError } from '../api/client';
import type { Option } from '../types';
import type { ChangeEvent, FormEvent } from 'react';

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState<Option[]>([]);
  const [form, setForm] = useState({ fullName: '', email: '', password: '', grade: '', subject: '' });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    catalogApi.dictionaries().then((d) => setSubjects(d.subjects)).catch(() => setSubjects([]));
  }, []);

  const update = (field: keyof typeof form) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setFieldErrors({});
    setSubmitting(true);
    try {
      await register({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        grade: form.grade ? Number(form.grade) : undefined,
        subject: form.subject || undefined,
      });
      navigate('/cabinet', { replace: true });
    } catch (e) {
      if (e instanceof ApiError) {
        setError(e.message);
        setFieldErrors(e.fields ?? {});
      } else {
        setError('Не удалось зарегистрироваться');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section>
      <div className="container">
        <div className="form-card">
          <h2 className="section-title">Регистрация ученика</h2>
          {error && <div className="alert alert-err">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="fullName">ФИО</label>
              <input id="fullName" value={form.fullName} onChange={update('fullName')} required />
              {fieldErrors.fullName && <span className="error">{fieldErrors.fullName}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" value={form.email} onChange={update('email')} required />
              {fieldErrors.email && <span className="error">{fieldErrors.email}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="password">Пароль</label>
              <input
                id="password"
                type="password"
                minLength={6}
                value={form.password}
                onChange={update('password')}
                required
              />
              {fieldErrors.password && <span className="error">{fieldErrors.password}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="grade">Класс / курс</label>
              <input id="grade" type="number" min={1} max={11} value={form.grade} onChange={update('grade')} />
              {fieldErrors.grade && <span className="error">{fieldErrors.grade}</span>}
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

            <button type="submit" className="btn" style={{ width: '100%' }} disabled={submitting}>
              {submitting ? 'Отправка...' : 'Зарегистрироваться'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
