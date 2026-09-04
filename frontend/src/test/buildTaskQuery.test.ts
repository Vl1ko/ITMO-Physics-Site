import { describe, expect, it } from 'vitest';
import { buildTaskQuery } from '../api/endpoints';

describe('buildTaskQuery', () => {
  it('добавляет только заполненные фильтры', () => {
    const query = buildTaskQuery({ subject: 'PHYSICS', grade: '', difficulty: 'HARD', topic: '' });
    const params = new URLSearchParams(query);

    expect(params.get('subject')).toBe('PHYSICS');
    expect(params.get('difficulty')).toBe('HARD');
    expect(params.has('grade')).toBe(false);
    expect(params.has('topic')).toBe(false);
  });

  it('всегда передаёт пагинацию', () => {
    const params = new URLSearchParams(buildTaskQuery({}, 2, 25));
    expect(params.get('page')).toBe('2');
    expect(params.get('size')).toBe('25');
  });

  it('кодирует темы с пробелами и кириллицей', () => {
    const params = new URLSearchParams(buildTaskQuery({ topic: 'Законы Ньютона' }));
    expect(params.get('topic')).toBe('Законы Ньютона');
  });
});
