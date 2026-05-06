<p align="center">
  <img src="https://raw.githubusercontent.com/lt-monster/omni-ctx/master/assets/logo/omni-ctx-logo.svg" alt="OmniCtx logo" width="140" />
</p>

<h1 align="center">OmniCtx</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/omni-ctx">
    <img alt="npm version" src="https://img.shields.io/npm/v/omni-ctx" />
  </a>
  <a href="https://github.com/lt-monster/omni-ctx/blob/master/LICENSE">
    <img alt="license" src="https://img.shields.io/badge/license-MIT-blue.svg" />
  </a>
  <a href="https://developer.mozilla.org/en-US/docs/Web/API/Web_components">
    <img alt="runtime" src="https://img.shields.io/badge/runtime-Web%20Components-orange.svg" />
  </a>
</p>

<p align="center">
  <a href="./README.md">English</a> |
  <a href="./README_ZH.md">简体中文</a>
</p>

OmniCtx 是一个基于 Web Components 的上下文菜单组件库，用于在浏览器环境中快速构建可复用的右键菜单交互。它同时支持声明式标签写法与纯编程式动态调用，适用于固定菜单、运行时菜单以及需要缓存复用的场景。

## ✨ 功能特性

- 支持声明式使用与纯编程式动态使用
- 支持运行时菜单创建，以及基于 `cacheKey` 的菜单实例复用
- 支持主题定制与基础样式能力
- 支持无限级子菜单
- 支持多种菜单项类型，如普通项、分割线、单选项、开关项等

## 📦 安装

可任选以下一种包管理器安装：

```bash
npm install omni-ctx
yarn add omni-ctx
pnpm add omni-ctx
```

如果你正在本仓库内进行开发，也可以使用：

```bash
bun install
```

## 🚀 使用方式

### 1. 声明式使用

适用于菜单结构相对固定、希望直接在页面模板中维护菜单内容的场景。

```html
<div id="target">右键点击这里</div>

<context-menu id="menu">
  <context-menu-item label="打开" icon="📂"></context-menu-item>
  <context-menu-item label="品牌资源" icon-size="18px">
    <svg slot="icon" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M8 1.25 14 4.6v6.8L8 14.75 2 11.4V4.6L8 1.25Z" fill="currentColor" opacity="0.18" />
      <path d="M8 1.25 14 4.6v6.8L8 14.75 2 11.4V4.6L8 1.25Zm0 1.44L3.25 5.35v5.3L8 13.31l4.75-2.66v-5.3L8 2.69Z" fill="currentColor" />
      <path d="M8 4.9 10.8 6.5V9.7L8 11.3 5.2 9.7V6.5L8 4.9Z" fill="currentColor" />
    </svg>
  </context-menu-item>
  <context-menu-item label="删除"></context-menu-item>
</context-menu>

<script type="module">
  import 'omni-ctx';

  const target = document.querySelector('#target');
  const menu = document.querySelector('#menu');

  target.addEventListener('contextmenu', (event) => {
    event.preventDefault();
    menu.open(event);
  });
</script>
```

补充说明：

- 基于原生 Custom Elements 实现，无需依赖特定前端框架
- 适合在页面结构中直接声明和维护菜单内容
- `icon` 继续支持 emoji 和文本图标，`slot="icon"` 可用于渲染自定义 SVG 或其他节点
- `icon-size` 可为单个菜单项覆盖图标区域尺寸，接受任意合法 CSS 尺寸值

### 2. 动态使用

适用于不希望预先编写 `<context-menu>` 标签，而是在运行时根据坐标和菜单数据直接打开菜单的场景。

#### ESM / 模块方式

```html
<script type="module">
  import { openContextMenu } from './dist/omni-ctx.min.js';

  document.addEventListener('contextmenu', (event) => {
    event.preventDefault();

    openContextMenu({
      x: event.clientX,
      y: event.clientY,
      items: [
        { label: '打开' },
        { label: '删除' },
      ],
    });
  });
</script>
```

#### 普通 `script` 方式

```html
<script src="./dist/omni-ctx.global.min.js"></script>
<script>
  document.addEventListener('contextmenu', function (event) {
    event.preventDefault();

    OmniCtx.openContextMenu({
      x: event.clientX,
      y: event.clientY,
      items: [
        { label: '打开' },
        { label: '删除' },
      ],
    });
  });
</script>
```

补充说明：

- 模块方式使用包名 `omni-ctx` 或对应的 ESM 构建文件
- 普通 `script` 方式通过全局对象 `OmniCtx` 访问运行时 API
- 生产环境推荐使用 `dist/omni-ctx.min.js` 或 `dist/omni-ctx.global.min.js`
- 调试时可使用未压缩的 `dist/omni-ctx.js` 或 `dist/omni-ctx.global.js`
- 如果只使用声明式标签，加载全局构建后也可以在普通 `script` 中直接操作菜单实例
- 不传 `cacheKey` 时，菜单会按一次性实例创建并在关闭后移除
- 传入 `cacheKey` 时，可复用同一个运行时菜单实例，适合高频触发场景

## 📚 更多文档

更多功能说明、完整 API、主题配置与高级用法，请参考项目文档：

<https://docs.omni-ctx.dev>
