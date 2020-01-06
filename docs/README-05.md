# Webpack根据浏览器构建

## 根据浏览器构建

### 背景

在 Babel 等转译工具的帮助下，我们可以在项目中使用所有的 ES6+ 的语言特性，但是我们最终交付的代码仍旧需要转译成 ES5 代码以兼容旧浏览器。现在所有的现代浏览器都已经很好地支持了 ES6+ 的语言特性，为了那很小的一部分旧浏览器，我们却不得不强迫所有的现代浏览器运行转译后的冗长、执行效率低下的 ES5 代码。为了更好的用户体验，作为开发者我们有责任去解决这个问题。

### 1 特性检查

对于 JS 和 DOM 新的 API，我们在不确定浏览器是否支持的情况下，最常采取的方式是在代码运行的时候进行特性检查。例如：

```
if(browserSupportsNewFeature){
  // 使用新特性
} else {
  // 使用替代方式或者引入Pollyfill
}
```

这种特性检测方式对于检测 JS 或 DOM 的新 API 比较有效，但是 JS 中的新语法的检查就很棘手了。JS 的解析器一旦不能识别某个语法，将直接抛出语法错误，所有的代码将没法儿执行。例如 let 声明，箭头函数。

虽然目前没有特别好的针对新语法的特性检查方式，不过目前有一种方式可以检查浏览器支持的 ES6 的语法。具体的的方式是：

```
<script type="module">
```

大多数同学可能知道 `` 可以用来加载 ES6 的模块。其实除了这个功能之外，它还有更大的用途。那就是所有支持``的浏览器同样支持绝大数 ES6+ 的特性。例如：

- 所有支持 `` 的浏览器也支持 `async/await`。

- 所有支持 `` 的浏览器也支持 `Class`。

- 所有支持 `` 的浏览器也支持箭头函数。

- 所有支持 `` 的浏览器也支持 `fetch`、`Promise`、`Map`、`set` 等。

  ...

通过 `` 我们解决了现代浏览器加载 ES6+ 代码的问题，剩下需要解决的是针对不支持 `` 的浏览器，提供一个降级方案。对于不支持的 `` 的浏览器我们运行 ES5 版本的代码，同样我们使用 `` 来加载。这样我们就做到了现代浏览器加载 ES6+版本的代码，旧浏览器加载 ES5 版本的代码。

接下来看一下如何将该技术应用到我们的项目模板中。

### 2 动态生成配置文件

在之前的教程中，所用到的功能不需要动态改变 Webpack 配置文件，所以整个构建过程比较简单，只需要在根目录下的 webpack.config.js 上进行添加或者修改即可。

根据不同的浏览器生成不同的 JS 文件，我们需要针对不同的构建目标提供不同的 Webpack 配置文件，所以我们本节开始对 Webpack 的配置方式和构建命令进行一个较大的调整。

#### 2.1 webpack.config.base.js

在根目录下创建 build 目录，存放和构建相关的文件。并创建 webpack.config.base.js：

```
const path = require("path");
const VueLoaderPlugin = require("vue-loader/lib/plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const StyleLintPlugin = require("stylelint-webpack-plugin");
const SpritesmithPlugin = require("webpack-spritesmith");

// 雪碧图模板函数
const templateFunction = require("./spriteFuncTemplate");

module.exports = {
  entry: { app: path.resolve(__dirname, "../src/app.js") },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "../dist")
  },
  mode: "development",
  devtool: "eval-source-map",
  devServer: {
    proxy: {
     "/api": "http://localhost:8081"
    },
    contentBase: path.resolve(__dirname, "../dist"),
    hot: true,
    compress: true,
    overlay: true,
    open: true,
    port: 3000
  },
  resolve: {
    modules: ["../node_modules", "../src/assets/generated"]
  },
  module: {
    rules: [
      {
        test: /\.(js|vue)$/,
        exclude: /node_modules/,
        loader: "eslint-loader",
        enforce: "pre",
        options: {
          formatter: require("eslint-friendly-formatter")
        }
      },
      {
        test: /\.vue$/,
        exclude: /node_modules/,
        loader: "vue-loader"
      },
      {
        test: /\.scss$/,
        use: ["style-loader", "css-loader", "postcss-loader", "sass-loader"]
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        use: [
          {
            loader: "url-loader",
            options: {
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
              limit: 8092,
              name: "font/[hash:7].[ext]"
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin(),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "../public/index.html"),
      title: "项目模板"
    }),
    new StyleLintPlugin({
      files: ["src/**/*.{vue, css, sass, scss}", "!src/assets/generated/"]
    }),
    new SpritesmithPlugin({
      src: {
        cwd: path.resolve(__dirname, "../src/assets/sprites"),
        glob: "*.png"
      },
      customTemplates: {
        function_based_template: templateFunction
      },
      target: {
        image: path.resolve(__dirname, "../src/assets/generated/sprite.png"),
        css: [
          [
            path.resolve(__dirname, "../src/assets/generated/sprite2.scss"),
            {
              format: "function_based_template"
            }
          ],
          path.resolve(__dirname, "../src/assets/generated/sprite.scss")
        ]
      },
      apiOptions: {
        cssImageRef: "~sprite.png"
      }
    })
  ]
};
```

webpack.config.base.js 是一个基础通用的配置文件，是我们在 webpack.config.js 的基础上修改而成。该文件主要做了以下两个改动：

- 在 module.rules 中去掉了 babel-loader 的配置。因为我们会在后面动态添加。
- 由于配置文件所在的目录变成了 /build，因此配置文件中的一些路径做了调整。比如`output.path` 变成了 `path.resolve(__dirname, "../dist")`。

#### 2.2 build.js

我们在 build.js 中来实现我们的构建逻辑，其代码如下：

```
const path = require("path");
const parseArgs = require("minimist");
const webpack = require("webpack");
const ModernBuildPlugin = require("./modernBuildPlugin");
const baseConf = require("./webpack.config.base");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const merge = require("webpack-merge");
const argv = parseArgs(process.argv.slice(2));
const { modern } = argv;

// 配置babelloader
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
const modernConf = merge(baseConf, {
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

// 旧浏览器的配置文件
const legacyConf = merge(baseConf, {
  output: {
    filename: "legacy-[name].js",
    path: path.resolve(__dirname, "../dist")
  },
  plugins: [
    new ModernBuildPlugin({ isModernBuild: false }),
    new CleanWebpackPlugin()
  ],
  module: {
    rules: [configureBabelLoader(["> 1%", "last 2 versions", "Firefox ESR"])]
  }
});

// 不区分浏览器的配置文件
const commonConf = merge(baseConf, {
  module: {
    rules: [configureBabelLoader()]
  },
  plugins: [new CleanWebpackPlugin()]
});

// 调用webpack编译代码
const createCompiler = config => {
  let compiler = webpack(config);
  return () => {
    return new Promise((resolve, reject) => {
      compiler.run((err, stats) => {
        if (err) return reject(err);
        console.log(stats.toString({ colors: true }) + "\n");
        resolve();
      });
    });
  };
};

const build = async () => {
  if (!modern) {
    await createCompiler(commonConf)();
  } else {
    await createCompiler(legacyConf)();
    await createCompiler(modernConf)();
  }
};

build()
```

build 方法是整个构建的入口。当用户选择普通构建方式时，执行 createCompiler(commonConf)()，当用户选择 modern 模式构建时，则走 modern 构建，先后执行 createCompiler(legacyConf)()和 createCompiler(modernConf)()。

createCompiler 是一个高阶函数，接收一个 Webpack 配置文件作为参数，根据接收的配置文件返回不同的编译函数。执行编译函数可以得到不同的构建后文件。

我们用到了三个配置文件来表示不同的编译目标。默认的配置文件 `commonConf`。针对现代浏览器的配置文件 `modernConf`，针对旧浏览器的配置文件 `legacyConf`。配置文件是在 baseConf 的基础上生成的。比如 legacyConf 中，我们需要给输出的 JS 文件名前都加上 `legacy-`，需要定义浏览器范围（用以表示哪些浏览器当做旧浏览器对待）。

我们使用 webpack-merge 将 baseConf 和各个配置文件特定的一些配置进行合并，生成一个最终的配置文件。webpack-merge 是专门针对 Webpack 的一个对象合并方法，能极大简化 Webpack 配置文件中对象和数组的合并处理。

不同的构建目标所用到的 babel-loader 配置有一些不同。我们抽离了 configureBabelLoader 根据不同的构建目标来配置 babel-loader。比如设置 targets.browsers 来区分现代浏览器和旧浏览器，设置 `babelrc: false` 禁止使用 babelrc 配置文件。

targets.browsers 可以指定一个数组表示圈定的浏览器范围，例如：

```
browsers: [
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
]
```

以上表示的浏览器范围是：

- 版本号不小于 60 的最新两个版本的 Chrome 浏览器
- 版本号不小于 10.1 的最新两个版本的 Safari 浏览器
- iOS 系统版本不小于 10.3 的最新两个版本的 iOS 系统
- 最新的两个版本的 Firefox 浏览器并且版本不小于 54
- 最新的两个版本的 Edge 浏览器，并且 Edge 浏览器的版本不小于 15

更多有关 browserslist 的介绍可以查看 browserslist 的 [官方文档](https://github.com/browserslist/browserslist)。

代码中用到了两个插件：CleanWebpackPlugin 和 ModernBuildPlugin。 前者的作用是在构建之前清除原来构建出来的旧文件，保持输出目录的简洁。

> clean-webpack-plugin 在 2.x 版本中模块的引用方式是 `const CleanWebpackPlugin = require('clean-webpack-plugin');` ，在 3.x 版本中引用方式变成了 `const { CleanWebpackPlugin } = require('clean-webpack-plugin');`。读者请注意差异。

#### 2.3 modernBuildPlugin.js

ModernBuildPlugin 是我们自定义的 Webpack 插件，这里重点介绍一下。大家知道 HtmlWebpackPlugin 可以自动将构建出来的 js 文件插入到 html 中。由于我们需要执行两次编译，两次编译是独立进行的，单纯依靠 HtmlWebpackPlugin 无法将两个独立构建的 js 一并插入到 html 中。所以我们自定义了 ModernBuildPlugin 来解决这个问题。

```
const fs = require("fs-extra");
const path = require("path");

const safariFix = `!function(){var e=document,t=e.createElement("script");if(!("noModule"in t)&&"onbeforeload"in t){var n=!1;e.addEventListener("beforeload",function(e){if(e.target===t)n=!0;else if(!e.target.hasAttribute("nomodule")||!n)return;e.preventDefault()},!0),t.type="module",t.src=".",e.head.appendChild(t),t.remove()}}();`;

class ModernBuildPlugin {
  constructor({ modern }) {
    this.isModernBuild = modern;
  }
  apply(compiler) {
    if (!this.isModernBuild) {
      this.applyLegacy(compiler);
    } else {
      this.applyModern(compiler);
    }
  }

  applyLegacy(compiler) {
    const ID = `legacy-bundle`;
    compiler.hooks.compilation.tap(ID, compilation => {
      compilation.hooks.htmlWebpackPluginAlterAssetTags.tapAsync(
        ID,
        async (data, cb) => {
          const htmlName = path.basename(data.plugin.options.filename);

          const htmlPath = path.dirname(data.plugin.options.filename);
          const tempFilename = path.join(
            htmlPath,
            `legacy-assets-${htmlName}.json`
          );
          await fs.mkdirp(path.dirname(tempFilename));
          await fs.writeFile(tempFilename, JSON.stringify(data.body));
          cb();
        }
      );
    });
  }

  applyModern(compiler) {
    const ID = `modern-bundle`;
    compiler.hooks.compilation.tap(ID, compilation => {
      compilation.hooks.htmlWebpackPluginAlterAssetTags.tapAsync(
        ID,
        async (data, cb) => {
          // use <script type="module"> for modern assets
          data.body.forEach(tag => {
            if (tag.tagName === "script" && tag.attributes) {
              tag.attributes.type = "module";
            }
          });

          // inject Safari 10 nomodule fix
          data.body.push({
            tagName: "script",
            closeTag: true,
            innerHTML: safariFix
          });

          // inject links for legacy assets as <script nomodule>
          const htmlName = path.basename(data.plugin.options.filename);
          const htmlPath = path.dirname(data.plugin.options.filename);
          const tempFilename = path.join(
            htmlPath,
            `legacy-assets-${htmlName}.json`
          );
          const legacyAssets = JSON.parse(
            await fs.readFile(tempFilename, "utf-8")
          ).filter(a => a.tagName === "script" && a.attributes);
          legacyAssets.forEach(a => {
            a.attributes.nomodule = "";
          });
          data.body.push(...legacyAssets);
          await fs.remove(tempFilename);
          cb();
        }
      );

      compilation.hooks.htmlWebpackPluginAfterHtmlProcessing.tap(ID, data => {
        data.html = data.html.replace(/\snomodule="">/g, " nomodule>");
      });
    });
  }
}

ModernBuildPlugin.safariFix = safariFix;
module.exports = ModernBuildPlugin;
```

ModernBuildPlugin 借助一个临时文件先将 legacy 的构建数据记录到下来，再将 modern 的构建数据追加到临时文件中。最后临时文件中的内容通过 HtmlWebpackPlugin 写入到 html 中。

applyLegacy 方法主要负责创建临时文件，并在 htmlWebpackPluginAlterAssetTags 这个钩子函数中取得构建出来的 js，将 js 的信息写入到临时文件中，供下面使用。

applyModern 方法在 htmlWebpackPluginAlterAssetTags 钩子中读取 legacy 的构建内容，并给 legacy 的 js 添加 nomodule 属性。将 modern 构建的 js 添加 module 属性，同时我们添加了一段内联脚本来避免 Safari 10 重复加载 nomodule 脚本包（Safari10 的一个 bug）。 最后在 htmlWebpackPluginAfterHtmlProcessing 钩子中将两次构建的数据集中写入到 html 中。

我们需要根据用户执行的构建命令中是否指定了 modern 参数来决定采取什么样的构建过程。例如 `npm run build -- --modern` 或者 `npm run build -- --modern true`，意味着我们要使用现代模式构建。`npm run build` 或者 `npm run build -- --modern false` 意味着我们使用默认模式构建。

我们借助 minimist 来解析命令行中的参数，它将参数解析后返回一个 key-value 的对象。例如 `npm run build -- --modern` 解析的结果是 `{ _: [], modern: true }`。

更新一下 package.json 中的 build 命令：

```
"build": "node ./build/build.js"
```

执行 `npm run build -- --modern` 验证，如果没有问题，可以看到在 dist 目录中会生成两个 js 文件：`legacy-app.js` 和 `modern-app.js`。同时，index.html 的内容如下所示：

```
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,minimum-scale=1,user-scalable=no">
    <title>项目模板</title>
  </head>
  <body>
    <div id="app"></div>
    <!-- built files will be auto injected -->
  <script type="module" src="modern-app.js"></script><script>!function(){var e=document,t=e.createElement("script");if(!("noModule"in t)&&"onbeforeload"in t){var n=!1;e.addEventListener("beforeload",function(e){if(e.target===t)n=!0;else if(!e.target.hasAttribute("nomodule")||!n)return;e.preventDefault()},!0),t.type="module",t.src=".",e.head.appendChild(t),t.remove()}}();</script><script type="text/javascript" src="legacy-app.js" nomodule></script></body>
</html>
```

在浏览器中打开 index.html 的话，会发现 console 中提报 CORS 的跨域错误。这是因为 `` 需要配合始终开启的 CORS 进行加载。因此服务器必须返回诸如 `Access-Control-Allow-Origin:*` 的有效的 CORS 头。

本节教程中的完整代码我已经整理上传到 GitHub：[透视前端工程化09](https://github.com/antwang/learn-modern)，大家在跟随本节内容进行实操时可以自行下载学习，遇到问题欢迎来微信交流群中讨论。

### 总结

本节课程，我们实现了一个构建程序来为不同浏览器创建不同的构建包。有几个小的知识点稍作总结：

- 借助 browserslist 我们划分出不同的目标浏览器；
- 使用 modernBuildPlugin 插件实现将独立的构建结果输出到 html 中；
- 使用 webpack-merge 合并多个配置文件
- <script type="module"> 需要开启 CORS 进行加载。

下一节课程，我们将要讲解的内容是分离 Webpack 配置，根据不同的环境进行构建，敬请期待。