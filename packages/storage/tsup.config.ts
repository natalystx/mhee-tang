import { defineConfig } from "tsup"

export default defineConfig([
  {
    entry: ["src/index.ts"],
    clean: true,
    sourcemap: true,
    dts: true,
    cjsInterop: true,
    format: ["esm"],
    treeshake: true,
    outDir: "dist",
    banner: ({ format }) => {
      if (format === "esm")
        return {
          js: `import { createRequire } from 'module'; const require = createRequire(import.meta.url);`,
        }
      return {}
    },
  },
])
