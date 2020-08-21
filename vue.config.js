const path = require('path')
const CKEditorWebpackPlugin = require('@ckeditor/ckeditor5-dev-webpack-plugin')
const { styles } = require('@ckeditor/ckeditor5-dev-utils')

module.exports = {
  lintOnSave: true,
  css: {
    loaderOptions: {
      less: {
        lessOptions: {
          prependData: '@import "~@/style/common.less;"',
          modifyVars: {
            'primary-color': '#5E93FC', // 全局主色
            'link-color': '#5E93FC', // 链接色
            'btn-border-radius-base': '20px', // 按钮圆角
          },
          javascriptEnabled: true,
        },
      },
    },
  },
  transpileDependencies: [
    /ckeditor5-[^/\\]+[/\\]src[/\\].+\.js$/,
  ],
  configureWebpack: {
    plugins: [
      // CKEditor needs its own plugin to be built using webpack.
      new CKEditorWebpackPlugin({
        // See https://ckeditor.com/docs/ckeditor5/latest/features/ui-language.html
        language: 'zh-cn',
        // Append translations to the file matching the `app` name.
        translationsOutputFile: /app/,
      }),
    ],
  },

  chainWebpack: (config) => {
    const svgRule = config.module.rule('svg')
    svgRule.exclude.add(path.join(__dirname, 'node_modules', '@ckeditor'))
    config.module
      .rule('cke-svg')
      .test(/ckeditor5-[^/\\]+[/\\]theme[/\\]icons[/\\][^/\\]+\.svg$/)
      .use('raw-loader')
      .loader('raw-loader')
    config.module
      .rule('cke-css')
      .test(/ckeditor5-[^/\\]+[/\\].+\.css$/)
      .use('postcss-loader')
      .loader('postcss-loader')
      .tap(() => styles.getPostCssConfig({
        themeImporter: {
          themePath: require.resolve('@ckeditor/ckeditor5-theme-lark'),
        },
        minify: true,
      }))
    config.devServer.proxy({
      '/api': {
        target: 'https://test.gszuoye.com',
        changeOrigin: true,
        pathRewrite: {
          '/api': '/',
        },
      },
      '/self': {
        target: 'http://182.92.99.240:8081',
        changeOrigin: true,
        pathRewrite: {
          '/self': '/',
        },
      },
    })
  },
}
