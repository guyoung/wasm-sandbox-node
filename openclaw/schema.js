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
  /** Socket ip for the web server to bind to. */
  ip: Type.Optional(Type.String({
    description: 'Socket ip for the web server to bind to.', 
  })),

  /** Socket port for the web server to bind to. */
  port: Type.Optional(Type.Number({
    description: 'Socket port for the web server to bind to.',
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


