
const path = require('path');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const Webpack = require('webpack');

module.exports = {
    entry: './src/swiper.ts',
    output: {
        filename: 'swiper.js',
        path: path.resolve(__dirname, 'dist'),
        libraryTarget: 'umd'
    },

    resolve: {
        extensions: ['.webpack.js', '.web.js', '.ts', '.js', '.css']
    },

    module: {
        loaders: [
            {
                test: /\.ts$/,
                loader: 'ts-loader'
            }, {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use: "css-loader"
                })
            }
        ]
    },
    plugins: [
        new ExtractTextPlugin("swiper.css"),
        new Webpack.optimize.UglifyJsPlugin()
    ]
}
