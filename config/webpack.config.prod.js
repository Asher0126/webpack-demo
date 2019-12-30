const merge = require("webpack-merge");
const webpackBaseConfig = require('./webpack.config.base');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const utils = require('./libs/utils');

module.exports = merge(webpackBaseConfig, {
    /**
     * 当前打包的构建环境
     * production：
     *      FlagDependencyUsagePlugin, 
     *      FlagIncludedChunksPlugin, 
     *      ModuleConcatenationPlugin,  
     *             减少大量的闭包，scope hoisting
     *             必须是es6语法
     *          手动引入
     *              const webpack = require('webpack');
     *              new webpack.ModuleConcatenationPlugin()
     *      NoEmitOnErrorsPlugin, 
     *      OccurrenceOrderPlugin, 
     *      SideEffectsFlagPlugin
     *      UglifyJsPlugin
     * development：默认开启 NamedChunksPlugin nameModulesPlugin
     *      在HMR阶段，控制台打印模块发生了热更新，展示模块路径
     * none
     */
    mode: 'production',
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    "sass-loader",
                    {
                        loader: "postcss-loader",
                        options: {
                            plugins: [require("postcss-preset-env")()]
                        }
                    }
                ]
            }
        ]
    },
    plugins: [
        // 清理 dist 目录
        new CleanWebpackPlugin({
            // filename: './dist'
            filename: utils.getCommandPath('dist')
        }),
        //提取 css
        new MiniCssExtractPlugin({
            // 类似 webpackOptions.output里面的配置
            filename: "css/[name].[chunkhash:8].css",
            chunkFilename: "css/[id].css"
        })
    ]
});