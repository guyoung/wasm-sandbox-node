#!/usr/bin/env node

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

import { Command } from 'commander';
import wasm_sandbox from '@wasm-sandbox/runtime';

const __dirname = dirname(fileURLToPath(import.meta.url))
const { name, version, description } = JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf8'))

const program = new Command();

program
  .name(name)
  .version(version)
  .description(description);

program
  .command('run <wasm> [ARGS...] [OPTIONS]')
  .option('--program-name <name>')
  .option('--invoke <function>')
  .option('--work-dir <dir>')
  .option('--map-dir <mapping...>')
  .option('--env <var...>')
  .option('--allowed-outbound-hosts <host...>')
  .option('--block-networks <network...>')
  .option('--wasm-timeout <seconds>', '', parseInt)
  .option('--wasm-max-memory-size <bytes>', '', parseInt)
  .option('--wasm-max-stack <bytes>', '', parseInt)
  .option('--wasm-fuel <units>', '', parseInt)
  .option('--wasm-cache-dir <dir>')
  .action((wasm, args, opts) => {
    wasm_sandbox.run({
      wasmFile: wasm,
      args,
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

program
  .command('serve <wasm> [OPTIONS]')
  .option('-i, --ip <ip>')
  .option('-p, --port <port>', '', parseInt)
  .option('--work-dir <dir>')
  .option('--map-dir <mapping...>')
  .option('--env <var...>')
  .option('--allowed-outbound-hosts <host...>')
  .option('--block-networks <network...>')
  .option('--config-var <var...>')
  .option('--keyvalue-var <var...>')
  .option('--wasm-timeout <seconds>', '', parseInt)
  .option('--wasm-max-memory-size <bytes>', '', parseInt)
  .option('--wasm-max-stack <bytes>', '', parseInt)
  .option('--wasm-fuel <units>', '', parseInt)
  .option('--wasm-cache-dir <dir>')
  .action((wasm, opts) => {
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

program.parse();
