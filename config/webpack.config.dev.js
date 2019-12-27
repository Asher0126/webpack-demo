const merge = require("webpack-merge");
const webpackBaseConfig = require('./webpack.config.base');

module.exports = merge(webpackBaseConfig, {
    mode: 'development',
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