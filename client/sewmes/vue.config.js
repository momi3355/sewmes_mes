const { defineConfig } = require('@vue/cli-service');
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
      '^/production-plans':{ //정민 생산계획모달
        target,
        changeOrigin:true,
        ws:false,
      },
    }
  }
});
