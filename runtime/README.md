
# @wasm-sandbox/runtime

[![npm version](https://img.shields.io/npm/v/@wasm-sandbox/runtime.svg?style=flat-square)](https://www.npmjs.com/package/@wasm-sandbox/runtime)
[![npm downloads](https://img.shields.io/npm/dm/@wasm-sandbox/runtime.svg?style=flat-square)](https://www.npmjs.com/package/@wasm-sandbox/runtime)
[![License](https://img.shields.io/npm/l/@wasm-sandbox/runtime.svg?style=flat-square)](https://github.com/guyoung/wasm-sandbox-node/blob/main/LICENSE)

[English](README.md) / [简体中文](README_zh-CN.md)

`@wasm-sandbox/runtime` is a high-performance, secure WebAssembly runtime sandbox for Node.js. Built on the **Wasm Component Model** and **WASI (WebAssembly System Interface)**, it provides **Capability-based security** to ensure your host environment remains protected.

The runtime allows you to execute Wasm modules in a restricted environment with granular control over file system access, network requests, environment variables, and computational resources (memory, CPU fuel, and execution time).

## Features

- 🛡️ **Capability-based Security**: Strict control over file I/O and outbound HTTP/network requests.
- 📦 **Component Model Support**: Fully compatible with the latest WebAssembly Component Model.
- 🌐 **HTTP Hosting**: Native support for running Wasm-based HTTP services inside the sandbox.
- ⚡ **High Performance**: Powered by Rust (via NAPI-RS) with support for AOT (Ahead-of-Time) compilation caching.
- ⚖️ **Resource Quotas**: Limits for memory usage, stack size, execution fuel, and timeouts.

## Installation

```bash
npm install @wasm-sandbox/runtime
```

## Quick Start

### 1. Run a CLI-based Wasm Module (`run`)

Ideal for executing one-off tasks or command-line tools.

```javascript
const { run } = require('@wasm-sandbox/runtime');

run({
  wasmFile: './my_app.wasm',
  args: ['arg1', 'arg2'],
  // Capability: Map host directory to guest
  mapDirs: [{ key: './host-data', value: '/data' }],
  // Capability: Allow access to specific domains
  allowedOutboundHosts: ['https://api.github.com'],
  // Resource Limits
  wasmTimeout: 30, // 30 seconds timeout
  wasmMaxMemorySize: 1024 * 1024 * 64, // 64MB memory limit
});
```

### 2. Start a Wasm HTTP Server (`serve`)

Ideal for running Cloud-Native or Serverless HTTP handlers written in Wasm.

```javascript
const { serve } = require('@wasm-sandbox/runtime');

serve({
  wasmFile: './http_handler.wasm',
  ip: '0.0.0.0',
  port: 8080,
  envVars: {
    'NODE_ENV': 'production'
  },
  // Block specific network ranges
  blockNetworks: ['192.168.0.0/16'],
  // Pre-set data for WASI Key-Value API
  keyvalueVars: [{ key: 'cache_size', value: '100' }]
});
```

## Configuration Options

### Security & Capabilities

*   **`workDir`**: Grants access to a host directory as the guest's root directory.
*   **`mapDirs`**: Fine-grained directory mapping (e.g., mapping `./usr/hello` on the host to `/hello` in the sandbox).
*   **`allowedOutboundHosts`**: A whitelist for network destinations. Supports wildcards like `https://*.example.com` or `*://localhost:*`.
*   **`blockNetworks`**: A blacklist for IP networks to prevent the Wasm module from accessing sensitive internal infrastructure.

### Resource Constraints

*   **`wasmFuel`**: Enables the "fuel" mechanism. Wasm instructions consume fuel; the module traps once it runs out, preventing infinite loops.
*   **`wasmMaxMemorySize`**: Sets the maximum size (in bytes) that the linear memory is allowed to reach.
*   **`wasmMaxWasmStack`**: Limits the maximum stack size to prevent stack overflow.
*   **`wasmTimeout`**: Maximum execution time in seconds before the module is terminated.

### Performance Optimization

*   **`wasmCacheDir`**: Directory for storing precompiled `*.cwasm` files. Enabling this significantly reduces startup time for subsequent runs.

## Supported Platforms

Thanks to NAPI-RS, this package supports the following platforms and architectures:

*   Windows (x64, arm64)
*   macOS (x64, arm64)
*   Linux (x64, arm64, both glibc and musl)

## Requirements

- Node.js >= 12.22.0

## License

[MIT](LICENSE)

---

**Repository**: [https://github.com/guyoung/wasm-sandbox-node](https://github.com/guyoung/wasm-sandbox-node)