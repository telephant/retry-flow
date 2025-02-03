import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import dts from "rollup-plugin-dts";
import {readFileSync} from 'fs';

const pkg = JSON.parse(readFileSync('package.json', {encoding: 'utf8'}));

export default [
  {
    input: pkg.source,
    file: pkg.typings,
    external: [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {}),
    ],
    output: [
      {
        dir: './dist',
        format: 'esm',
        sourcemap: false,
        exports: 'named',
      },
    ],
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        tsconfig: "./tsconfig.json",
        declaration: false,
      }),
      terser()
    ],
  },
  {
    input: pkg.source,
    output: {
      file: pkg.types,
      format: "esm"
    },
    plugins: [
      dts({
        tsconfig: './tsconfig.json'
      }),
    ],
    watch: {
      include: 'src/**'
    }
  },
];
