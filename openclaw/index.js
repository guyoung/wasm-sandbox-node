import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";

import { registerRunCli, registerServeCli } from "./cli.js";
import { createRunTool, createServeTool } from './tool.js'
import { createDownloadTool, registerDownloadCli } from './download.js'

export default definePluginEntry({
    id: "openclaw-wasm-sandbox",
    name: "Wasm Sandbox",
    description: "Wasm Sandbox Plugin for OpenClaw",

    register(api) {
         api.registerCli(({ program }) => {
             const root = program.command("wasm-sandbox")
        .description("Wasm Sandbox CLI tool for OpenClaw.\n\n Wasm Sandbox Built on the `WebAssembly Component Model` and `WASI (WebAssembly System Interface)`, it provides `Capability-based security` to ensure your host environment remains protected.\nAllows to execute WebAssembly components in a restricted environment with granular control over file system access, network requests, environment variables, and computational resources (memory, CPU fuel, and execution time).\n\n Note: Wasm Sandbox does not support running a `Core WebAssembly module` directly. You can use `wasm-tools`(https://github.com/bytecodealliance/wasm-tools) to convert a Core wasm module into a `WebAssembly Component`")
            
            registerRunCli({
			    root,			
		    });

            registerServeCli({
			    root,			
		    });

            registerDownloadCli({
			    root,			
		    });

        }, { commands: ["wasm-sandbox"] });



        api.registerTool(createRunTool(api), { optional: true });

        api.registerTool(createServeTool(api), { optional: true });

        api.registerTool( createDownloadTool(api), { optional: true });
    },


   
});
