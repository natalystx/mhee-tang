import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  banner: ({ format }) => {
    if (format === "esm")
      return {
        js: `import { createRequire } from 'module'; const require = createRequire(import.meta.url);`,
      }
    return {}
  },
})
