const merge = require("webpack-merge");
const webpackBaseConfig = require('./webpack.config.base');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = merge(webpackBaseConfig, {
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
            filename: './dist'
        }),
        //提取 css
        new MiniCssExtractPlugin({
            // 类似 webpackOptions.output里面的配置
            filename: "css/[name].[chunkhash:8].css",
            chunkFilename: "css/[id].css"
        })
    ]
});