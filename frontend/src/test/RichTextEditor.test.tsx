import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { RichTextEditor } from '../components/RichTextEditor';

const execCommand = vi.fn();
const queryCommandState = vi.fn();
const queryCommandValue = vi.fn();

beforeEach(() => {
  execCommand.mockReset().mockReturnValue(true);
  queryCommandState.mockReset().mockReturnValue(false);
  queryCommandValue.mockReset().mockReturnValue('');

  // jsdom не реализует эти методы - подменяем, чтобы проверить сами вызовы
  document.execCommand = execCommand;
  document.queryCommandState = queryCommandState;
  document.queryCommandValue = queryCommandValue;
});

/** Ставит выделение на первый попавшийся фрагмент текста внутри редактора */
function selectText(editor: HTMLElement, text: string) {
  const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();

  while (node) {
    const offset = node.textContent?.indexOf(text) ?? -1;
    if (offset >= 0) {
      const range = document.createRange();
      range.setStart(node, offset);
      range.setEnd(node, offset + text.length);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
      fireEvent(document, new Event('selectionchange'));
      return;
    }
    node = walker.nextNode();
  }

  throw new Error(`Текст не найден в редакторе: ${text}`);
}

const clearButton = () => screen.getByTitle('Снять форматирование с выделенного');

describe('RichTextEditor: «Очистить»', () => {
  it('снимает жирность с выделенного, не трогая соседний текст', () => {
    render(<RichTextEditor value="<p>обычный <b>жирный хвост</b></p>" onChange={() => {}} />);
    const editor = screen.getByRole('textbox');

    selectText(editor, 'жирный');
    fireEvent.click(clearButton());

    expect(editor.innerHTML).toBe('<p>обычный жирный<b> хвост</b></p>');
  });

  it('не возвращает жирность, снятую вложенным span (сценарий из отчёта)', () => {
    // Так браузер оформляет отжатый «Ж» внутри существующего <b>
    render(
      <RichTextEditor
        value='<p><b>жирный <span style="font-weight: normal">обычный</span></b></p>'
        onChange={() => {}}
      />,
    );
    const editor = screen.getByRole('textbox');

    selectText(editor, 'обычный');
    fireEvent.click(clearButton());

    expect(editor.innerHTML).toBe('<p><b>жирный </b>обычный</p>');
    expect(editor.querySelector('span')).toBeNull();
  });

  it('снимает несколько слоёв оформления сразу', () => {
    render(<RichTextEditor value="<p><b><i><u>текст</u></i></b></p>" onChange={() => {}} />);
    const editor = screen.getByRole('textbox');

    selectText(editor, 'текст');
    fireEvent.click(clearButton());

    expect(editor.innerHTML).toBe('<p>текст</p>');
  });

  it('вычищает инлайновые стили и классы', () => {
    render(
      <RichTextEditor value='<p><span class="hl" style="color: red">цветной</span></p>' onChange={() => {}} />,
    );
    const editor = screen.getByRole('textbox');

    selectText(editor, 'цветной');
    fireEvent.click(clearButton());

    expect(editor.innerHTML).toBe('<p>цветной</p>');
  });

  it('разворачивает список и заголовок в обычный абзац', () => {
    render(<RichTextEditor value="<ul><li><h3>пункт</h3></li></ul>" onChange={() => {}} />);
    const editor = screen.getByRole('textbox');

    selectText(editor, 'пункт');
    fireEvent.click(clearButton());

    expect(editor.querySelector('h3')).toBeNull();
    expect(editor.textContent).toBe('пункт');
  });

  it('выносит пункт из середины списка, разрезая список надвое', () => {
    render(
      <RichTextEditor value="<ul><li>раз</li><li><b>два</b></li><li>три</li></ul>" onChange={() => {}} />,
    );
    const editor = screen.getByRole('textbox');

    selectText(editor, 'два');
    fireEvent.click(clearButton());

    expect(editor.innerHTML).toBe('<ul><li>раз</li></ul><p>два</p><ul><li>три</li></ul>');
  });

  it('убирает список целиком, когда в нём был единственный пункт', () => {
    render(<RichTextEditor value="<ol><li>единственный</li></ol>" onChange={() => {}} />);
    const editor = screen.getByRole('textbox');

    selectText(editor, 'единственный');
    fireEvent.click(clearButton());

    expect(editor.innerHTML).toBe('<p>единственный</p>');
  });

  it('чистит выделение, охватывающее несколько блоков', () => {
    render(<RichTextEditor value="<h2>первый</h2><p><i>второй</i></p>" onChange={() => {}} />);
    const editor = screen.getByRole('textbox');

    const range = document.createRange();
    range.setStart(editor.querySelector('h2')!.firstChild!, 0);
    range.setEnd(editor.querySelector('i')!.firstChild!, 6);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);

    fireEvent.click(clearButton());

    expect(editor.querySelector('h2')).toBeNull();
    expect(editor.querySelector('i')).toBeNull();
    expect(editor.textContent).toBe('первыйвторой');
  });

  it('разбирает вложенную оболочку заголовок → список → жирный', () => {
    render(<RichTextEditor value="<h2><ul><li><b>текст</b></li></ul></h2>" onChange={() => {}} />);
    const editor = screen.getByRole('textbox');

    selectText(editor, 'текст');
    fireEvent.click(clearButton());

    expect(editor.innerHTML).toBe('<p>текст</p>');
  });

  it('ничего не делает при пустом выделении', () => {
    render(<RichTextEditor value="<p><b>жирный</b></p>" onChange={() => {}} />);
    const editor = screen.getByRole('textbox');

    fireEvent.click(clearButton());

    expect(editor.innerHTML).toBe('<p><b>жирный</b></p>');
  });

  it('оставляет выделение на очищенном куске', () => {
    render(<RichTextEditor value="<p>слева <b>цель</b> справа</p>" onChange={() => {}} />);
    const editor = screen.getByRole('textbox');

    selectText(editor, 'цель');
    fireEvent.click(clearButton());

    expect(window.getSelection()?.toString()).toBe('цель');
  });

  it('сообщает наверх обновлённый html', () => {
    const onChange = vi.fn();
    render(<RichTextEditor value="<p><b>жирный</b></p>" onChange={onChange} />);

    selectText(screen.getByRole('textbox'), 'жирный');
    fireEvent.click(clearButton());

    expect(onChange).toHaveBeenCalledWith('<p>жирный</p>');
  });
});

describe('RichTextEditor: панель', () => {
  it('подсвечивает кнопку активного строчного формата', () => {
    render(<RichTextEditor value="<p>Текст</p>" onChange={() => {}} />);
    const bold = screen.getByTitle('Полужирный');
    expect(bold).toHaveAttribute('aria-pressed', 'false');

    queryCommandState.mockImplementation((command: string) => command === 'bold');
    selectText(screen.getByRole('textbox'), 'Текст');

    expect(bold).toHaveAttribute('aria-pressed', 'true');
    expect(bold).toHaveClass('is-active');
  });

  it('подсвечивает кнопку активного блочного формата', () => {
    render(<RichTextEditor value="<h2>Заголовок</h2>" onChange={() => {}} />);

    queryCommandValue.mockReturnValue('h2');
    selectText(screen.getByRole('textbox'), 'Заголовок');

    expect(screen.getByTitle('Заголовок второго уровня')).toHaveClass('is-active');
    expect(screen.getByTitle('Заголовок третьего уровня')).not.toHaveClass('is-active');
    expect(screen.getByTitle('Обычный абзац')).not.toHaveClass('is-active');
  });

  it('снимает подсветку, когда выделение вне редактора', () => {
    render(<RichTextEditor value="<p>Текст</p>" onChange={() => {}} />);
    queryCommandState.mockReturnValue(true);
    selectText(screen.getByRole('textbox'), 'Текст');
    expect(screen.getByTitle('Полужирный')).toHaveClass('is-active');

    window.getSelection()?.removeAllRanges();
    fireEvent(document, new Event('selectionchange'));

    expect(screen.getByTitle('Полужирный')).not.toHaveClass('is-active');
  });

  it('клик по кнопке не уводит фокус из редактора', () => {
    render(<RichTextEditor value="<p>Текст</p>" onChange={() => {}} />);

    // Если mousedown не отменён, выделение схлопывается и команда применяется в пустоту
    const prevented = !fireEvent.mouseDown(screen.getByTitle('Полужирный'));

    expect(prevented).toBe(true);
  });

  it('передаёт значение блочной команды в execCommand', () => {
    render(<RichTextEditor value="<p>Текст</p>" onChange={() => {}} />);

    fireEvent.click(screen.getByTitle('Заголовок второго уровня'));

    expect(execCommand).toHaveBeenCalledWith('formatBlock', false, '<h2>');
  });
});
