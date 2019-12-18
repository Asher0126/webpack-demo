# 学习Webpack

## 1. 学习步骤

### 1. Hello Webpack

1. 新建目录，并初始化 `mkdir webpack-demo & npm init -y`

2. 安装 `webpack` ：`npm i webpack webpack-cli webpack-dev-server -D`

3. 新建配置文件 `config/webpack.config.js`

    ```
    module.exports = {
        entry: './src/index.js'
    }
    ```

4. 修改 `package.json` 文件

    ```
    "scripts": {
        "build": "webpack --config config/webpack.config.js"
    }
    ```

5. 新建 `src/index.js` ，输入任意JS代码

    ```
    console.log('Hello Webpack');
    ```
    
6. 执行 `npm run build`

    在当前目录，自动生成 `dist` 目录。内部包含一个 `main.js` 文件，可以看到被构建之后的代码。此时代码是被压缩的，后面通过配置，可以看到构建的源代码。



### 2. 解析 Vue 文件

1. 安装 `vue-loader` 和 `vue-template-compiler` ： `npm i vue-loader vue-template-compiler -D`

2. 修改配置 `config/webpack.config.js`

   ```
   const VueLoaderPlugin = require("vue-loader/lib/plugin");
   
   module.exports = {
       entry: './src/index.js',
       module: {
           rules: [
               {
                   test: /\.vue$/,
                   loader: 'vue-loader'
               }
           ]
       },
       plugins: [
           new VueLoaderPlugin()
       ]
   }
   ```

3. 新建 `src/app.vue`

   ```
   <template>
       <h3>Hello Webpack</h3>
   </template>
   ```

4. 修改 `src/index.js`

   ```
   // console.log('Hello Webpack');
   import App from './app.vue';
   
   console.log(App);
   ```

5. 执行 `npm run build`，查看 `dist` 目录的 `main.js`，能看到 `("h3",[this._v("Hello Webpack")])`等代码，表示 `vue` 文件解析成功。



## 2. 注意

1. 新建 `.gitignore` 文件，忽略相关文件或者目录

   ```
   node_modules
   dist
   *-lock.json
   ```
   



## 3. 问题

1. `package.json` 文件执行 `webpack` 命令为什么能成功，直接执行是否可以，执行流程是怎样的？
2. 为什么将 `node_modules` ， `dist`， `package-lock.json` 加入到 `.gitignore` 中？
3. `vue-loader` 和 `vue-template-compiler` 有什么作用？