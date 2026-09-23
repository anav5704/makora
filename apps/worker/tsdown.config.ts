import { defineConfig } from "tsdown";

export default defineConfig({
    entry: ["src/sync.worker.ts", "src/analysis.worker.ts"],
    sourcemap: true,
    dts: true,
    // Bundle workspace packages so dist runs on plain node, which cannot
    // resolve their extensionless src imports via the exports map
    noExternal: [/^@makora\//],
});
