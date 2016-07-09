import typescript from "rollup-plugin-typescript";
import buble from "rollup-plugin-buble";

export default {
  entry: 'src/index.ts',
  external: ["request"],
  plugins: [
    typescript({tsconfig: false}),
    buble()
  ],
  targets: [
    {dest: 'lib/mighty-http-layer.cjs.js', format: 'cjs', sourceMap: true},
    {dest: 'lib/mighty-http-layer.umd.js', format: 'umd', sourceMap: true, moduleName: "mighty-http-layer"},
    {dest: 'lib/mighty-http-layer.es6.js', format: 'es', sourceMap: true}
  ]
}
