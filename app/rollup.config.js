import typescript from 'rollup-plugin-typescript'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import copy from 'rollup-plugin-copy'

export default {
  input: './index.ts',
  plugins: [
    typescript(),
    commonjs(),
    resolve(),
    copy({
      targets: [{ src: './index.rollup.html', dest: 'dist',
                  rename: 'index.html' }]
    })
  ],
  output: {
    file: 'dist/bundle.js',
    format: 'esm'
  }
}
