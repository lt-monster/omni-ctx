import { describe, it, expect, mock } from 'bun:test';
import { calculateMenuPosition } from '../src/utils/position';

function mockElementSize(width: number, height: number) {
  return {
    getBoundingClientRect: mock(() => ({
      x: 0, y: 0,
      width, height,
      top: 0, right: width, bottom: height, left: 0,
    })),
  } as unknown as HTMLElement;
}

describe('calculateMenuPosition', () => {
  it('should position menu at mouse coordinates when it fits', () => {
    const menu = mockElementSize(200, 150);
    const result = calculateMenuPosition(menu, 100, 200, 1920, 1080);
    expect(result).toEqual({ top: 200, left: 100 });
  });

  it('should flip menu left when right edge overflows', () => {
    const menu = mockElementSize(200, 150);
    const result = calculateMenuPosition(menu, 1800, 200, 1920, 1080);
    expect(result.left).toBe(1600);
  });

  it('should align the right edge with mouse x when a wide menu flips left', () => {
    const menu = mockElementSize(320, 150);
    const result = calculateMenuPosition(menu, 900, 100, 1000, 800);
    expect(result.left).toBe(580);
  });

  it('should flip menu up when bottom edge overflows', () => {
    const menu = mockElementSize(200, 300);
    const result = calculateMenuPosition(menu, 100, 900, 1920, 1080);
    expect(result.top).toBe(600);
  });

  it('should flip both left and up when both edges overflow', () => {
    const menu = mockElementSize(400, 500);
    const result = calculateMenuPosition(menu, 1800, 900, 1920, 1080);
    expect(result.left).toBeLessThanOrEqual(1520);
    expect(result.top).toBeLessThanOrEqual(580);
  });

  it('should clamp position to 0 when menu is larger than viewport', () => {
    const menu = mockElementSize(2500, 2000);
    const result = calculateMenuPosition(menu, 100, 200, 1920, 1080);
    expect(result.left).toBe(0);
    expect(result.top).toBe(0);
  });

  it('should handle submenu mode (positioned to right of parent)', () => {
    const menu = mockElementSize(200, 150);
    const result = calculateMenuPosition(menu, 100, 200, 1920, 1080, { direction: 'right', parentRect: { top: 200, left: 300, width: 150, height: 30 } });
    expect(result.left).toBe(450);
    expect(result.top).toBe(200);
  });

  it('should flip submenu left when right edge overflows', () => {
    const menu = mockElementSize(200, 150);
    const result = calculateMenuPosition(menu, 100, 200, 1920, 1080, { direction: 'right', parentRect: { top: 200, left: 1800, width: 150, height: 30 } });
    expect(result.left).toBe(1600);
  });

  it('should keep submenus opening left when the parent menu opened left and right side is still constrained', () => {
    const menu = mockElementSize(240, 150);
    const result = calculateMenuPosition(menu, 0, 0, 1000, 800, {
      direction: 'left',
      parentRect: { top: 120, left: 760, width: 220, height: 30 },
    });
    expect(result.left).toBe(520);
  });

  it('should open a submenu right when there is enough room on the right again', () => {
    const menu = mockElementSize(240, 150);
    const result = calculateMenuPosition(menu, 0, 0, 1000, 800, {
      direction: 'left',
      parentRect: { top: 120, left: 360, width: 220, height: 30 },
    });
    expect(result.left).toBe(580);
  });

  it('should handle submenu that would overflow right', () => {
    const menu = mockElementSize(200, 150);
    const result = calculateMenuPosition(menu, 0, 0, 1024, 768, {
      direction: 'right',
      parentRect: { top: 100, left: 900, width: 150, height: 30 },
    });
    expect(result.left).toBeLessThan(900);
  });

  it('should handle submenu that would overflow bottom', () => {
    const menu = mockElementSize(200, 400);
    const result = calculateMenuPosition(menu, 0, 0, 1920, 1080, {
      direction: 'right',
      parentRect: { top: 800, left: 500, width: 150, height: 30 },
    });
    expect(result.top).toBeLessThan(800);
  });
});
