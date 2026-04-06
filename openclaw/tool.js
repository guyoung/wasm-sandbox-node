import { RunOptionSchema, ServeOptionSchema } from "./schema";
import wasm_sandbox from '@wasm-sandbox/runtime';

export function createRunTool(api) {
    return {
        name: "wasm-sandbox-run",
        label: "Wasm Sandbox run",
        description: "Run a WebAssembly Component.",
        parameters: RunOptionSchema,
        execute: async (_toolCallId, rawParams) => {
            try {
                wasm_sandbox.run(rawParams);
            } catch (err) {
                console.error('Error: ', err.message)
            }

        }
    }
}



export function createServeTool(api) {
    return {
        name: "wasm-sandbox-serve",
        label: "Wasm Sandbox serve",
        description: "Run a WebAssembly Component.",
        parameters: ServeOptionSchema,
        execute: async (_toolCallId, rawParams) => {
            try {
                wasm_sandbox.serve(rawParams);
            } catch (err) {
                console.error('Error: ', err.message)
            }

        }
    }
}