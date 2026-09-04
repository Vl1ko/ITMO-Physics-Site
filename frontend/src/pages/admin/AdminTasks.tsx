import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/endpoints';
import { ApiError } from '../../api/client';
import type { TaskCard } from '../../types';

export function AdminTasks() {
  const [tasks, setTasks] = useState<TaskCard[]>([]);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    adminApi.tasks
      .list()
      .then(setTasks)
      .catch((e) => setError(e instanceof ApiError ? e.message : 'Ошибка загрузки'));
  }, []);

  useEffect(load, [load]);

  const remove = async (id: number) => {
    if (!window.confirm('Удалить задачу?')) return;
    try {
      await adminApi.tasks.remove(id);
      load();
    } catch {
      setError('Не удалось удалить задачу');
    }
  };

  return (
    <>
      {error && <div className="alert alert-err">{error}</div>}

      <div className="toolbar">
        <Link to="/admin/tasks/new" className="btn">
          + Добавить задачу
        </Link>
      </div>

      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Название</th>
              <th>Предмет</th>
              <th>Класс</th>
              <th>Сложность</th>
              <th>Темы</th>
              <th>Дата</th>
              <th>Опубл.</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id}>
                <td>{task.title}</td>
                <td>{task.subject}</td>
                <td>{task.grade}</td>
                <td>{task.difficulty}</td>
                <td>{task.topics.join(', ')}</td>
                <td>{new Date(task.publishedAt).toLocaleDateString('ru-RU')}</td>
                <td>{task.published ? 'Да' : 'Нет'}</td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  <Link to={`/admin/tasks/${task.id}/edit`} className="btn btn-sm btn-outline">
                    Изменить
                  </Link>{' '}
                  <button type="button" className="btn btn-sm btn-danger" onClick={() => remove(task.id)}>
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {tasks.length === 0 && <p className="muted">Задач пока нет.</p>}
    </>
  );
}
