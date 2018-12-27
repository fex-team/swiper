
const path = require('path');

module.exports = {
    entry: './src/swiper.ts',
    output: {
        filename: 'swiper.umd.js',
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
                loader: 'style-loader!css-loader'
            }
        ]
    }
}
