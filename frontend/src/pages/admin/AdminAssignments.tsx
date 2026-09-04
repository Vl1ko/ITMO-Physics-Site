import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminApi, catalogApi } from '../../api/endpoints';
import { ApiError } from '../../api/client';
import type { Assignment, Option, Student, TaskCard } from '../../types';
import type { ChangeEvent, FormEvent } from 'react';

interface FormState {
  taskId: string;
  deadline: string;
  status: string;
  grade: string;
  comment: string;
}

const EMPTY: FormState = { taskId: '', deadline: '', status: 'ASSIGNED', grade: '', comment: '' };

export function AdminAssignments() {
  const { id } = useParams();
  const navigate = useNavigate();
  const studentId = Number(id);

  const [student, setStudent] = useState<Student | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [tasks, setTasks] = useState<TaskCard[]>([]);
  const [statuses, setStatuses] = useState<Option[]>([]);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadAssignments = useCallback(() => {
    adminApi.students
      .assignments(studentId)
      .then(setAssignments)
      .catch(() => setError('Не удалось загрузить задания'));
  }, [studentId]);

  useEffect(() => {
    adminApi.students.one(studentId).then(setStudent).catch(() => setError('Ученик не найден'));
    adminApi.tasks.list().then(setTasks).catch(() => setTasks([]));
    catalogApi.dictionaries().then((d) => setStatuses(d.statuses)).catch(() => setStatuses([]));
    loadAssignments();
  }, [studentId, loadAssignments]);

  const update =
    (field: keyof FormState) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      await adminApi.students.createAssignment(studentId, {
        studentId,
        taskId: Number(form.taskId),
        deadline: form.deadline || undefined,
        status: form.status || undefined,
        grade: form.grade ? Number(form.grade) : undefined,
        comment: form.comment || undefined,
      });
      setForm(EMPTY);
      setMessage('Задание сохранено');
      loadAssignments();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Не удалось сохранить задание');
    }
  };

  const remove = async (assignmentId: number) => {
    try {
      await adminApi.students.removeAssignment(studentId, assignmentId);
      loadAssignments();
    } catch {
      setError('Не удалось удалить задание');
    }
  };

  return (
    <>
      <h2 className="section-title">Задания: {student?.fullName ?? '...'}</h2>
      {message && <div className="alert alert-ok">{message}</div>}
      {error && <div className="alert alert-err">{error}</div>}

      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Задача</th>
              <th>Дедлайн</th>
              <th>Статус</th>
              <th>Оценка (1-10)</th>
              <th>Комментарий</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {assignments.map((assignment) => (
              <tr key={assignment.id}>
                <td>{assignment.taskTitle}</td>
                <td>{assignment.deadline ? new Date(assignment.deadline).toLocaleDateString('ru-RU') : '-'}</td>
                <td>{assignment.status}</td>
                <td>{assignment.grade ?? '-'}</td>
                <td>{assignment.comment ?? '-'}</td>
                <td>
                  <button type="button" className="btn btn-sm btn-danger" onClick={() => remove(assignment.id)}>
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {assignments.length === 0 && <p className="muted">Заданий пока нет.</p>}

      <div className="form-card wide" style={{ marginTop: 26 }}>
        <h3 style={{ marginBottom: 14 }}>Назначить задание / выставить оценку</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="taskId">Задача</label>
            <select id="taskId" value={form.taskId} onChange={update('taskId')} required>
              <option value="">- выберите задачу -</option>
              {tasks.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.title}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="deadline">Дедлайн</label>
            <input id="deadline" type="date" value={form.deadline} onChange={update('deadline')} />
          </div>
          <div className="form-group">
            <label htmlFor="status">Статус</label>
            <select id="status" value={form.status} onChange={update('status')}>
              {statuses.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.title}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="grade">Оценка (1-10)</label>
            <input id="grade" type="number" min={1} max={10} value={form.grade} onChange={update('grade')} />
          </div>
          <div className="form-group">
            <label htmlFor="comment">Комментарий</label>
            <textarea id="comment" value={form.comment} onChange={update('comment')} />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn">
              Сохранить
            </button>
            <button type="button" className="btn btn-outline" onClick={() => navigate('/admin/students')}>
              К списку учеников
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
