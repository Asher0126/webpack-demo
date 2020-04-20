const merge = require("webpack-merge");
const webpackBaseConfig = require('./webpack.config.base');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const DebugPlugin = require("./plugins/DebugPlugin");
const utils = require('./libs/utils');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

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

        ]
    },
    plugins: [
        // 清理 dist 目录
        new CleanWebpackPlugin({
            // filename: './dist'
            filename: utils.getCommandPath('dist')
        }),

        new DebugPlugin({ enable: true }),

        new BundleAnalyzerPlugin()

    ],
    optimization: {
        /**
         * webpack v4中，使用 optimization.SplitChunksPlugin 替代了 CommonsChunkPlugin
         * webpack默认配置
         * 1. chunk或者来自node_modules的模块可以被共享
         * 2. 在被压缩，gz之前，chunk超过30kb
         * 3. 加载chunk最大请求 <= 6
         * 4. 首评加载的最大请求数 <= 4
         * 
         * 每个参数含义：
         * automaticNameDelimiter: 自定义的name和chunk之间的连接符号（默认是~）
         * automaticNameMaxLength: chunk的name字符串的最大长度（默认是109）
         * chunks：function(chunk)｜string
         *     all：chunks可以在同步和异步chunk中共享
         *     async：只能异步
         *     initial：
         * maxAsyncRequests：按需加载的时候的同时最大请求数
         * minChunks：拆分前最小的分享数
         * minSize：单位字节，生成chunk的最小值
         * minRemainingSize：webpack v5预留
         * maxAsyncSize：
         * maxInitialSize：
         * name
         * automaticNamePrefix
         * cacheGroups
         *      priority：
         *      reuseExistingChunk
         *      type
         *      test
         *      filename
         *      enforce
         *      idHint
         */
        splitChunks: {
            cacheGroups: {
                commons: {
                    chunks: "initial",
                    minChunks: 2,
                    name: "commons",
                    maxInitialRequests: 5,
                    minSize: 0, // 默认是30kb，minSize设置为0之后
                    // 多次引用的utility1.js和utility2.js会被压缩到commons中
                },
                swiper: {
                    test: /swiper/,
                    name: 'swiper',
                    chunks: 'all'
                },
                moment: {
                    test: /moment/,
                    name: 'moment',
                    chunks: 'all'
                },
                quill: {
                    test: /quill/,
                    name: 'quill',
                    chunks: 'all'
                }
            }
        }
    }
});
