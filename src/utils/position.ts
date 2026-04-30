import type { Position } from '../types';

export interface SubmenuContext {
  direction: 'right' | 'left';
  parentRect: { top: number; left: number; width: number; height: number };
}

export function calculateMenuPosition(
  menu: HTMLElement,
  mouseX: number,
  mouseY: number,
  vpWidth: number,
  vpHeight: number,
  submenuCtx?: SubmenuContext,
): Position {
  const rect = menu.getBoundingClientRect();
  const menuWidth = rect.width || 200;
  const menuHeight = rect.height || 0;

  let left: number;
  let top: number;

  if (submenuCtx) {
    if (submenuCtx.direction === 'right') {
      left = submenuCtx.parentRect.left + submenuCtx.parentRect.width;
      if (left + menuWidth > vpWidth) {
        left = submenuCtx.parentRect.left - menuWidth;
      }
    } else {
      left = submenuCtx.parentRect.left - menuWidth;
    }
    top = submenuCtx.parentRect.top;
    if (top + menuHeight > vpHeight) {
      top = Math.max(0, vpHeight - menuHeight);
    }
  } else {
    left = mouseX;
    if (left + menuWidth > vpWidth) {
      left = mouseX - menuWidth;
    }
    top = mouseY;
    if (top + menuHeight > vpHeight) {
      top = mouseY - menuHeight;
    }
  }

  if (left < 0) left = 0;
  if (top < 0) top = 0;

  return { top, left };
}
