const { merge } = require('webpack-merge')
const zlib = require('zlib')
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
          ecma:2015,
          module:true,
          toplevel:true
        },
      })
    ]
  },
 plugins: [new CompressionPlugin({
    test: /\.js(\?.*)?$/i,
    threshold: 8192,

  }),new CompressionPlugin({
    filename: "[path][base].br",
    test: /\.js(\?.*)?$/i,
    threshold: 8192,
    algorithm: "brotliCompress",
    compressionOptions: {
      params: {
        [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
      },
    },
  })],

})