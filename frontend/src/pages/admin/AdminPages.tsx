import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/endpoints';
import type { SitePage } from '../../types';

export function AdminPages() {
  const [pages, setPages] = useState<SitePage[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi.pages.list().then(setPages).catch(() => setError('Не удалось загрузить страницы'));
  }, []);

  return (
    <>
      <h2 className="section-title">Управление страницами</h2>
      {error && <div className="alert alert-err">{error}</div>}

      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Страница</th>
              <th>Обновлена</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {pages.map((page) => (
              <tr key={page.id}>
                <td>{page.title}</td>
                <td>{new Date(page.updatedAt).toLocaleString('ru-RU')}</td>
                <td>
                  <Link to={`/admin/pages/${page.slug}/edit`} className="btn btn-sm btn-outline">
                    Редактировать
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
