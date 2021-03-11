const define = require('./define')
module.exports = {
    entry: {
        test: './src/test.ts',
    },
    output: {
        filename: '[name].bundle.js',
        path: define.dist_path,
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
                    presets: ['@babel/preset-env']
                  }
                }
              }
        ]
    },
    resolve: {
        extensions: ['.js', '.json', '.ts'] // 自动判断后缀名，引入时可以不带后缀
    },
    plugins: [],
    target:"web"
};