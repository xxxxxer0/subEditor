const webpack = require('webpack')
const path = require('path')
const readEntryFile = require('./webpack.common.js')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require("extract-text-webpack-plugin")
const CleanWebpackPlugin = require('clean-webpack-plugin')

/**
 * 默认入口是有vendor的 如果不需要可以去除
 */
var entry = {
    vendor: ['vue']
}
var plugins = [
    new webpack.HotModuleReplacementPlugin(),
    new CleanWebpackPlugin(['dist']),
    new webpack.optimize.CommonsChunkPlugin('vendor'),
    new webpack.ProvidePlugin({
        // $: "jquery",
        // jQuery: "jquery",
        // "window.jQuery": "jquery",
        _: "underscore"
    })
]

readEntryFile().forEach(function (file) {
    plugins.push(new HtmlWebpackPlugin({
        filename: file.name + '.html',
        template: file.htmlentry,
        inject: 'body',
        chunksSortMode: 'manual',
        chunks: ['vendor', file.name]
    }))

    entry[file.name] = file.jsentry
}, this);



module.exports = {
    entry: entry,
    output: {
        publicPath: "/",
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                use: [{
                    loader: "style-loader",
                }, {
                    loader: "css-loader",
                    options: {
                        sourceMap: true
                    }
                }]
            },
            {
                test: /\.scss$/,
                use: [{
                    loader: "style-loader",
                }, {
                    loader: "css-loader",
                    options: {
                        sourceMap: true
                    }
                }, {
                    loader: "postcss-loader",
                    options: {
                        ctx: {
                            autoprefixer: true
                        }, sourceMap: true
                    }
                }, {
                    loader: "sass-loader",
                    options: {
                        sourceMap: true
                    }
                }]
            },
            // {
            //     test: require.resolve('jquery'),
            //     use: [{
            //         loader: 'expose-loader',
            //         options: 'jQuery'
            //     }, {
            //         loader: 'expose-loader',
            //         options: '$'
            //     }]
            // },
            {
                test: /\.html$/,
                use: [{
                    loader: 'html-loader',
                    options: {
                        attrs: ['img:src', 'img:data-src'],
                        minimize: false
                    }
                }]
            },
            {
                test: /\.(gif|jpg|png|woff|svg|eot|ttf)\??.*$/,
                loader: 'file-loader',
                options: {
                    name: '[name]_[hash:6].[ext]',
                }
            },
            {
                test: /\.tmpl$/,
                use: 'ejs-loader'
            }
        ]
    },
    devtool: 'inline-source-map',
    devServer: {
        contentBase: './assets',
        host: '127.0.0.1',
        hot: true,
        port: 80,
        disableHostCheck: true
    },
    plugins: plugins,
    resolve: {
        alias: {
            'vue$': 'vue/dist/vue.esm.js',
            "jsonp": path.resolve(__dirname, './src/lib/jsonp.js')
        }
    }
}
