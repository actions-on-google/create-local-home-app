import typescript from '@rollup/plugin-typescript'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import nodeBuiltins from 'rollup-plugin-node-builtins'
import nodeGlobals from 'rollup-plugin-node-globals'

export default {
  input: './index.ts',
  plugins: [
    typescript(),
    nodeBuiltins(),
    nodeGlobals(),
    resolve(),
    commonjs()
  ],
  output: {
    file: 'dist/web/bundle.js',
    format: 'iife'
  }
}
