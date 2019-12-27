const merge = require("webpack-merge");
const webpackBaseConfig = require('./webpack.config.base');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = merge(webpackBaseConfig, {
    mode: 'production',
    plugins: [
        // 清理 dist 目录
        new CleanWebpackPlugin({
            filename: './dist'
        })
    ]
});