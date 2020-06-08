import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

const config = {
  input: './index.ts',
  plugins: [
    typescript(),
    resolve(),
    commonjs(),
  ],
  output: []
};

if (process.env.TARGET === undefined || process.env.TARGET === 'web') {
  config.output.push({
    file: 'dist/web/bundle.js',
    format: 'iife'
  });
}
if (process.env.TARGET === undefined || process.env.TARGET === 'node') {
  config.output.push({
    file: 'dist/node/bundle.js',
    format: 'cjs'
  });
}

export default config;
