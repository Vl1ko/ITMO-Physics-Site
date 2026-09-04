import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminApi } from '../../api/endpoints';
import { ApiError } from '../../api/client';
import { RichTextEditor } from '../../components/RichTextEditor';
import type { FormEvent } from 'react';

export function AdminPageEditor() {
  const { slug = '' } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    adminApi.pages
      .one(slug)
      .then((page) => {
        setTitle(page.title);
        setHtmlContent(page.htmlContent ?? '');
      })
      .catch(() => setError('Не удалось загрузить страницу'));
  }, [slug]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);
    try {
      await adminApi.pages.update(slug, title, htmlContent);
      setMessage('Страница сохранена');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Не удалось сохранить');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="form-card wide">
      <h2 className="section-title">Редактирование: {title}</h2>
      {message && <div className="alert alert-ok">{message}</div>}
      {error && <div className="alert alert-err">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Заголовок</label>
          <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Содержимое</label>
          <RichTextEditor value={htmlContent} onChange={setHtmlContent} />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn" disabled={submitting}>
            Сохранить
          </button>
          <button type="button" className="btn btn-outline" onClick={() => navigate('/admin/pages')}>
            Назад
          </button>
        </div>
      </form>
    </div>
  );
}
