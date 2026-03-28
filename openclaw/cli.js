import wasm_sandbox from '@wasm-sandbox/runtime';

export function registerCli(params) {
    const { program } = params;

    const root = program.command("wasm-sandbox")
        .description("Wasm Sandbox CLI tool for OpenClaw.\n\n Wasm Sandbox Built on the `WebAssembly Component Model` and `WASI (WebAssembly System Interface)`, it provides `Capability-based security` to ensure your host environment remains protected.\nAllows to execute WebAssembly components in a restricted environment with granular control over file system access, network requests, environment variables, and computational resources (memory, CPU fuel, and execution time).\n\n Note: Wasm Sandbox does not support running a `Core WebAssembly module` directly. You can use `wasm-tools`(https://github.com/bytecodealliance/wasm-tools) to convert a Core wasm module into a `WebAssembly Component`")

    root
        .command("run")
        .description("Run a WebAssembly Component.")
        .argument("<args...>", "WebAssembly Component file and arguments.")
        .option('--program-name <name>', "Override the value of `argv[0]`, typically the name of the executable of the application being run.")
        .option('--invoke <function>', "The name of the function to run ")
        .option('--work-dir <dir>', "Grant access of a host directory to guest root dir.\nExample: `--work-dir ./`")
        .option('--map-dir <mapping...>',"Grant access of a host directory to a guest.\nExample: `--map-dir ./usr/hello::/hello`")
        .option('--env <var...>', "Pass an environment variable to the program.\nExample: `--env FOO=BAR`")
        .option('--allowed-outbound-hosts <host...>', "The network destinations which the component is allowed to access.\nExample: `--allowed-outbound-hosts https://*.github.net`")
        .option('--block-networks <network...>', "Set of IP networks to be blocked.\nExample: `--block-networks 1.1.1.1/32  --block-networks private`")
        .option('--wasm-timeout <seconds>', "Maximum execution time of wasm code before timing out (seconds).", parseInt)
        .option('--wasm-max-memory-size <bytes>', "Maximum size, in bytes, that a linear memory is allowed to reach.", parseInt)
        .option('--wasm-max-stack <bytes>', "Maximum stack size, in bytes, that wasm is allowed to consume before a stack overflow is reported.", parseInt)
        .option('--wasm-fuel <units>', "Enable execution fuel with N units fuel, trapping after running out of fuel.", parseInt)
        .option('--wasm-cache-dir <dir>', "Precompiled WebAssembly Component as `*.cwasm` files cache dir. ")
        .action(async (args, opts) => {
            wasm_sandbox.run({
                wasmFile: args.shift(),
                args: args || [],
                programName: opts.programName,
                invoke: opts.invoke,
                workDir: opts.workDir,
                mapDirs: opts.mapDir?.map(m => {
                    const [key, value] = m.split('::');
                    return { key, value: value || key };
                }),
                envVars: opts.env?.map(e => {
                    const [key, value] = e.split('=');
                    return { key, value };
                }),
                allowedOutboundHosts: opts.allowedOutboundHosts,
                blockNetworks: opts.blockNetworks,
                wasmTimeout: opts.wasmTimeout,
                wasmMaxMemorySize: opts.wasmMaxMemorySize,
                wasmMaxWasmStack: opts.wasmMaxStack,
                wasmFuel: opts.wasmFuel,
                wasmCacheDir: opts.wasmCacheDir
            });
        });

    root
        .command("serve")
        .description("Start http server from a WebAssembly Component.")
        .argument("<wasm>", "WebAssembly Component file.")
        .option('-i, --ip <ip>', "Socket ip for the web server to bind to.")
        .option('-p, --port <port>', "Socket port for the web server to bind to. ", parseInt)
         .option('--work-dir <dir>', "Grant access of a host directory to guest root dir.\nExample: `--work-dir ./`")
        .option('--map-dir <mapping...>',"Grant access of a host directory to a guest.\nExample: `--map-dir ./usr/hello::/hello`")
        .option('--env <var...>', "Pass an environment variable to the program.\nExample: `--env FOO=BAR`")
        .option('--allowed-outbound-hosts <host...>', "The network destinations which the component is allowed to access.\nExample: `--allowed-outbound-hosts https://*.github.net`")
        .option('--block-networks <network...>', "Set of IP networks to be blocked.\nExample: `--block-networks 1.1.1.1/32  --block-networks private`")
        .option('--config-var <var...>', "Pass a wasi config variable to the program.\nExample: `--config-var FOO=BAR`")
        .option('--keyvalue-var <var...>', "Preset data for the In-Memory provider of WASI key-value API.\nExample: `--keyvalue-var FOO=BAR`")
     .option('--wasm-timeout <seconds>', "Maximum execution time of wasm code before timing out (seconds).", parseInt)
        .option('--wasm-max-memory-size <bytes>', "Maximum size, in bytes, that a linear memory is allowed to reach.", parseInt)
        .option('--wasm-max-stack <bytes>', "Maximum stack size, in bytes, that wasm is allowed to consume before a stack overflow is reported.", parseInt)
        .option('--wasm-fuel <units>', "Enable execution fuel with N units fuel, trapping after running out of fuel.", parseInt)
        .option('--wasm-cache-dir <dir>', "Precompiled WebAssembly Component as `*.cwasm` files cache dir. ")
        .action(async (wasm, opts) => {
            const mapDirs = {};
            opts.mapDir?.forEach(m => {
                const [key, value] = m.split('::');
                mapDirs[key] = value || key;
            });

            const envVars = {};
            opts.env?.forEach(e => {
                const [key, value] = e.split('=');
                envVars[key] = value;
            });

            const configVars = opts.configVar?.map(v => {
                const [key, value] = v.split('=');
                return { key, value };
            });

            const keyvalueVars = opts.keyvalueVar?.map(v => {
                const [key, value] = v.split('=');
                return { key, value };
            });

            wasm_sandbox.serve({
                wasmFile: wasm,
                ip: opts.ip,
                port: opts.port,
                workDir: opts.workDir,
                mapDirs,
                envVars,
                allowedOutboundHosts: opts.allowedOutboundHosts,
                blockNetworks: opts.blockNetworks,
                configVars,
                keyvalueVars,
                wasmTimeout: opts.wasmTimeout,
                wasmMaxMemorySize: opts.wasmMaxMemorySize,
                wasmMaxWasmStack: opts.wasmMaxStack,
                wasmFuel: opts.wasmFuel,
                wasmCacheDir: opts.wasmCacheDir
            });
        });

}


