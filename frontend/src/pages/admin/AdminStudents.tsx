import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/endpoints';
import { ApiError } from '../../api/client';
import type { Student } from '../../types';

export function AdminStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = useCallback(() => {
    adminApi.students
      .list()
      .then(setStudents)
      .catch((e) => setError(e instanceof ApiError ? e.message : 'Ошибка загрузки'));
  }, []);

  useEffect(load, [load]);

  const remove = async (id: number) => {
    if (!window.confirm('Удалить ученика?')) return;
    try {
      await adminApi.students.remove(id);
      setMessage('Ученик удалён');
      load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Не удалось удалить');
    }
  };

  const exportExcel = async () => {
    try {
      await adminApi.students.exportExcel();
    } catch {
      setError('Не удалось выгрузить Excel');
    }
  };

  return (
    <>
      {message && <div className="alert alert-ok">{message}</div>}
      {error && <div className="alert alert-err">{error}</div>}

      <div className="toolbar">
        <Link to="/admin/students/new" className="btn">
          + Добавить ученика
        </Link>
        <button type="button" className="btn btn-ok" onClick={exportExcel}>
          Экспорт в Excel
        </button>
      </div>

      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>ФИО ученика</th>
              <th>Класс / курс</th>
              <th>Предмет</th>
              <th>Цели и задачи</th>
              <th>Оценки за ДЗ</th>
              <th>Прогресс</th>
              <th>Заметки</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id}>
                <td>{student.fullName}</td>
                <td>{student.grade ?? '-'}</td>
                <td>{student.subject ?? '-'}</td>
                <td>{student.goals ?? '-'}</td>
                <td>{student.grades.length > 0 ? student.grades.join(', ') : '-'}</td>
                <td>
                  <div className="progress-bar">
                    <div style={{ width: `${student.progressPercent}%` }} />
                  </div>
                  <small>{student.progressPercent}%</small>
                </td>
                <td>{student.notes ?? '-'}</td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  <Link to={`/admin/students/${student.id}/edit`} className="btn btn-sm btn-outline">
                    Изменить
                  </Link>{' '}
                  <Link to={`/admin/students/${student.id}/assignments`} className="btn btn-sm">
                    ДЗ
                  </Link>{' '}
                  <button type="button" className="btn btn-sm btn-danger" onClick={() => remove(student.id)}>
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {students.length === 0 && <p className="muted">Учеников пока нет.</p>}
    </>
  );
}
