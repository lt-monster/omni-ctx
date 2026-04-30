export function handleMenuKeyboard(
  event: KeyboardEvent,
  menu: HTMLElement,
  activeEl?: HTMLElement | null,
): boolean {
  const items = getEnabledItems(menu);
  if (items.length === 0) return false;

  const currentIndex = items.indexOf(activeEl ?? (typeof document !== 'undefined' ? document.activeElement as HTMLElement : null));

  switch (event.key) {
    case 'ArrowDown': {
      event.preventDefault();
      const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
      items[nextIndex].focus();
      return true;
    }
    case 'ArrowUp': {
      event.preventDefault();
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
      items[prevIndex].focus();
      return true;
    }
    case 'Enter':
    case ' ': {
      event.preventDefault();
      if (currentIndex >= 0) {
        const item = items[currentIndex];
        item.dispatchEvent(
          new CustomEvent('menu-select', {
            bubbles: true,
            composed: true,
            detail: { label: item.textContent || '', item },
          }),
        );
        return true;
      }
      return false;
    }
    default:
      return false;
  }
}

function getEnabledItems(menu: HTMLElement): HTMLElement[] {
  return Array.from(
    menu.querySelectorAll<HTMLElement>('[role="menuitem"]:not([disabled])'),
  );
}
