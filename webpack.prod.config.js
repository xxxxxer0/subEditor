const webpack = require('webpack')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin') //html插件
const ExtractTextPlugin = require("extract-text-webpack-plugin")//文本插件
const readEntryFile = require('./webpack.common.js')
const autoprefixer = require('autoprefixer')
const postcssSprites = require('postcss-sprites')
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')

const svnpath = './dist'//支持相对和绝对地址
const version = ''
const filepath = ''
const staticPath = /:\/\//.test(svnpath) ? path.join(svnpath, filepath, version) : path.join(__dirname, svnpath, filepath, version)//根据相对还是绝对地址拼接成绝对地址
const cdn = ['./', filepath, version].join('')
/**
 * 默认入口是有vendor的 如果不需要可以去除
 */
var entry = {
    vendor: [ 'vue']
}
var plugins = [
    new webpack.optimize.CommonsChunkPlugin('vendor'),
    new webpack.optimize.UglifyJsPlugin(),
    new webpack.ProvidePlugin({
        // $: "jquery",
        // jQuery: "jquery",
        // "window.jQuery": "jquery"
        // _: "underscore"
    }),
    new webpack.DefinePlugin({
        'process.env': {
            'NODE_ENV': JSON.stringify('production')
        }
    }),
    new ExtractTextPlugin({
        filename: "./css/global_[contenthash:6].css"
    }),
]

readEntryFile().forEach(function (file) {
    plugins.push(new HtmlWebpackPlugin({
        filename: file.name + '.html',
        template: file.htmlentry,
        inject: 'body',
        chunksSortMode: 'manual',
        chunks: ['vendor', file.name],
    }))

    entry[file.name] = file.jsentry
}, this);

module.exports = {
    entry: entry,
    output: {
        publicPath: cdn,
        filename: './js/[name]_[chunkhash:6].js',
        path: path.resolve(staticPath, '')
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: [{
                    loader: 'babel-loader'
                }],
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use: "css-loader",
                    publicPath: path.resolve(cdn, './css')
                })
            },
            {
                test: /\.scss$/, use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    publicPath: path.resolve(cdn, './css'),
                    use: [{
                        loader: "css-loader",
                    }, {
                        loader: "postcss-loader",
                        options: {
                            ident: 'postcss',
                            plugins: () => [
                                autoprefixer({
                                    browsers: ['last 2 versions', 'Firefox ESR', '> 1%', 'ie >= 8', 'iOS >= 8', 'Android >= 4'],
                                }),
                                postcssSprites({
                                    stylesheetPath: './src/img',
                                    spritePath: path.resolve(staticPath, './img/sprite'),
                                    filterBy: [
                                        function (image) {
                                            if (image.originalUrl.indexOf('?__sprite') === -1) {
                                                return Promise.reject()
                                            }
                                            return Promise.resolve()
                                        }
                                    ]
                                })
                            ],
                        },
                    }, {
                        loader: "sass-loader"
                    }]
                })
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
                    publicPath: './img/',
                    outputPath: './img/',
                    name(file) {
                        if (file.indexOf('sprite') === -1)
                            return '[name]_[hash:6].[ext]'
                        else
                            return 'sprite/[name]_[hash:6].[ext]'
                    },
                }
            },
            {
                test: /\.tmpl$/,
                use: 'raw-loader'
            }
        ]
    },
    // devtool: 'source-map',
    plugins: plugins,
    resolve: {
        alias: {
            'vue$': 'vue/dist/vue.esm.js',
            "jsonp": path.resolve(__dirname, './src/lib/jsonp.js')
        }
    }
}