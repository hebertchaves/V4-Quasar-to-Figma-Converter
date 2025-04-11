import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/code.ts',
  output: {
    file: 'dist/code.js',
    format: 'iife',
    sourcemap: process.env.NODE_ENV !== 'production',
    globals: {
      'node-html-parser': 'nodeHtmlParser'
    }
  },
  external: ['node-html-parser'],
  plugins: [
    resolve({
      browser: true,
      preferBuiltins: false
    }),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json',
      sourceMap: process.env.NODE_ENV !== 'production'
    }),
    process.env.NODE_ENV === 'production' && terser()
  ]
}