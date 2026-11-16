import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: {
        hub: 'src/hub.ts',
        index: 'src/index.ts',
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
  },
  plugins: [
    dts({
      tsconfigPath: './tsconfig.app.json',
    }),
  ],
  server: {
    port: 5175,
    strictPort: true,
  },
});
