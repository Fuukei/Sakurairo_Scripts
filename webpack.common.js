const define = require('./define')
const webpack = require('webpack')
const {commitHash} = require('./commit_hash')
module.exports = {
    entry: {
        app: './src/sakura-app/',
        login: "./src/login.js",
        page: {import:"./src/page/",dependOn:'app'}
        /* lazyload:"lazyload",
        smoothscroll:"smoothscroll-for-websites" */
        //"customizer":"./src/entries/customizer.js"
    },
    output: {
        filename: '[name].js',
        path: define.dist_path, iife: true// 是否添加 IIFE 外层
    },
    optimization: {
        /* runtimeChunk: {
            name: 'runtime',
        }, */
        splitChunks: {
            chunks: 'async',
            minSize: 40000,
            minRemainingSize: 0,
            minChunks: 1,
            maxAsyncRequests: 30,
            maxInitialRequests: 30,
            //enforceSizeThreshold: 50000,
            maxSize: 244000,
            cacheGroups: {
                defaultVendors: {
                    test: /[\\/]node_modules[\\/]/,
                    priority: -10,
                    reuseExistingChunk: true,
                    minChunks: 2,
                    chunks: "all"
                },
                default: {
                    priority: -20,
                    reuseExistingChunk: true,
                },
            },
        },
    },
    module: {
        rules: [
            { test: /\.ts$/, use: 'ts-loader' },
            {
                test: /\.m?js$/,
                exclude: /(node_modules)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                        cacheDirectory: true,
                        cacheCompression: false
                    }
                }
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.json', '.ts'] // 自动判断后缀名，引入时可以不带后缀
    },
    plugins: [new webpack.BannerPlugin({
        raw:true,
        entryOnly:true,
        banner:`//! build ${commitHash} ${new Date().toLocaleDateString()}`
    })],
    target: "web", devtool: "source-map",
};