import { resolve } from "path";
import { defineConfig, searchForWorkspaceRoot } from "vite";

export default defineConfig(({ mode }) => ({
  ...(mode === "development" && {
    optimizeDeps: {
      exclude: ["@nl-design-system-community/editor"],
    },
    resolve: {
      alias: {
        "@nl-design-system-community/editor": resolve(__dirname, "../editor/src"),
      },
    },
  }),
  server: {
    fs: {
      allow: [searchForWorkspaceRoot(process.cwd())],
    },
    port: 5174,
    strictPort: true,
  },
}));
