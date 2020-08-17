module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  extends: [
    'plugin:vue/essential',
    '@vue/airbnb',
  ],
  globals: {
    '@': false,
  },
  parserOptions: {
    parser: 'babel-eslint',
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'max-len': 0,
    'linebreak-style': 0, // 不校验换行符
    semi: ['error', 'never'], // 不使用分号
    'no-new': 0,
    'no-underscore-dangle': 0,
    'prefer-promise-reject-errors': 0,
    'no-param-reassign': 0,
    'no-extend-native': 0,
    'no-restricted-syntax': 0,
    'import/prefer-default-export': 0, // 禁用强制使用默认导出
    'import/no-extraneous-dependencies': ['error', { devDependencies: true }], // 禁止引入未添加到依赖中的库
    'no-unused-expressions': ['error', { allowShortCircuit: true }],
  },
}
