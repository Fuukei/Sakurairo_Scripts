const { merge } = require('webpack-merge')
const common = require('./webpack.common.js')
const define = require('./define')
module.exports = merge(common, {
  mode: 'development',
  
})