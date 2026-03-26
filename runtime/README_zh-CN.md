# @wasm-sandbox/runtime

[![npm version](https://img.shields.io/npm/v/@wasm-sandbox/runtime.svg?style=flat-square)](https://www.npmjs.com/package/@wasm-sandbox/runtime)
[![npm downloads](https://img.shields.io/npm/dm/@wasm-sandbox/runtime.svg?style=flat-square)](https://www.npmjs.com/package/@wasm-sandbox/runtime)
[![License](https://img.shields.io/npm/l/@wasm-sandbox/runtime.svg?style=flat-square)](https://github.com/guyoung/wasm-sandbox-node/blob/main/LICENSE)

[English](README.md) / [简体中文](README_zh-CN.md)

`@wasm-sandbox/runtime` 是一个高性能、安全的 Node.js WebAssembly 运行时沙箱。它基于 **Wasm 组件模型 (Component Model)** 和 **WASI (WebAssembly System Interface)** 构建，提供了**基于能力的安全性 (Capability-based security)**。

该运行时允许你在受限的沙箱环境中执行 Wasm 模块，对文件系统访问、网络请求、环境变量和计算资源（内存、计算量、执行时间）进行精细化控制。

## 特性

- 🛡️ **能力路由安全**：严格控制文件读写、网络出站请求。
- 📦 **支持组件模型**：兼容最新的 WebAssembly Component Model。
- 🌐 **HTTP 托管**：支持直接在沙箱内运行 Wasm 编写的 HTTP 服务。
- ⚡ **高性能**：底层采用 Rust 编写（通过 NAPI-RS 绑定），支持 AOT 编译缓存。
- ⚖️ **资源配额**：可限制内存大小、堆栈大小、计算燃油 (Fuel) 和超时时间。

## 安装

```bash
npm install @wasm-sandbox/runtime
```

## 核心 API 快速上手

### 1. 运行 CLI 模式的 Wasm 模块 (`run`)

适用于运行一次性任务或命令行工具。

```javascript
const { run } = require('@wasm-sandbox/runtime');

run({
  wasmFile: './my_app.wasm',
  args: ['arg1', 'arg2'],
  // 能力授权：映射主机目录到沙箱
  mapDirs: [{ key: './host-data', value: '/data' }],
  // 能力授权：允许访问指定的外部域名
  allowedOutboundHosts: ['https://api.github.com'],
  // 资源限制
  wasmTimeout: 30, // 30秒超时
  wasmMaxMemorySize: 1024 * 1024 * 64, // 64MB 内存限制
});
```

### 2. 启动 Wasm HTTP 服务 (`serve`)

适用于运行云原生、无服务器架构的 Wasm HTTP 处理程序。

```javascript
const { serve } = require('@wasm-sandbox/runtime');

serve({
  wasmFile: './http_handler.wasm',
  ip: '0.0.0.0',
  port: 8080,
  envVars: {
    'NODE_ENV': 'production'
  },
  // 屏蔽特定网络段
  blockNetworks: ['192.168.0.0/16'],
  // 预设 Key-Value 存储数据 (WASI Key-Value API)
  keyvalueVars: [{ key: 'cache_size', value: '100' }]
});
```

## 配置选项说明

### 安全控制 (Capabilities)

*   **`workDir`**: 授予对主机目录的访问权限作为 guest 的根目录。
*   **`mapDirs`**: 细粒度的目录映射，例如将 `./usr/hello` 映射为沙箱内的 `/hello`。
*   **`allowedOutboundHosts`**: 网络白名单。支持通配符，如 `https://*.example.com` 或 `*://localhost:*`。
*   **`blockNetworks`**: IP 网络黑名单，防止 Wasm 模块访问内部私有网络。

### 资源限制 (Resource Limits)

*   **`wasmFuel`**: 启用“燃油”机制。Wasm 指令会消耗燃油，耗尽后自动停止执行，防止死循环。
*   **`wasmMaxMemorySize`**: 限制线性内存的最大字节数。
*   **`wasmMaxWasmStack`**: 限制栈大小，防止栈溢出。
*   **`wasmTimeout`**: 强制执行超时时间（秒）。

### 性能优化

*   **`wasmCacheDir`**: 指定 `.cwasm` 预编译文件的缓存目录。启用后，后续启动速度将大幅提升。

## 支持平台

由于采用了 NAPI-RS，该库支持以下主流操作系统和架构：

*   Windows (x64, arm64)
*   macOS (x64, arm64)
*   Linux (x64, arm64, glibc/musl)

## 引擎要求

- Node.js >= 12.22.0

## 开源协议

[MIT](LICENSE)

--- 

**项目仓库**: [https://github.com/guyoung/wasm-sandbox-node](https://github.com/guyoung/wasm-sandbox-node)