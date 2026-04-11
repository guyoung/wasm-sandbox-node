import { Type } from '@sinclair/typebox'

/** Dir option key-value object */
export const DirVarSchema = Type.Object({
  key: Type.String(),
  value: Type.String(),
})


/** Env option key-value object */
export const EnvVarSchema = Type.Object({
  key: Type.String(),
  value: Type.Optional(Type.String()),
})

// ─────────────────────────────────────────────
// RunOption
// ─────────────────────────────────────────────

/** Run a WebAssembly Component configuration option */
export const RunOptionSchema = Type.Object({
  /**
   * Override the value of `argv[0]`, typically the name of the executable of
   * the application being run.
   */
  programName: Type.Optional(Type.String({
    description: 'Override the value of argv[0], typically the name of the executable.',
  })),

  /** The name of the function to run */
  invoke: Type.Optional(Type.String({
    description: 'The name of the function to run',
  })),

  /**
   * Grant access of a host directory to guest root dir.
   * Example: `--work-dir ./`
   */
  workDir: Type.Optional(Type.String({
    description: 'Grant access of a host directory to guest root dir.',
  })),

  /**
   * Grant access of a host directory to a guest.
   * Example: `--map-dir ./usr/hello::/hello`
   */
  mapDirs: Type.Optional(Type.Array(DirVarSchema, {
    description: 'Grant access of a host directory to a guest.',
  })),

  /**
   * Pass an environment variable to the program.
   * Example: `--env FOO=BAR`
   */
  envVars: Type.Optional(Type.Array(EnvVarSchema, {
    description: 'Pass an environment variable to the program.',
  })),

  /**
   * The network destinations which the component is allowed to access.
   * Example: `--allowed-outbound-hosts https://*.github.net`
   */
  allowedOutboundHosts: Type.Optional(Type.Array(Type.String(), {
    description: 'The network destinations which the component is allowed to access.',
  })),

  /**
   * Set of IP networks to be blocked.
   * Example: `--block-networks 1.1.1.1/32 --block-networks private`
   */
  blockNetworks: Type.Optional(Type.Array(Type.String(), {
    description: 'Set of IP networks to be blocked.',
  })),

  /** Maximum execution time of wasm code before timing out (seconds). */
  wasmTimeout: Type.Optional(Type.Number({
    description: 'Maximum execution time of wasm code before timing out (seconds).',
    minimum: 0,
  })),

  /**
   * Maximum size, in bytes, that a linear memory is allowed to reach.
   */
  wasmMaxMemorySize: Type.Optional(Type.Number({
    description: 'Maximum size in bytes that a linear memory is allowed to reach.',
    minimum: 0,
  })),

  /**
   * Maximum stack size, in bytes, that wasm is allowed to consume.
   */
  wasmMaxWasmStack: Type.Optional(Type.Number({
    description: 'Maximum stack size in bytes that wasm is allowed to consume.',
    minimum: 0,
  })),

  /**
   * Enable execution fuel with N units fuel, trapping after running out of fuel.
   */
  wasmFuel: Type.Optional(Type.Number({
    description: 'Enable execution fuel with N units fuel.',
    minimum: 0,
  })),

  /** Precompiled WebAssembly Component as `*.cwasm` files cache dir. */
  wasmCacheDir: Type.Optional(Type.String({
    description: 'Precompiled WebAssembly Component cache dir.',
  })),

  /** The WebAssembly Component to run */
  wasmFile: Type.String({
    description: 'The WebAssembly Component to run',
  }),

  /**
   * Arguments passed to the WebAssembly Component.
   */
  args: Type.Optional(Type.Array(Type.String(), {
    description: 'Arguments passed to the WebAssembly Component.',
  })),
})

// ─────────────────────────────────────────────
// ServeOption
// ─────────────────────────────────────────────

/** Start http server from a WebAssembly Component configuration option */
export const ServeOptionSchema = Type.Object({
  /** Socket ip for the web server to bind to. 
   * Default: Loopback address, 127.0.0.1
  */
  ip: Type.Optional(Type.String({
    description: 'Socket ip for the web server to bind to.\nDefault: Loopback address, 127.0.0.1', 
  })),

  /** Socket port for the web server to bind to. 
   * Default: 30001
  */
  port: Type.Optional(Type.Number({
    description: 'Socket port for the web server to bind to.\nDefault: 30001',
    minimum: 0,
    maximum: 65535,
  })),

    /** Socket port where, when connected to, will initiate a graceful shutdown.
   * Default: 30002
  */
  shutdownPort: Type.Optional(Type.Number({
    description: 'Socket port where, when connected to, will initiate a graceful shutdown.\nDefault: 30002',
    minimum: 0,
    maximum: 65535,
  })),
  /**
   * Grant access of a host directory to guest root dir.
   * Example: `--work-dir ./`
   */
  workDir: Type.Optional(Type.String({
    description: 'Grant access of a host directory to guest root dir.',
  })),

  /**
   * Grant access of a host directory to a guest.
   * Example: `--map-dir ./usr/hello::/hello`
   */
  mapDirs: Type.Optional(Type.Record(
    Type.String(),
    Type.String(),
    { description: 'Grant access of a host directory to a guest.' }
  )),

  /**
   * Pass an environment variable to the program.
   * Example: `--env FOO=BAR`
   */
  envVars: Type.Optional(Type.Record(
    Type.String(),
    Type.Union([
      Type.String(),
      Type.Null(),
    ]),
    { description: 'Pass an environment variable to the program.' }
  )),

  /**
   * The network destinations which the component is allowed to access.
   * Example: `--allowed-outbound-hosts https://*.github.net`
   */
  allowedOutboundHosts: Type.Optional(Type.Array(Type.String(), {
    description: 'The network destinations which the component is allowed to access.',
  })),

  /**
   * Set of IP networks to be blocked.
   * Example: `--block-networks 1.1.1.1/32 --block-networks private`
   */
  blockNetworks: Type.Optional(Type.Array(Type.String(), {
    description: 'Set of IP networks to be blocked.',
  })),

  /**
   * Pass a wasi config variable to the program.
   * Example: `--config-var FOO=BAR`
   */
  configVars: Type.Optional(Type.Array(EnvVarSchema, {
    description: 'Pass a wasi config variable to the program.',
  })),

  /**
   * Preset data for the In-Memory provider of WASI key-value API.
   * Example: `--keyvalue-var FOO=BAR`
   */
  keyvalueVars: Type.Optional(Type.Array(EnvVarSchema, {
    description: 'Preset data for the In-Memory provider of WASI key-value API.',
  })),

  /** Maximum execution time of wasm code before timing out (seconds). */
  wasmTimeout: Type.Optional(Type.Number({
    description: 'Maximum execution time of wasm code before timing out (seconds).',
    minimum: 0,
  })),

  /**
   * Maximum size, in bytes, that a linear memory is allowed to reach.
   */
  wasmMaxMemorySize: Type.Optional(Type.Number({
    description: 'Maximum size in bytes that a linear memory is allowed to reach.',
    minimum: 0,
  })),

  /**
   * Maximum stack size, in bytes, that wasm is allowed to consume.
   */
  wasmMaxWasmStack: Type.Optional(Type.Number({
    description: 'Maximum stack size in bytes that wasm is allowed to consume.',
    minimum: 0,
  })),

  /**
   * Enable execution fuel with N units fuel, trapping after running out of fuel.
   */
  wasmFuel: Type.Optional(Type.Number({
    description: 'Enable execution fuel with N units fuel.',
    minimum: 0,
  })),

  /** Precompiled WebAssembly Component as `*.cwasm` files cache dir. */
  wasmCacheDir: Type.Optional(Type.String({
    description: 'Precompiled WebAssembly Component cache dir.',
  })),

  /** The WebAssembly Component to run */
  wasmFile: Type.String({
    description: 'The WebAssembly Component to run',
  }),
})


export const DownloadOptionSchema = Type.Object({
  /** URL to download */
  url: Type.String({
    description: 'URL of the file to download',
  }),

  /** Output file path (absolute or relative path) */
  output: Type.String({
    description: 'Output file path (absolute or relative to workspace)',
  }),

  /** Maximum number of retry attempts on failure (default: 3) */
  retry: Type.Optional(Type.Number({
    description: 'Maximum retry attempts on failure (default: 3)',
    minimum: 0,
    maximum: 10,
  })),

  /** Enable resume for interrupted downloads (default: true) */
  resume: Type.Optional(Type.Boolean({
    description: 'Enable resume for interrupted downloads (default: true)',
  })),

  /** Download timeout in milliseconds (default: 300000 = 5 minutes) */
  timeout: Type.Optional(Type.Number({
    description: 'Download timeout in milliseconds (default: 300000)',
    minimum: 1000,
  })),

  /** Expected file size in bytes (for resume validation) */
  expectedSize: Type.Optional(Type.Number({
    description: 'Expected file size in bytes (for resume validation)',
    minimum: 0,
  })),

  /** Custom HTTP headers */
  headers: Type.Optional(Type.Record(Type.String(), Type.String(), {
    description: 'Custom HTTP headers',
  })),
});