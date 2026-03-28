# wasm-sandbox

Node.js WebAssembly sandbox CLI tool built on [@wasm-sandbox/runtime](https://www.npmjs.com/package/@wasm-sandbox/runtime).

> **Note:** This CLI tool does not support running a **Core WebAssembly module** directly. You can use [`wasm-tools`](https://github.com/bytecodealliance/wasm-tools) to convert a Core wasm module into a **WebAssembly Component**.

## Installation

```bash
npm install -g wasm-sandbox
# or use npx
npx wasm-sandbox <command>
```

## Usage

### Run WebAssembly Component

```bash
# Basic run
wasm-sandbox run example.wasm

# Pass arguments
wasm-sandbox run example.wasm arg1 arg2 arg3

# Invoke specific function
wasm-sandbox run example.wasm 1 2 --invoke add 

# Set working directory
wasm-sandbox run example.wasm --work-dir ./ 

# Map directory
wasm-sandbox run example.wasm --map-dir ./host/path::/guest/path

# Set environment variables
wasm-sandbox run  example.wasm --env FOO=BAR --env BAZ=QUX

# Limit resources
wasm-sandbox run example.wasm --wasm-timeout 10 --wasm-max-memory-size 1073741824
```

### Start HTTP Server

```bash
# Basic server
wasm-sandbox serve example.wasm

# Specify port and IP
wasm-sandbox serve example.wasm --ip 127.0.0.1 --port 3000 

# Configure network access
wasm-sandbox serve example.wasm --allowed-outbound-hosts https://*.github.com

# Set config variables
wasm-sandbox serve example.wasm --config-var KEY=VALUE --keyvalue-var DATA=VALUE 
```

## Command Options

### run Command

| Option | Description |
|--------|-------------|
| `--program-name <name>` | Override argv[0] value |
| `--invoke <function>` | Invoke specific function |
| `--work-dir <dir>` | Grant host directory access |
| `--map-dir <mapping>` | Map host directory to guest, format: `host::guest` |
| `--env <var>` | Pass environment variable, format: `NAME=VALUE` |
| `--allowed-outbound-hosts <host>` | Allowed network destinations |
| `--block-networks <network>` | Blocked IP networks |
| `--wasm-timeout <seconds>` | Maximum execution time (seconds) |
| `--wasm-max-memory-size <bytes>` | Maximum memory size (bytes) |
| `--wasm-max-stack <bytes>` | Maximum stack size (bytes) |
| `--wasm-fuel <units>` | Execution fuel units |
| `--wasm-cache-dir <dir>` | Precompiled Wasm Component cache directory |

### serve Command

| Option | Description |
|--------|-------------|
| `-i, --ip <ip>` | Bind IP address |
| `-p, --port <port>` | Bind port |
| `--config-var <var>` | WASI config variable, format: `NAME=VALUE` |
| `--keyvalue-var <var>` | WASI key-value API preset data |

Other options are same as `run` command.

## License

[MIT](LICENSE)

---

**Repository**: [https://github.com/guyoung/wasm-sandbox-node](https://github.com/guyoung/wasm-sandbox-node)