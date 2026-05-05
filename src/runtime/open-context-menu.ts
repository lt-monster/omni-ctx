import { ContextMenu } from '../components/context-menu';
import type { ContextMenuHandle, ContextMenuElement, OpenContextMenuOptions } from '../types';

const runtimeMenuCache = new Map<string, ContextMenu>();

function createRuntimeContextMenu(): ContextMenu {
  const menu = document.createElement('context-menu') as ContextMenu;
  document.body.appendChild(menu);
  return menu;
}

function getOrCreateRuntimeContextMenu(cacheKey?: string): ContextMenu {
  if (!cacheKey) return createRuntimeContextMenu();

  const cached = runtimeMenuCache.get(cacheKey);
  if (cached) {
    if (!cached.isConnected) document.body.appendChild(cached);
    return cached;
  }

  const menu = createRuntimeContextMenu();
  runtimeMenuCache.set(cacheKey, menu);
  return menu;
}

function destroyRuntimeContextMenu(menu: ContextMenu, cacheKey?: string): void {
  if (cacheKey) runtimeMenuCache.delete(cacheKey);
  menu.remove();
}

function attachRuntimeLifecycle(menu: ContextMenu, cacheKey?: string): void {
  if ((menu as any).__runtimeLifecycleAttached) return;

  const originalHide = menu.hide.bind(menu);
  menu.hide = () => {
    originalHide();
    if (!cacheKey) {
      menu.remove();
    }
  };

  (menu as any).__runtimeLifecycleAttached = true;
}

export function openContextMenu(options: OpenContextMenuOptions): ContextMenuHandle {
  const { cacheKey, items, param, x, y } = options;
  const menu = getOrCreateRuntimeContextMenu(cacheKey);

  attachRuntimeLifecycle(menu, cacheKey);
  menu.open({ x, y }, { items, param, replace: true });

  return {
    element: menu as ContextMenuElement,
    close: () => {
      menu.close();
    },
    destroy: () => {
      destroyRuntimeContextMenu(menu, cacheKey);
    },
  };
}
