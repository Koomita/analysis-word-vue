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

  chainWebpack: (config) => {
    config.devServer.proxy({
      '/api': {
        target: 'https://test.gszuoye.com',
        changeOrigin: true,
        pathRewrite: {
          '/api': '/',
        },
      },
      '/self': {
        target: 'http://182.92.99.240:9999',
        changeOrigin: true,
        pathRewrite: {
          '/self': '/',
        },
      },
    })
  },
}
