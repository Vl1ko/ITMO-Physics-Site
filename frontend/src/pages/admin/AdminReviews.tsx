import { useCallback, useEffect, useState } from 'react';
import { adminApi } from '../../api/endpoints';
import { ApiError } from '../../api/client';
import type { Review } from '../../types';

export function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    adminApi.reviews
      .list()
      .then(setReviews)
      .catch((e) => setError(e instanceof ApiError ? e.message : 'Ошибка загрузки'));
  }, []);

  useEffect(load, [load]);

  const setStatus = async (id: number, status: string) => {
    try {
      await adminApi.reviews.setStatus(id, status);
      load();
    } catch {
      setError('Не удалось изменить статус');
    }
  };

  const remove = async (id: number) => {
    if (!window.confirm('Удалить отзыв?')) return;
    try {
      await adminApi.reviews.remove(id);
      load();
    } catch {
      setError('Не удалось удалить отзыв');
    }
  };

  return (
    <>
      <h2 className="section-title">Модерация отзывов</h2>
      {error && <div className="alert alert-err">{error}</div>}

      {reviews.length === 0 ? (
        <p className="muted">Отзывов нет.</p>
      ) : (
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Автор</th>
                <th>Отзыв</th>
                <th>Рейтинг</th>
                <th>Дата</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review) => (
                <tr key={review.id}>
                  <td>{review.authorName}</td>
                  <td>{review.text}</td>
                  <td>{review.rating != null ? `${review.rating} / 5` : '-'}</td>
                  <td>{new Date(review.createdAt).toLocaleString('ru-RU')}</td>
                  <td>
                    <span className={`status-${review.statusCode}`}>{review.status}</span>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button
                      type="button"
                      className="btn btn-sm btn-ok"
                      onClick={() => setStatus(review.id, 'PUBLISHED')}
                    >
                      Опубликовать
                    </button>{' '}
                    <button
                      type="button"
                      className="btn btn-sm btn-outline"
                      onClick={() => setStatus(review.id, 'REJECTED')}
                    >
                      Отклонить
                    </button>{' '}
                    <button type="button" className="btn btn-sm btn-danger" onClick={() => remove(review.id)}>
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
