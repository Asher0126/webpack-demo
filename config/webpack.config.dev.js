const merge = require("webpack-merge");
const webpackBaseConfig = require('./webpack.config.base');

module.exports = merge(webpackBaseConfig, {
    mode: 'development',
    /*
    // none: 不生成source-map（生产环境）
    // source-map: 映射到原始源代码，source-map 作为单独的文件保存。
    // inline-source-map：映射到原始源代码，source map 转换为 DataUrl 后添加到 bundle 中，会导致文件大小剧增
    // eval：映射到转换后的代码，而不是源代码，行数映射不正确。
    // eval-source-map：映射到原始源代码，只映射到行。（开发环境）
    */
    devtool: 'eval-source-map',
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: [
                    "style-loader",
                    "css-loader",
                    {
                        loader: "postcss-loader",
                        options: {
                            plugins: [require("postcss-preset-env")()]
                        }
                    },
                    "sass-loader"
                ]
            },
        ]
    }
});