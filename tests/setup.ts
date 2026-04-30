// Bun 已内置 DOM 与 Web API 支持，无需额外 setup
// 如需 mock getBoundingClientRect，可直接赋值：
if (!Element.prototype.getBoundingClientRect) {
  (Element.prototype as any).getBoundingClientRect = () => ({
    x: 0, y: 0, width: 0, height: 0,
    top: 0, right: 0, bottom: 0, left: 0,
    toJSON: () => ({}),
  });
}
