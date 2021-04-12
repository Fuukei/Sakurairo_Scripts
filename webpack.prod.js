const { merge } = require('webpack-merge')
const common = require('./webpack.common.js')
const TerserPlugin = require('terser-webpack-plugin');
const CompressionPlugin = require("compression-webpack-plugin");

module.exports = merge(common, {
  mode: 'production',
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          // https://github.com/webpack-contrib/terser-webpack-plugin#terseroptions
          sourceMap: true,
          ecma:2016
        },
      })
    ]
  }, devtool: "source-map",
  output: {
    iife: true// 是否添加 IIFE 外层
  }, plugins: [new CompressionPlugin({
    test: /\.js(\?.*)?$/i,
    threshold: 8192,

  })],

})