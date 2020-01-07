const path = require('path');
const glob = require('glob');
const VueLoaderPlugin = require("vue-loader/lib/plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
// 在webpack.config.js 顶部引入 stylelint-webpack-plugin
const StyleLintPlugin = require("stylelint-webpack-plugin");
const SpritesmithPlugin = require("webpack-spritesmith");
const utils = require('./libs/utils');

/**
 * 多入口方案实现原理：
 * 1. 在src目录下，创建多个目录
 *      创建index.js: 入口文件
 *      创建index.html: 模版文件
 * 2. 获取src下所有的入口文件：通过glob库完成
 *      迭代入口文件做的事情：
 *      1. 获取所有的入口 index.js
 *      2. 获取所有的模版 index.html,并通过 htmlWebpackPlugin 处理，组成 htmlWebpackPlugins，最后拼接到plugins中
 */
const setMPA = () => {
    const entry = {};
    const htmlWebpackPlugins = [];
    // 在src下获取所有的入口文件
    const entryFiles = glob.sync(path.join(utils.getCommandPath(), 'src/*/index.js'));

    // 遍历所有的入口文件
    Object.keys(entryFiles).map((index) => {
        const entryFile = entryFiles[index];

        const match = entryFile.match(/src\/(.*)\/index\.js/);
        const pageName = match && match[1];

        // 获取所有的入口文件
        entry[pageName] = entryFile;
        // 获取每个入口文件对应的html模版
        htmlWebpackPlugins.push(
            new HtmlWebpackPlugin({
                template: path.join(utils.getCommandPath(), `src/${pageName}/index.html`),
                filename: `${pageName}.html`,   // 独立输出每个页面
                chunks: [pageName, 'vconsole'], // 每个页面注入的chunk, vconsole是手动注入的，确认下是否有自动注入的方法
                inject: true,
                minify: {   // 压缩html,css,js，移除注释，空格空行
                    html5: true,
                    collapseWhitespace: true,
                    preserveLineBreaks: false,
                    minifyCSS: true,
                    minifyJS: true,
                    removeComments: false
                }
            })
        );
    });

    return {
        entry,
        htmlWebpackPlugins
    };
};

const { entry, htmlWebpackPlugins } = setMPA();

module.exports = {
    /**
     * 功能：打包输入
     * 将所有代码，图片，字体资源都会被依赖，webpack将依赖加入到依赖关系图中，最后生成打包页面
     * 
     * 单入口：
     * entry: ''
     * 
     * 多入口
     * entry: {
     *      key: value 
     * }
     */
    // entry: utils.getCommandPath('src/index'),
    entry,
    /**
     * 功能：打包输出
     * filename: '[name].js'
     * 
     */
    output: {
        // 构建输出目录
        path: utils.getCommandPath('dist'),
        // 页面CDN地址
        // publicPath: '',
        filename: 'js/[name].js'
    },
    resolve: {
        // resolve.modules: 通知webpack解析模块时应该搜索的目录
        // 绝对路径：在给定目录中搜索，不会向上查找
        // 相对路径：类似于node_modules中的方式向上查找

        // 假如我们在 app.vue 中引用了一个模块，
        // Webpack 会从 app.vue 所在的 src 目录依次查找 
        // ./src/node_modules => ./node_modules => ./src/assets/generated => ./assets/generated
        modules: [
            utils.getCommandPath('node_modules'),
            "assets/generated"
        ]
    },
    devtool: 'source-map',
    // 避免构建出现 Entrypoint undefined = index.html（临时解决问题）
    stats: { children: false },
    devServer: {
        hot: true,
        contentBase: utils.getCommandPath('dist')
    },
    module: {
        /**
         * webpack默认支持JS和JSON两种文件类型，通过loaders支持其他文件类型，并且将它们转换为有效的模块，并且添加到依赖图中
         * 本身：函数
         * 接收：源文件
         * 返回：转换的结果
         * 
         * 多个loader的顺序：从右到左
         * 
         * babel-loader
         *      .babelrc: babel配置文件
         *      babel的两个重点：
         *          presets：很多plugins的集合 @babel/preset-env
         *          plugins：单个功能   @babel/proposal-class-properties
         * css-loader: 加载.css文件，并且转换为commonjs对象
         * style-loader: 将样式通过style标签插入到head中
         * sass-loader
         * file-loader
         * url-loader: 设置较小资源为base64(内部使用了file-loader)
         * ts-loader
         * file-loader
         * raw-loader
         * thread-loader: 多进程打包JS和CSS
         */
        /**
         * loader：让webpack处理非JavaScript文件
         * 1. 支持链式调用
         * 2. 支持同步/异步
         * 3. 运行在NodeJS中
         * 4. 接收查询参数
         * 5. loader也能够使用options进行配置
         * 6. 除了使用 package.json 常见的 main 属性，还可以将普通的 npm 模块导出为 loader，做法是在 package.json 里定义一个 loader 字段
         * 7. 插件(plugin)可以为 loader 带来更多特性。
         * 8. loader 能够产生额外的任意文件。
         */
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader'
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: "babel-loader"
            },
            {
                test: /\.(js|vue)$/,
                exclude: /node_modules/,
                enforce: "pre",
                options: {
                    formatter: require("eslint-friendly-formatter")
                },
                loader: "eslint-loader",
            },
            {
                test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                use: [
                    {
                        loader: "url-loader",
                        options: {
                            esModule: false,
                            limit: 8092,
                            name: "img/[hash:7].[ext]"
                        }
                    }
                ]
            },
            {
                test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
                use: [
                    {
                        loader: "url-loader",
                        options: {
                            esModule: false,
                            limit: 8092,
                            name: "media/[hash:7].[ext]"
                        }
                    }
                ]
            },
            {
                test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                use: [
                    {
                        loader: "url-loader",
                        options: {
                            esModule: false,
                            limit: 8092,
                            name: "font/[hash:7].[ext]"
                        }
                    }
                ]
            }
        ]
    },
    /**
     * 打包优化，压缩，替换环境变量
     * 解决loader无法解决的事情
     * 
     * new HtmlWebpackPlugin({template: './src/index.html'})
     */
    /**
     * 功能：用于bundle文件的优化，资源管理和环境变量注入
     * 任何loader无法完成的事情，都需要plugin来做
     * 作用域整个构建过程
     * 
     * CommonChunkPlugin: 将chunks相同的模块代码提取成公共js
     * CleanWebpackPlugin：清理构建目录,避免每次构建前手动删除dist，避免dist文件越堆越多（prod和dev都需要该插件）
     * ExtractTextWebpackPlugin：将CSS从bundle文件里提取成一个独立的CSS文件
     * CopyWebpackPlugin：将文件或者文件夹拷贝到构建的输出目录
     * ZipWebpackPlugin：将打包的资源生成zip包
     * HotModuleReplacementPlugin: 热更新替换浏览器内容
     * 
     * uglifyjsWebpackPlugin：压缩JS
     * MiniCssExtractPlugin: 拆分CSS为独立的文件
     * OptimizeCSSAssetsPlugin：压缩CSS
     * HtmlWebpackPlugin：压缩html，创建html文件承载输出的bundle
     * 
     */
    plugins: [
        new VueLoaderPlugin(),
        // new HtmlWebpackPlugin({
        //     // template: "./public/index.html",
        //     template: utils.getCommandPath('public/index.html'),
        //     title: "Hello Webpack"
        // }),
        new StyleLintPlugin({
            files: ["src/**/*.{vue,css,scss,sass}"]
        }),
        new SpritesmithPlugin({
            // 指定那些图片需要合并成雪碧图
            src: {
                // 原始图片所在目录
                cwd: path.resolve(__dirname, '..', "src/assets/sprites"),
                // glob：匹配规则，符合匹配规则的图片才需要合并
                glob: "*.png"
            },
            // 合成图片输出位置
            target: {
                // 输出位置
                image: path.resolve(__dirname, '..', "src/assets/generated/sprite.png"),
                // 输出的css文件存放位置
                css: path.resolve(__dirname, '..', "src/assets/generated/sprite.scss")
            },
            apiOptions: {
                // css文件使用该路径作为背景图
                // ~ 是 Webpack 中约定俗成的一个符号，表示从 resolve.modules 中指定的路径。假如在 app.vue 中 import img from '~sprite.png', 那么最终经过上面讲述的查找过程后，实际的路径是 ./src/assets/generated/sprite.png。因此 ~ 与 resolve.modules 的配置有直接的关系
                cssImageRef: "~sprite.png"
            }
        })
    ].concat(htmlWebpackPlugins)
};

/**
 * 1. Tree-shaking（摇树优化）
 *      概念：1 个模块可能有多个⽅方法，只要其中的某个⽅方法使⽤用到了了，则整个⽂文件都会被打到 bundle ⾥里里⾯面去，tree shaking 就是只把⽤用到的⽅方法打⼊入 bundle ，没⽤用到的⽅方法会在 uglify 阶段被擦除掉。
 *      使用：webpack 默认⽀支持，
 *              在 .babelrc ⾥里里设置 modules: false 即可
 *              production mode的情况下默认开启
 *      要求:必须是 ES6 的语法，CJS 的⽅方式不不⽀支持
 *      代码不能有副作用，否则tree-shaking失效
 *
 * DCE (Dead code elimination)
代码不不会被执⾏行行，不不可到达
代码执⾏行行的结果不不会被⽤用到
代码只会影响死变量量(只写不不读)

利利⽤用 ES6 模块的特点: ·只能作为模块顶层的语句句出现
· import 的模块名只能是字符串串常量量
· import binding 是 immutable的 代码擦除: uglify 阶段删除⽆无⽤用代码
 */