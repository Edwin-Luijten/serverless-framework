const path = require('node:path');
const slsw = require('serverless-webpack');
const isLocal = slsw.lib.webpack.isLocal;
const nodeExternals = require('webpack-node-externals');

module.exports = {
    mode: isLocal ? 'development' : 'production',
    devtool: isLocal ? 'source-map' : false,
    entry: slsw.lib.entries,
    target: 'node',
    resolve: {
        extensions: ['.mjs', '.ts', '.js', '.json'],
        symlinks: false,
        cacheWithContext: false,
    },
    output: {
        libraryTarget: 'commonjs',
        path: path.join(__dirname, '.webpack'),
        filename: '[name].js'
    },
    externals: [nodeExternals()],
    module: {
        rules: [
            {
                test: /\.ts$/,
                // exclude: /node_modules/,
                loader: 'ts-loader',
                options: {
                    transpileOnly: true,
                    experimentalWatchApi: true,
                },
            }
        ]
    }
};