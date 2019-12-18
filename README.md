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



留个练习，修改上面第三步，改为下列代码：

```
<template>
    <h3>Hello Webpack</h3>
</template>

<script>
export default {
    name: 'app'
}
</script>

<style>
h3 {
    color: red;
}
</style>
```

新增了 `style` 样式代码，重复执行 `npm run build`，会出现什么结果？



**答案是报错！！！**

原因很简单：目前我们还没有配置解析 `CSS` 的 `loader`。



### 3. 解析CSS

1. 安装CSS解析器：`npm i style-loader css-loader -D`

2. 修改配置，新增解析css规则

   ```
   {
   		test: /\.css$/,
   		use: ["style-loader", "css-loader"]
   }
   ```

3. 执行 `npm run build`，不会报错。

   查看 `dist` 目录，会看到类似 `(t=n(3)(!1)).push([e.i,"\nh3 {\n    color: red;\n}\n",""])` 的代码，表示解析CSS成功。



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
4. `["style-loader", "css-loader"]` 什么作用，顺序能反吗？