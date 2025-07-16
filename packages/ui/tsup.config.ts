import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  target: 'es2018',
  external: ['react', 'react-dom', 'next-auth', 'next-auth/react', 'next/router'],
  treeshake: true,
  minify: false,
});
