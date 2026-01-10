/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig({
  root: 'src',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  test: {
    include: ['../tests/unit/**/*.{test,spec}.js'],
    environment: 'jsdom'
  }
});
