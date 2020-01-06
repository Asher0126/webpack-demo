const path = require("path");
const webpack = require("webpack");
const merge = require("webpack-merge");
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const ModernBuildPlugin = require('./plugins/modernBuildPlugin');
const webpackBaseConfig = require('./webpack.config.base');
const parseArgs = require("minimist");  // 这个是内置，还是外联？
const utils = require('./libs/utils');
const argv = parseArgs(process.argv.slice(2));
console.log("TCL: argv", argv);
const { modern } = argv;

const baseConf = {
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
        // new CleanWebpackPlugin({
        //     // filename: './dist'
        //     filename: utils.getCommandPath('dist')
        // }),
        //提取 css
        new MiniCssExtractPlugin({
            // 类似 webpackOptions.output里面的配置
            filename: "css/[name].[chunkhash:8].css",
            chunkFilename: "css/[id].css"
        })
    ]
};

// 配置babel-loader
const configureBabelLoader = browserlist => {
    if (!modern) {
        return {
            test: /\.js$/,
            exclude: /node_modules/,
            loader: "babel-loader"
        };
    }
    return {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
            loader: "babel-loader",
            options: {
                babelrc: false,
                presets: [
                    [
                        "@babel/preset-env",
                        {
                            modules: false,
                            corejs: "2",
                            useBuiltIns: "usage",
                            targets: {
                                browsers: browserlist
                            }
                        }
                    ]
                ]
            }
        }
    };
};
// 现代浏览器的配置文件
const modernConf = merge(webpackBaseConfig, baseConf, {
    output: {
        filename: "modern-[name].js",
        path: path.resolve(__dirname, "../dist")
    },
    plugins: [new ModernBuildPlugin({ modern })],
    module: {
        rules: [
            configureBabelLoader([
                "last 2 Chrome versions",
                "not Chrome < 60",
                "last 2 Safari versions",
                "not Safari < 10.1",
                "last 2 iOS versions",
                "not iOS < 10.3",
                "last 2 Firefox versions",
                "not Firefox < 54",
                "last 2 Edge versions",
                "not Edge < 15"
            ])
        ]
    }
});
// console.log("TCL: modernConf", modernConf); return;

// 旧浏览器的配置文件
const legacyConf = merge(webpackBaseConfig, baseConf, {
    output: {
        filename: "legacy-[name].js",
        path: path.resolve(__dirname, "../dist")
    },
    plugins: [
        new ModernBuildPlugin({ modern: false }),
        new CleanWebpackPlugin()
    ],
    module: {
        rules: [configureBabelLoader([
            "> 1%",
            "last 2 versions",
            "Firefox ESR"
        ])]
    }
});

// 不区分浏览器的配置文件
const commonConf = merge(webpackBaseConfig, baseConf, {
    module: {
        rules: [configureBabelLoader()]
    },
    plugins: [new CleanWebpackPlugin()]
});

// 调用webpack编译代码
const createCompiler = (config, env) => {
    console.log("TCL: env", env);
    let compiler = webpack(config);
    return () => {
        return new Promise((resolve, reject) => {
            compiler.run((err, stats) => {
                // console.log("TCL: createCompiler -> err, stats", err, stats)
                if (err) return reject(err);
                console.log(stats.toString({ colors: true }) + "\n");
                resolve();
            });
        });
    };
};

const build = async () => {
    if (!modern) {
        console.log('!modern');
        await createCompiler(commonConf)();
    } else {
        console.log('modern');
        try {
            await createCompiler(legacyConf, 'legacy')();
            await createCompiler(modernConf, 'modern')();
        } catch (e) {
            console.log(e);
        }
    }
};

build()

