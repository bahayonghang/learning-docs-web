import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    target: 'es2022',
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [{ name: 'math-renderer', test: /node_modules[\\/]katex[\\/]/ }],
        },
      },
    },
  },
});
