const define = require('./define')
const webpack = require('webpack')
const { commitHash } = require('./commit_hash')
const { VueLoaderPlugin } = require('vue-loader')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const package_info = require('./package_info')

const javascript_loader = {
    loader: 'babel-loader',
    options: {
        presets: [
            ['@babel/preset-env',
                {
                    useBuiltIns: 'usage',
                    corejs: '3.20',
                    debug: true
                }
            ]],
        cacheDirectory: true,
        cacheCompression: false,
        assumptions: {
            //https://babeljs.io/docs/en/assumptions
            noDocumentAll: true,
            noClassCalls: true,
            noIncompleteNsImportDetection: true
        }
    }
}
module.exports = {
    entry: {
        app: './src/app/',
        page: { import: "./src/page/", dependOn: 'app' },
        anf: './src/404.ts',
        'page-photo': './src/page-photo'
        /* lazyload:"lazyload",
        smoothscroll:"smoothscroll-for-websites" */
        //"customizer":"./src/entries/customizer.js"
    },
    output: {
        filename: '[name].js',
        assetModuleFilename: '[hash][ext][query]',
        path: define.dist_path,
        iife: true// 是否添加 IIFE 外层
    },
    optimization: {
        /* runtimeChunk: {
            name: 'runtime',
        }, */
        splitChunks: {
            chunks: 'async',
            minSize: 40000,
            maxSize: 244000,
            minRemainingSize: 0,
            minChunks: 1,
            maxAsyncRequests: 30,
            maxInitialRequests: 30,
            //enforceSizeThreshold: 50000,
            cacheGroups: {
                polyfills: {
                    test: /[\\/]node_modules[\\/](@babel|core-js|regenerator-runtime)[\\/]/,
                    name: 'polyfills',
                    chunks: 'initial',
                    priority: 60,
                    enforce: true,
                    reuseExistingChunk: true
                },
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
            {
                test: /\.ts$/, use: [
                    javascript_loader,
                    {
                        loader: 'ts-loader',
                        options: {
                            allowTsInNodeModules: true
                        }
                    }]
            },
            {
                test: /\.m?js$/,
                exclude: /node_modules/,
                use: javascript_loader
            }, {
                test: /\.vue$/,
                use: [
                    'vue-loader'
                ]
            }, {
                test: /\.css$/i,
                use: [{ loader: MiniCssExtractPlugin.loader }, "css-loader", 'postcss-loader'],
            },
        ]
    },
    resolve: {
        extensions: ['.js', '.json', '.ts'], // 自动判断后缀名，引入时可以不带后缀
        fallback: {
            buffer: require.resolve('buffer'),
        },
    },
    plugins: [
        new VueLoaderPlugin(),
        new MiniCssExtractPlugin(),
        new webpack.BannerPlugin({
            raw: true,
            entryOnly: true,
            banner: `/*! build ${commitHash} ${new Date().toLocaleDateString()}*/`,
            include: 'app'
        }),
        new webpack.DefinePlugin({
            BUILD_INFO: JSON.stringify({
                hash: commitHash,
                date: new Date().toLocaleDateString()
            }),
            PKG_INFO: JSON.stringify(package_info)
        })
        /* new webpack.DefinePlugin({
            'typeof document': JSON.stringify('object'),
            'typeof window': JSON.stringify('object'),
            DEBUG: undefined
        }) */
    ],
    target: "browserslist",
    devtool: "source-map",
};