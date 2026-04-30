import { describe, it, expect, mock, spyOn, beforeEach } from 'bun:test';
import { handleMenuKeyboard } from '../src/utils/keyboard';

function createMockItem(label: string, disabled = false) {
  const el = {
    textContent: label,
    focus: mock(() => {}),
    dispatchEvent: mock(() => true),
  } as unknown as HTMLElement;
  return el;
}

function makeFakeEvent(key: string) {
  return {
    key,
    bubbles: true,
    cancelable: true,
    preventDefault: () => {},
    stopPropagation: () => {},
  } as unknown as KeyboardEvent;
}

describe('handleMenuKeyboard', () => {
  let item1: HTMLElement;
  let item2: HTMLElement;
  let menu: HTMLElement;

  beforeEach(() => {
    item1 = createMockItem('Item 1');
    item2 = createMockItem('Item 2');

    menu = {
      querySelectorAll: mock((selector: string) => {
        if (selector === '[role="menuitem"]:not([disabled])') {
          return [item1, item2] as unknown as NodeListOf<HTMLElement>;
        }
        return [] as unknown as NodeListOf<HTMLElement>;
      }),
    } as unknown as HTMLElement;
  });

  it('should move focus to next enabled item on ArrowDown', () => {
    handleMenuKeyboard(makeFakeEvent('ArrowDown'), menu, item1);
    expect(item2.focus).toHaveBeenCalled();
  });

  it('should move focus to previous enabled item on ArrowUp', () => {
    handleMenuKeyboard(makeFakeEvent('ArrowUp'), menu, item2);
    expect(item1.focus).toHaveBeenCalled();
  });

  it('should skip disabled items on ArrowDown', () => {
    const item3 = createMockItem('Item 3');
    (menu.querySelectorAll as any) = mock((selector: string) => {
      if (selector === '[role="menuitem"]:not([disabled])') {
        return [item1, item2, item3] as unknown as NodeListOf<HTMLElement>;
      }
      return [] as unknown as NodeListOf<HTMLElement>;
    });
    handleMenuKeyboard(makeFakeEvent('ArrowDown'), menu, item2);
    expect(item3.focus).toHaveBeenCalled();
  });

  it('should wrap to first enabled item from last on ArrowDown', () => {
    handleMenuKeyboard(makeFakeEvent('ArrowDown'), menu, item2);
    expect(item1.focus).toHaveBeenCalled();
  });

  it('should wrap to last enabled item from first on ArrowUp', () => {
    handleMenuKeyboard(makeFakeEvent('ArrowUp'), menu, item1);
    expect(item2.focus).toHaveBeenCalled();
  });

  it('should prevent default on ArrowDown', () => {
    const event = makeFakeEvent('ArrowDown');
    const pd = spyOn(event, 'preventDefault');
    handleMenuKeyboard(event, menu, item1);
    expect(pd).toHaveBeenCalled();
  });

  it('should dispatch menu-select on Enter when item is focused', () => {
    const event = makeFakeEvent('Enter');
    const result = handleMenuKeyboard(event, menu, item1);
    expect(result).toBe(true);
    expect(item1.dispatchEvent).toHaveBeenCalled();
  });

  it('should return false when no enabled items', () => {
    const emptyMenu = {
      querySelectorAll: mock(() => [] as unknown as NodeListOf<HTMLElement>),
    } as unknown as HTMLElement;
    const result = handleMenuKeyboard(makeFakeEvent('Enter'), emptyMenu);
    expect(result).toBe(false);
  });
});
