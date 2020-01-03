# Webpack配置多入口

1. 下载

   ```
   npm i glob -D
   ```

   多入口，我们希望系统自动获取。此处通过 `glob` 自动获取多入口文件。

2. 在 `src` 新增多入口

   1. 新建 `src/index/index.html` ， `src/index/index.js`
   2. 新建 `src/shop/index.html` ， `src/shop/index.js`
   3. 新建 `src/order/index.html` ， `src/order/index.js`

   上面测试代码

   `index.html` 测试代码

   ```
   <!DOCTYPE html>
   <html lang="en">
   
   <head>
       <meta charset="UTF-8">
       <meta name="viewport" content="width=device-width, initial-scale=1.0">
       <meta http-equiv="X-UA-Compatible" content="ie=edge">
       <!-- 为区分，其他入口为Index/Shop/Order -->
       <title>Hello Index</title>
   </head>
   
   <body>
   		<!-- 为区分，其他入口为Index/Shop/Order -->
       <h3>Hello Index</h3>
   </body>
   
   </html>
   ```

   `index.js` 测试代码

   ```
   // 为区分，其他入口为Index/Shop/Order
   console.log('Hello Index');
   ```

3. 修改 `config/webpack.config.base.js`

   ```
   const path = require('path');
   const glob = require('glob');
   ...
   
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
                   filename: `${pageName}.html`,
                   chunks: [pageName],
                   inject: true,
                   minify: {
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
       }
   }
   
   const { entry, htmlWebpackPlugins } = setMPA();
   
   module.exports = {
   		entry,	// 多入口
   		plugins: [
   				...
   		].concat(htmlWebpackPlugins)	// 拼接所有经htmlWebpackPlugin处理的入口文件
   }
   ```

4. 执行 `npm run build` ， 发现 `dist` 目录中生成三个文件 `index.html, shop.html, order.html`，分别用浏览器访问，并打开控制栏，查看控制栏打印结果。