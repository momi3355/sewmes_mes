const { defineConfig } = require('@vue/cli-service');
const webpack = require('webpack');
const target = 'http://localhost:3000';

module.exports = defineConfig({
  transpileDependencies: false,
  lintOnSave: false,
  devServer : {
    proxy : {
      '^/api' : {
        target,
        changeOrigin : true,
        ws : false,
        pathRewrite : { '^/api' :'/' }
      },
    }
  },
  configureWebpack: {
    plugins: [
      new webpack.DefinePlugin({
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: JSON.stringify(false),
      }),
    ],
  },
});
