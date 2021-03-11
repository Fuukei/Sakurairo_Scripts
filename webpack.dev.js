const { merge } = require('webpack-merge')
const common = require('./webpack.common.js')
const define = require('./define')
module.exports = merge(common, {
  mode: 'development',
  devServer: {
    contentBase: define.dist_path,
    compress: true,
    port: 9000,
  },
})