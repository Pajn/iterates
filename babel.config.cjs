module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {node: '14'},
        modules: process.env.NODE_ENV === 'test' ? 'cjs' : false,
      },
    ],
    '@babel/preset-typescript',
  ],
}
