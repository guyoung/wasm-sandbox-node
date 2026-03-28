# wasm-sandbox

[![npm version](https://img.shields.io/npm/v/wasm-sandbox.svg?style=flat-square)](https://www.npmjs.com/package/wasm-sandbox)
[![npm downloads](https://img.shields.io/npm/dm/wasm-sandbox.svg?style=flat-square)](https://www.npmjs.com/package/wasm-sandbox)
[![License](https://img.shields.io/npm/l/wasm-sandbox.svg?style=flat-square)](https://github.com/guyoung/wasm-sandbox-node/blob/main/LICENSE)

[English](README.md) / [简体中文](README_zh-CN.md)

Node.js WebAssembly 沙箱命令行工具，基于 [@wasm-sandbox/runtime](https://www.npmjs.com/package/@wasm-sandbox/runtime) 构建。

> **注意：** 该 CLT 工具不支持直接运行 **Core WebAssembly module**。如需使用，请先通过 [`wasm-tools`](https://github.com/bytecodealliance/wasm-tools) 将 Core wasm module 转换为 **Webassembly Component**。


## 安装

```bash
npm install -g wasm-sandbox
# 或使用 npx
npx wasm-sandbox <command>
```

## 使用

### 运行 WebAssembly 模块

```bash
# 基本运行
wasm-sandbox run example.wasm

# 传递参数
wasm-sandbox run example.wasm arg1 arg2 arg3

# 调用特定函数
wasm-sandbox run example.wasm 1 2 --invoke add 

# 设置工作目录
wasm-sandbox run example.wasm --work-dir ./ 

# 映射目录
wasm-sandbox run example.wasm --map-dir ./host/path::/guest/path 

# 设置环境变量
wasm-sandbox run example.wasm --env FOO=BAR --env BAZ=QUX 

# 限制资源
wasm-sandbox run example.wasm --wasm-timeout 10 --wasm-max-memory-size 1073741824 
```

### 启动 HTTP 服务器

```bash
# 基本服务
wasm-sandbox serve example.wasm

# 指定端口和 IP
wasm-sandbox serve example.wasm --ip 127.0.0.1 --port 3000 

# 配置网络访问
wasm-sandbox serve example.wasm --allowed-outbound-hosts https://*.github.com

# 设置配置变量
wasm-sandbox serve example.wasm --config-var KEY=VALUE --keyvalue-var DATA=VALUE
```

## 命令选项

### run 命令

| 选项 | 说明 |
|------|------|
| `--program-name <name>` | 覆盖 argv[0] 的值 |
| `--invoke <function>` | 调用指定函数 |
| `--work-dir <dir>` | 授予主机目录访问权限 |
| `--map-dir <mapping>` | 映射主机目录到客户机，格式：`host::guest` |
| `--env <var>` | 传递环境变量，格式：`NAME=VALUE` |
| `--allowed-outbound-hosts <host>` | 允许访问的网络目标 |
| `--block-networks <network>` | 阻止的 IP 网络 |
| `--wasm-timeout <seconds>` | 最大执行时间（秒） |
| `--wasm-max-memory-size <bytes>` | 最大内存大小（字节） |
| `--wasm-max-stack <bytes>` | 最大栈大小（字节） |
| `--wasm-fuel <units>` | 执行燃料单位 |
| `--wasm-cache-dir <dir>` | 预编译 Wasm 组件缓存目录 |

### serve 命令

| 选项 | 说明 |
|------|------|
| `-i, --ip <ip>` | 绑定的 IP 地址 |
| `-p, --port <port>` | 绑定的端口 |
| `--config-var <var>` | WASI 配置变量，格式：`NAME=VALUE` |
| `--keyvalue-var <var>` | WASI key-value API 预设数据 |

其他选项与 `run` 命令相同。

## 开源协议

[MIT](LICENSE)

--- 

**项目仓库**: [https://github.com/guyoung/wasm-sandbox-node](https://github.com/guyoung/wasm-sandbox-node)