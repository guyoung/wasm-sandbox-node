import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";

import { registerCli } from "./cli.js";
import { createRunTool, createServeTool } from './tool.js'

export default definePluginEntry({
    id: "openclaw-wasm-sandbox",
    name: "Wasm Sandbox",
    description: "Wasm Sandbox Plugin for OpenClaw",

    register(api) {
         api.registerCli(({ program }) => registerCli({
			program,			
		}), { commands: ["wasm-sandbox"] });

        api.registerTool(createRunTool(api), { optional: true });

        api.registerTool(createServeTool(api), { optional: true });
    },


   
});
