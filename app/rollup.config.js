import typescript from '@rollup/plugin-typescript'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import nodeBuiltins from 'rollup-plugin-node-builtins'
import nodeGlobals from 'rollup-plugin-node-globals'

import copy from 'rollup-plugin-copy'

export default {
  input: './index.ts',
  plugins: [
    typescript(),
    nodeBuiltins(),
    nodeGlobals(),
    resolve(),
    commonjs(),
    copy({
      targets: [{ src: './index.rollup.html', dest: 'dist',
                  rename: 'index.html' }]
    })
  ],
  output: {
    file: 'dist/bundle.js',
    format: 'iife'
  }
}
