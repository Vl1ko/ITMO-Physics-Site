import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminApi, catalogApi } from '../../api/endpoints';
import { ApiError } from '../../api/client';
import { Latex } from '../../components/Latex';
import type { Option, TaskPayload } from '../../types';
import type { ChangeEvent, FormEvent } from 'react';

interface FormState {
  title: string;
  statementLatex: string;
  solutionLatex: string;
  subject: string;
  grade: string;
  difficulty: string;
  topics: string;
  videoEmbedUrl: string;
  pdfUrl: string;
  publishedAt: string;
  published: boolean;
}

const EMPTY: FormState = {
  title: '',
  statementLatex: '',
  solutionLatex: '',
  subject: 'PHYSICS',
  grade: '10',
  difficulty: 'MEDIUM',
  topics: '',
  videoEmbedUrl: '',
  pdfUrl: '',
  publishedAt: '',
  published: true,
};

export function AdminTaskForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState<FormState>(EMPTY);
  const [subjects, setSubjects] = useState<Option[]>([]);
  const [difficulties, setDifficulties] = useState<Option[]>([]);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    catalogApi
      .dictionaries()
      .then((dictionaries) => {
        setSubjects(dictionaries.subjects);
        setDifficulties(dictionaries.difficulties);
      })
      .catch(() => setError('Не удалось загрузить справочники'));
  }, []);

  useEffect(() => {
    if (!id) return;
    adminApi.tasks
      .one(Number(id))
      .then((task) =>
        setForm({
          title: task.title,
          statementLatex: task.statementLatex,
          solutionLatex: task.solutionLatex ?? '',
          subject: task.subjectCode,
          grade: String(task.grade),
          difficulty: task.difficultyCode,
          topics: task.topics.join(', '),
          videoEmbedUrl: task.videoEmbedUrl ?? '',
          pdfUrl: task.pdfUrl ?? '',
          publishedAt: task.publishedAt,
          published: task.published,
        }),
      )
      .catch(() => setError('Не удалось загрузить задачу'));
  }, [id]);

  const update =
    (field: keyof FormState) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const target = event.target;
      const value = target instanceof HTMLInputElement && target.type === 'checkbox' ? target.checked : target.value;
      setForm((prev) => ({ ...prev, [field]: value }));
    };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setFieldErrors({});
    setSubmitting(true);

    const payload: TaskPayload = {
      title: form.title,
      statementLatex: form.statementLatex,
      solutionLatex: form.solutionLatex || undefined,
      subject: form.subject,
      grade: Number(form.grade),
      difficulty: form.difficulty,
      topics: form.topics || undefined,
      videoEmbedUrl: form.videoEmbedUrl || undefined,
      pdfUrl: form.pdfUrl || undefined,
      publishedAt: form.publishedAt || undefined,
      published: form.published,
    };

    try {
      if (isEdit) {
        await adminApi.tasks.update(Number(id), payload);
      } else {
        await adminApi.tasks.create(payload);
      }
      navigate('/admin/tasks');
    } catch (e) {
      if (e instanceof ApiError) {
        setError(e.message);
        setFieldErrors(e.fields ?? {});
      } else {
        setError('Не удалось сохранить задачу');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="form-card wide">
      <h2 className="section-title">{isEdit ? 'Редактирование задачи' : 'Новая задача'}</h2>
      {error && <div className="alert alert-err">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Название</label>
          <input id="title" value={form.title} onChange={update('title')} required />
          {fieldErrors.title && <span className="error">{fieldErrors.title}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="statementLatex">Условие (LaTeX, формулы в $...$)</label>
          <textarea id="statementLatex" value={form.statementLatex} onChange={update('statementLatex')} required />
          {fieldErrors.statementLatex && <span className="error">{fieldErrors.statementLatex}</span>}
          {form.statementLatex && (
            <div style={{ marginTop: 8 }}>
              <small className="muted">Предпросмотр:</small>
              <Latex content={form.statementLatex} />
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="solutionLatex">Решение (LaTeX)</label>
          <textarea id="solutionLatex" value={form.solutionLatex} onChange={update('solutionLatex')} />
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label htmlFor="subject">Предмет</label>
            <select id="subject" value={form.subject} onChange={update('subject')}>
              {subjects.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.title}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="grade">Класс / курс</label>
            <input id="grade" type="number" min={1} max={11} value={form.grade} onChange={update('grade')} required />
          </div>
          <div className="form-group">
            <label htmlFor="difficulty">Сложность</label>
            <select id="difficulty" value={form.difficulty} onChange={update('difficulty')}>
              {difficulties.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.title}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="topics">Темы (через запятую)</label>
            <input
              id="topics"
              value={form.topics}
              onChange={update('topics')}
              placeholder="Термодинамика, Газовые законы"
            />
          </div>
          <div className="form-group">
            <label htmlFor="videoEmbedUrl">Видео-разбор (embed-URL: YouTube / VK / Дзен)</label>
            <input
              id="videoEmbedUrl"
              type="url"
              value={form.videoEmbedUrl}
              onChange={update('videoEmbedUrl')}
              placeholder="https://www.youtube.com/embed/..."
            />
          </div>
          <div className="form-group">
            <label htmlFor="pdfUrl">Ссылка на PDF</label>
            <input id="pdfUrl" type="url" value={form.pdfUrl} onChange={update('pdfUrl')} />
          </div>
          <div className="form-group">
            <label htmlFor="publishedAt">Дата публикации</label>
            <input id="publishedAt" type="date" value={form.publishedAt} onChange={update('publishedAt')} />
          </div>
          <div className="form-group">
            <label htmlFor="published">
              <input
                id="published"
                type="checkbox"
                checked={form.published}
                onChange={update('published')}
                style={{ width: 'auto', marginRight: 6 }}
              />
              Опубликована
            </label>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn" disabled={submitting}>
            Сохранить
          </button>
          <button type="button" className="btn btn-outline" onClick={() => navigate('/admin/tasks')}>
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
}
