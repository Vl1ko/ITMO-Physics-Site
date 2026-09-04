import { useCallback, useEffect, useState } from 'react';
import { catalogApi } from '../api/endpoints';
import { TaskCardView } from '../components/TaskCardView';
import type { Dictionaries, TaskCard, TaskFilterValues } from '../types';
import type { ChangeEvent } from 'react';

const EMPTY_FILTER: TaskFilterValues = { subject: '', grade: '', difficulty: '', topic: '' };
const PAGE_SIZE = 10;

export function Catalog() {
  const [dictionaries, setDictionaries] = useState<Dictionaries | null>(null);
  const [filter, setFilter] = useState<TaskFilterValues>(EMPTY_FILTER);
  const [tasks, setTasks] = useState<TaskCard[]>([]);
  const [page, setPage] = useState(0);
  const [last, setLast] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    catalogApi.dictionaries().then(setDictionaries).catch(() => setError('Не удалось загрузить фильтры'));
  }, []);

  const load = useCallback(
    async (currentFilter: TaskFilterValues, currentPage: number, append: boolean) => {
      setLoading(true);
      setError('');
      try {
        const result = await catalogApi.list(currentFilter, currentPage, PAGE_SIZE);
        setTasks((prev) => (append ? [...prev, ...result.content] : result.content));
        setLast(result.last);
      } catch {
        setError('Не удалось загрузить задачи');
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    setPage(0);
    void load(filter, 0, false);
  }, [filter, load]);

  const handleChange = (field: keyof TaskFilterValues) => (event: ChangeEvent<HTMLSelectElement>) => {
    setFilter((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    void load(filter, next, true);
  };

  return (
    <section>
      <div className="container">
        <h2 className="section-title">Каталог задач</h2>

        <div className="filters">
          <select value={filter.subject} onChange={handleChange('subject')} aria-label="Предмет">
            <option value="">Все предметы</option>
            {dictionaries?.subjects.map((option) => (
              <option key={option.code} value={option.code}>
                {option.title}
              </option>
            ))}
          </select>

          <select value={filter.grade} onChange={handleChange('grade')} aria-label="Класс">
            <option value="">Все классы</option>
            {dictionaries?.grades.map((grade) => (
              <option key={grade} value={grade}>
                {grade} класс
              </option>
            ))}
          </select>

          <select value={filter.difficulty} onChange={handleChange('difficulty')} aria-label="Сложность">
            <option value="">Любая сложность</option>
            {dictionaries?.difficulties.map((option) => (
              <option key={option.code} value={option.code}>
                {option.title}
              </option>
            ))}
          </select>

          <select value={filter.topic} onChange={handleChange('topic')} aria-label="Тема">
            <option value="">Все темы</option>
            {dictionaries?.topics.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>
        </div>

        {error && <div className="alert alert-err">{error}</div>}

        <div className="task-feed">
          {tasks.map((task) => (
            <TaskCardView key={task.id} task={task} />
          ))}
        </div>

        {!loading && tasks.length === 0 && !error && (
          <p className="muted">По выбранным фильтрам задач не найдено.</p>
        )}
        {loading && <p className="muted">Загрузка...</p>}

        {!last && (
          <p className="center" style={{ marginTop: 20 }}>
            <button type="button" className="btn btn-outline" onClick={loadMore} disabled={loading}>
              Показать ещё
            </button>
          </p>
        )}
      </div>
    </section>
  );
}
