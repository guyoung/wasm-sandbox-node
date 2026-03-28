# openclaw-wasm-sandbox

> Wasm Sandbox Plugin for OpenClaw

[![npm version](https://img.shields.io/npm/v/openclaw-wasm-sandbox.svg?style=flat-square)](https://www.npmjs.com/package/openclaw-wasm-sandbox)
[![npm downloads](https://img.shields.io/npm/dm/openclaw-wasm-sandbox.svg?style=flat-square)](https://www.npmjs.com/package/openclaw-wasm-sandbox)
[![License](https://img.shields.io/npm/l/openclaw-wasm-sandbox.svg?style=flat-square)](https://github.com/guyoung/wasm-sandbox-node/blob/main/LICENSE)


`openclaw-wasm-sandbox` is an OpenClaw plugin that provides a **capability-based secure sandbox** for running WebAssembly (WASM) components. Built on the **WebAssembly Component Model** and **WASI (WebAssembly System Interface)**, it allows you to safely execute untrusted WASM code with granular control over file system access, network requests, environment variables, and computational resources.

## ⚠️ Prerequisites

- **WebAssembly Component** — This plugin runs **WASM Components** (`.wasm` files built with the Component Model), not Core WebAssembly modules.
- To convert a Core WASM module into a Component, use [wasm-tools](https://github.com/bytecodealliance/wasm-tools):
  ```bash
  wasm-tools component new input.wasm -o output.wasm
  ```

## Features

- 🔒 **Capability-based Security** — Fine-grained control over system resources
- 📁 **File System Isolation** — Map specific host directories to guest paths
- 🌐 **Network Control** — Allow or block network access by host pattern
- ⏱️ **Resource Limits** — Timeout, memory, stack size, and execution fuel
- 🔧 **Environment Variables** — Pass selective env vars to WASM components
- 🖥️ **HTTP Server Mode** — Serve WASM components as web services

## Installation

### From ClawHub

```bash
openclaw plugins install clawhub:openclaw-wasm-sandbox
```

### From npm

```bash
openclaw plugins install openclaw-wasm-sandbox
```

### From Source

```bash
# Clone the repository
git clone https://github.com/your-repo/openclaw-wasm-sandbox.git
cd openclaw-wasm-sandbox

# Install dependencies
npm install

# Link or install
openclaw plugins install . --link    # Development (live reload)
# or
openclaw plugins install .           # Production (copy files)
```

## Usage

### CLI Commands

The plugin provides two subcommands under `wasm-sandbox`:

#### Run a WASM Component

```bash
openclaw wasm-sandbox run <file.wasm> [args...]
```

**Example:**

```bash
# Basic run
openclaw wasm-sandbox run ./hello.wasm

# With arguments
openclaw wasm-sandbox run ./hello.wasm arg1 arg2

# With environment variables
openclaw wasm-sandbox run ./hello.wasm --env FOO=bar --env BAZ=qux

# With directory mapping
openclaw wasm-sandbox run ./hello.wasm --map-dir ./data::/data

# With network restrictions (allow only github.com)
openclaw wasm-sandbox run ./hello.wasm --allowed-outbound-hosts https://github.com

# With resource limits
openclaw wasm-sandbox run ./hello.wasm \
  --wasm-timeout 30 \
  --wasm-max-memory-size 67108864 \
  --wasm-max-stack 1048576 \
  --wasm-fuel 1000000
```

#### Start HTTP Server from WASM Component

```bash
openclaw wasm-sandbox serve <file.wasm> [options]
```

**Example:**

```bash
# Basic server (defaults to localhost:8080)
openclaw wasm-sandbox serve ./server.wasm

# Custom IP and port
openclaw wasm-sandbox serve ./server.wasm -i 0.0.0.0 -p 3000

# With environment variables and directory mapping
openclaw wasm-sandbox serve ./server.wasm \
  --env NODE_ENV=production \
  --map-dir ./public::/public

# With WASI config variables
openclaw wasm-sandbox serve ./server.wasm \
  --config-var LOG_LEVEL=info \
  --keyvalue-var CACHE_TTL=3600
```

### Available Options

#### Common Options (both `run` and `serve`)

| Option | Type | Description |
|--------|------|-------------|
| `--work-dir <dir>` | string | Grant access of a host directory to guest root dir |
| `--map-dir <mapping...>` | string[] | Map host directory to guest path (`host::guest` format) |
| `--env <var...>` | string[] | Pass environment variable (`KEY=value` format) |
| `--allowed-outbound-hosts <host...>` | string[] | Allowed network destinations (supports wildcards) |
| `--block-networks <network...>` | string[] | Blocked IP networks (use `private` for private ranges) |
| `--wasm-timeout <seconds>` | number | Maximum execution time before timeout |
| `--wasm-max-memory-size <bytes>` | number | Maximum linear memory size |
| `--wasm-max-stack <bytes>` | number | Maximum stack size before overflow |
| `--wasm-fuel <units>` | number | Execution fuel units (traps when exhausted) |
| `--wasm-cache-dir <dir>` | string | Directory for precompiled `.cwasm` cache files |

#### `run` Exclusive Options

| Option | Type | Description |
|--------|------|-------------|
| `--program-name <name>` | string | Override `argv[0]` (executable name) |
| `--invoke <function>` | string | Name of the exported function to invoke |

#### `serve` Exclusive Options

| Option | Type | Description |
|--------|------|-------------|
| `-i, --ip <ip>` | string | Socket IP to bind to |
| `-p, --port <port>` | number | Socket port to bind to (0-65535) |
| `--config-var <var...>` | string[] | WASI config variables (`KEY=value`) |
| `--keyvalue-var <var...>` | string[] | In-memory key-value data (`KEY=value`) |

### Agent Tools

The plugin also registers two tools for use by AI agents:

| Tool | Description |
|------|-------------|
| `wasm-sandbox-run` | Run a WebAssembly Component with configurable options |
| `wasm-sandbox-serve` | Start an HTTP server from a WebAssembly Component |

Tools are registered as **optional** — agents can use them when needed.

## Security Model

The plugin uses **capability-based security**:

- **No implicit access** — WASM components have zero access by default
- **Explicit grants only** — Access must be explicitly granted via options
- **Resource bounds** — Memory, stack, fuel, and time limits enforce resource consumption
- **Network isolation** — Outbound network access is denied by default, allowlist-based

### Network Patterns

`--allowed-outbound-hosts` supports:
- Exact hosts: `https://api.github.com`
- Wildcard subdomains: `https://*.github.com`
- Protocols: `http://`, `https://`

`--block-networks` supports:
- IP networks: `1.1.1.1/32`, `10.0.0.0/8`
- Special keywords: `private` (blocks RFC 1918 addresses)

## Dependencies

- [`@wasm-sandbox/runtime`](https://www.npmjs.com/package/@wasm-sandbox/runtime)
- [`@sinclair/typebox`](https://www.npmjs.com/package/@sinclair/typebox) — JSON schema type definitions

## License

[MIT](LICENSE)

---

**Repository**: [https://github.com/guyoung/wasm-sandbox-node](https://github.com/guyoung/wasm-sandbox-node)