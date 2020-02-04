import typescript from '@rollup/plugin-typescript'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'

export default {
  input: './index.ts',
  plugins: [
    typescript(),
    resolve(),
    commonjs(),
  ],
  output: {
    file: 'dist/node/bundle.js',
    format: 'cjs'
  }
}
