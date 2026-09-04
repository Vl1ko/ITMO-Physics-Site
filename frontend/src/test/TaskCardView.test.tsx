import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TaskCardView } from '../components/TaskCardView';
import type { TaskCard } from '../types';

const task: TaskCard = {
  id: 1,
  title: 'Идеальный газ в цикле',
  statementLatex: 'Найдите КПД цикла, если $Q_1 = 500$ Дж.',
  solutionLatex: '$\\eta = 0{,}4$',
  subject: 'Физика',
  subjectCode: 'PHYSICS',
  grade: 10,
  difficulty: 'Сложная',
  difficultyCode: 'HARD',
  published: true,
  topics: ['Термодинамика'],
  videoEmbedUrl: 'https://www.youtube.com/embed/test',
  publishedAt: '2026-05-01',
};

describe('TaskCardView', () => {
  it('показывает название и мета-теги', () => {
    render(<TaskCardView task={task} />);

    expect(screen.getByRole('heading', { name: 'Идеальный газ в цикле' })).toBeInTheDocument();
    expect(screen.getByText('Физика')).toBeInTheDocument();
    expect(screen.getByText('10 класс')).toBeInTheDocument();
    expect(screen.getByText('Сложная')).toBeInTheDocument();
    expect(screen.getByText('Термодинамика')).toBeInTheDocument();
  });

  it('встраивает видео-разбор и прячет решение под спойлер', () => {
    render(<TaskCardView task={task} />);

    expect(screen.getByTitle('Видео-разбор: Идеальный газ в цикле')).toBeInTheDocument();
    expect(screen.getByText('Показать решение')).toBeInTheDocument();
  });

  it('не рисует видео-блок, если ссылки нет', () => {
    render(<TaskCardView task={{ ...task, videoEmbedUrl: undefined }} />);
    expect(screen.queryByTitle(/Видео-разбор/)).not.toBeInTheDocument();
  });

  it('показывает рикролл как закрытый мемный бонус и сохраняет учебное решение', () => {
    render(<TaskCardView task={{ ...task, videoEmbedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' }} />);

    const summary = screen.getByText(/Мемный бонус: КПД/);
    expect(summary.closest('details')).not.toHaveAttribute('open');
    expect(screen.getByText('Показать решение')).toBeInTheDocument();
    expect(screen.getByTitle('Мемный бонус: Идеальный газ в цикле')).toHaveAttribute(
      'src', 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    );
    expect(screen.queryByTitle('Видео-разбор: Идеальный газ в цикле')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /открыть на YouTube/ })).toHaveAttribute(
      'href', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    );
  });
});
