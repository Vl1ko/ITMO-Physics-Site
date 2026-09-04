import { useCallback, useEffect, useRef, useState } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
}

interface Command {
  command: string;
  label: string;
  title: string;
  value?: string;
}

const COMMANDS: Command[] = [
  { command: 'bold', label: 'Ж', title: 'Полужирный' },
  { command: 'italic', label: 'К', title: 'Курсив' },
  { command: 'underline', label: 'Ч', title: 'Подчёркнутый' },
  { command: 'formatBlock', label: 'H2', title: 'Заголовок второго уровня', value: '<h2>' },
  { command: 'formatBlock', label: 'H3', title: 'Заголовок третьего уровня', value: '<h3>' },
  { command: 'formatBlock', label: 'Абзац', title: 'Обычный абзац', value: '<p>' },
  { command: 'insertUnorderedList', label: '• Список', title: 'Маркированный список' },
  { command: 'insertOrderedList', label: '1. Список', title: 'Нумерованный список' },
  { command: 'removeFormat', label: 'Очистить', title: 'Снять форматирование с выделенного' },
];

/** Строчное оформление: разворачивается, содержимое остаётся на месте */
const INLINE_FORMATTING =
  'b, strong, i, em, u, s, strike, del, ins, span, font, mark, small, big, sub, sup, code, tt, abbr, q';

/** Блочное оформление: превращается в обычный абзац */
const BLOCK_FORMATTING = 'h1, h2, h3, h4, h5, h6, blockquote, pre, li';

/** Блоки, наличие которых внутри оболочки запрещает превращать её в абзац */
const NESTED_BLOCKS = 'p, div, h1, h2, h3, h4, h5, h6, ul, ol, blockquote, pre, table';

/** Контейнеры, внутри которых имеет смысл резать выделение */
const BLOCK_CONTAINERS = new Set(['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'BLOCKQUOTE', 'PRE', 'DIV', 'TD', 'TH']);

const STRIPPED_ATTRIBUTES = ['style', 'class', 'align', 'color', 'face', 'size', 'bgcolor', 'width', 'height'];

function unwrap(element: Element) {
  const parent = element.parentNode;
  if (!parent) return;
  while (element.firstChild) {
    parent.insertBefore(element.firstChild, element);
  }
  parent.removeChild(element);
}

function renameTo(element: Element, tagName: string) {
  const replacement = element.ownerDocument.createElement(tagName);
  while (element.firstChild) {
    replacement.appendChild(element.firstChild);
  }
  element.parentNode?.replaceChild(replacement, element);
}

/** Приводит извлечённый кусок к чистому тексту: без тегов оформления и атрибутов */
function stripFormatting(fragment: DocumentFragment) {
  fragment.querySelectorAll('ul, ol').forEach(unwrap);
  fragment.querySelectorAll(BLOCK_FORMATTING).forEach((element) => renameTo(element, 'p'));
  fragment.querySelectorAll(INLINE_FORMATTING).forEach(unwrap);
  fragment.querySelectorAll('*').forEach((element) => {
    for (const attribute of STRIPPED_ATTRIBUTES) {
      element.removeAttribute(attribute);
    }
  });
}

/**
 * После извлечения куска от его тегов остаются пустые оболочки - и строчные,
 * и блочные. Пустой абзац с <br> это осознанная пустая строка, его не трогаем.
 */
const EMPTY_HUSKS = `${INLINE_FORMATTING}, p, h1, h2, h3, h4, h5, h6, blockquote, pre, li, ul, ol`;

function removeEmptyHusks(root: Element | DocumentFragment) {
  root.querySelectorAll(EMPTY_HUSKS).forEach((element) => {
    if (!element.textContent && !element.querySelector('br, img')) {
      element.remove();
    }
  });
}

/** Выносит пункт списка наружу отдельным абзацем, разрезая список при необходимости */
function liftListItem(item: Element): HTMLElement {
  const list = item.parentElement;
  const paragraph = item.ownerDocument.createElement('p');
  while (item.firstChild) {
    paragraph.appendChild(item.firstChild);
  }

  if (!list?.parentNode) {
    item.parentNode?.replaceChild(paragraph, item);
    return paragraph;
  }

  const siblings = Array.from(list.children);
  const rest = siblings.slice(siblings.indexOf(item) + 1);
  list.parentNode.insertBefore(paragraph, list.nextSibling);

  if (rest.length > 0) {
    const tailList = item.ownerDocument.createElement(list.tagName);
    rest.forEach((sibling) => tailList.appendChild(sibling));
    list.parentNode.insertBefore(tailList, paragraph.nextSibling);
  }

  item.remove();
  if (list.children.length === 0) {
    list.remove();
  }
  return paragraph;
}

/**
 * Разбирает блочную оболочку вокруг выделения: заголовок и цитата становятся
 * абзацем, пункт списка выносится наружу. Через formatBlock это делать нельзя -
 * поведение браузеров расходится, а список он не трогает вовсе.
 */
function clearBlockFormatting(container: HTMLElement, editor: HTMLElement) {
  let node: HTMLElement | null = container;

  while (node && node !== editor) {
    let parent: HTMLElement | null = node.parentElement;

    if (node.tagName === 'LI') {
      const paragraph = liftListItem(node);
      paragraph.querySelectorAll(BLOCK_FORMATTING).forEach(unwrap);
      // Список мог исчезнуть целиком - продолжаем разбор от нового абзаца
      parent = paragraph.parentElement;
    } else if (/^(H[1-6]|BLOCKQUOTE|PRE)$/.test(node.tagName)) {
      // Если внутри уже лежит блок, оболочку снимаем, иначе получился бы вложенный абзац
      if (node.querySelector(NESTED_BLOCKS)) {
        unwrap(node);
      } else {
        renameTo(node, 'p');
      }
    }

    node = parent;
  }
}

function closestContainer(node: Node, editor: HTMLElement): HTMLElement {
  let current: Node | null = node;
  while (current && current !== editor) {
    if (current.nodeType === Node.ELEMENT_NODE && BLOCK_CONTAINERS.has((current as Element).tagName)) {
      return current as HTMLElement;
    }
    current = current.parentNode;
  }
  return editor;
}

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value;
    }
  }, [value]);

  const selectionInsideEditor = () => {
    const editor = ref.current;
    const selection = document.getSelection();
    return Boolean(editor && selection?.anchorNode && editor.contains(selection.anchorNode));
  };

  /** Пересчитывает подсветку кнопок по текущему положению каретки */
  const syncActive = useCallback(() => {
    if (!selectionInsideEditor()) {
      setActive({});
      return;
    }

    const block = String(document.queryCommandValue('formatBlock')).toLowerCase();
    const next: Record<string, boolean> = {};

    for (const item of COMMANDS) {
      if (item.command === 'formatBlock') {
        next[item.label] = block === item.value?.replace(/[<>]/g, '');
      } else if (item.command === 'removeFormat') {
        next[item.label] = false;
      } else {
        try {
          next[item.label] = document.queryCommandState(item.command);
        } catch {
          next[item.label] = false;
        }
      }
    }

    setActive(next);
  }, []);

  useEffect(() => {
    document.addEventListener('selectionchange', syncActive);
    return () => document.removeEventListener('selectionchange', syncActive);
  }, [syncActive]);

  /**
   * Снимает всё оформление с выделенного куска.
   *
   * Через execCommand это ненадёжно: отжатый «Ж» внутри существующего <b> браузер
   * оформляет как вложенный <span style="font-weight: normal">, и removeFormat,
   * убирая этот span, возвращает жирность от внешнего тега. Поэтому теги удаляются
   * напрямую: хвост контейнера и само выделение извлекаются, выделение чистится и
   * возвращается обратно — так разрывается и оформление, охватывающее выделение снаружи.
   */
  const clearFormatting = () => {
    const editor = ref.current;
    const selection = document.getSelection();
    if (!editor || !selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    if (range.collapsed || !editor.contains(range.commonAncestorContainer)) return;

    const container = closestContainer(range.commonAncestorContainer, editor);

    // Хвост снимаем первым: границы выделения при этом не сдвигаются
    const tailRange = document.createRange();
    tailRange.setStart(range.endContainer, range.endOffset);
    tailRange.setEnd(container, container.childNodes.length);
    const tail = tailRange.extractContents();

    const selected = range.extractContents();
    stripFormatting(selected);

    // Теперь в контейнере осталась только голова - до выделения
    removeEmptyHusks(container);
    removeEmptyHusks(tail);

    const inserted = Array.from(selected.childNodes);
    container.appendChild(selected);
    container.appendChild(tail);

    // Оболочка вокруг выделения лежала снаружи извлечённого куска - её разбираем отдельно.
    // Узлы при этом переезжают, но не пересоздаются, поэтому выделение восстанавливаем после.
    clearBlockFormatting(container, editor);

    if (inserted.length > 0) {
      const restored = document.createRange();
      restored.setStartBefore(inserted[0]);
      restored.setEndAfter(inserted[inserted.length - 1]);
      selection.removeAllRanges();
      selection.addRange(restored);
    }
  };

  const exec = (command: string, commandValue?: string) => {
    if (!selectionInsideEditor()) {
      ref.current?.focus();
    }

    if (command === 'removeFormat') {
      clearFormatting();
    } else {
      document.execCommand(command, false, commandValue);
    }

    onChange(ref.current?.innerHTML ?? '');
    syncActive();
  };

  return (
    <div>
      <div className="editor-toolbar" role="toolbar" aria-label="Форматирование">
        {COMMANDS.map(({ command, label, title, value: commandValue }) => (
          <button
            key={label}
            type="button"
            title={title}
            aria-pressed={active[label] ?? false}
            className={active[label] ? 'is-active' : undefined}
            /* Клик по кнопке не должен уводить фокус: иначе выделение схлопывается
               и команда применяется в пустоту */
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => exec(command, commandValue)}
          >
            {label}
          </button>
        ))}
      </div>
      <div
        ref={ref}
        className="editor-area"
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-label="Содержимое страницы"
        onInput={(event) => onChange(event.currentTarget.innerHTML)}
        onKeyUp={syncActive}
        onMouseUp={syncActive}
        onFocus={syncActive}
        onBlur={() => setActive({})}
      />
    </div>
  );
}
