export default {
  presets: [
    ['@babel/preset-env', {targets: {node: '14'}, modules: 'cjs'}],
    '@babel/preset-typescript',
  ],
  plugins: [['transform-import-extension', {js: 'cjs'}]],
}
