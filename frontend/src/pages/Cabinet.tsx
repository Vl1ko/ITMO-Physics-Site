import { useEffect, useState } from 'react';
import { cabinetApi } from '../api/endpoints';
import { ApiError } from '../api/client';
import type { Cabinet as CabinetData } from '../types';
import type { FormEvent } from 'react';

export function Cabinet() {
  const [data, setData] = useState<CabinetData | null>(null);
  const [error, setError] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    cabinetApi
      .load()
      .then(setData)
      .catch((e) => setError(e instanceof ApiError ? e.message : 'Не удалось загрузить кабинет'));
  }, []);

  const submitReview = async (event: FormEvent) => {
    event.preventDefault();
    setMessage('');
    setError('');
    setSubmitting(true);
    try {
      await cabinetApi.submitReview(reviewText, rating ? Number(rating) : undefined);
      setReviewText('');
      setRating('');
      setMessage('Спасибо! Отзыв отправлен на модерацию.');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Не удалось отправить отзыв');
    } finally {
      setSubmitting(false);
    }
  };

  if (error && !data) {
    return (
      <section className="container">
        <div className="alert alert-err">{error}</div>
      </section>
    );
  }
  if (!data) {
    return (
      <section className="container">
        <p className="muted">Загрузка...</p>
      </section>
    );
  }

  const { student, assignments } = data;

  return (
    <section>
      <div className="container">
        <h2 className="section-title">Здравствуйте, {student.fullName}!</h2>
        {message && <div className="alert alert-ok">{message}</div>}
        {error && <div className="alert alert-err">{error}</div>}

        <div className="grid-2">
          <div>
            <h3>Мой прогресс</h3>
            <div className="progress-bar" style={{ marginTop: 10 }}>
              <div style={{ width: `${student.progressPercent}%` }} />
            </div>
            <p style={{ marginTop: 6 }}>{student.progressPercent}% пройдено</p>
            {student.goals && <p className="muted" style={{ marginTop: 10 }}>Цель: {student.goals}</p>}
            {student.grades.length > 0 && (
              <p style={{ marginTop: 10 }}>Последние оценки: {student.grades.join(', ')}</p>
            )}
          </div>

          <div>
            <h3>Оставить отзыв</h3>
            <form onSubmit={submitReview} style={{ marginTop: 10 }}>
              <div className="form-group">
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Ваш отзыв..."
                  required
                  aria-label="Текст отзыва"
                />
              </div>
              <div className="form-group">
                <label htmlFor="rating">Оценка (1-5, необязательно)</label>
                <select id="rating" value={rating} onChange={(e) => setRating(e.target.value)}>
                  <option value="">- без оценки -</option>
                  {[1, 2, 3, 4, 5].map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn" disabled={submitting}>
                Отправить на модерацию
              </button>
            </form>
          </div>
        </div>

        <h3 style={{ margin: '30px 0 12px' }}>Мои задания</h3>
        {assignments.length === 0 ? (
          <p className="muted">Заданий пока нет.</p>
        ) : (
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Задача</th>
                  <th>Дедлайн</th>
                  <th>Статус</th>
                  <th>Оценка</th>
                  <th>Комментарий</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((assignment) => (
                  <tr key={assignment.id}>
                    <td>{assignment.taskTitle}</td>
                    <td>
                      {assignment.deadline ? new Date(assignment.deadline).toLocaleDateString('ru-RU') : '-'}
                    </td>
                    <td>{assignment.status}</td>
                    <td>{assignment.grade != null ? `${assignment.grade} / 10` : '-'}</td>
                    <td>{assignment.comment ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
