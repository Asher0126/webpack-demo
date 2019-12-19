# 搭建本地开发环境

经过上一节的配置，已经可以着手开发项目，但是还有以下问题需要解决：

1. 手动执行构建。每次代码发生变动后，我们都需要手动执行一下构建命令。
2. 手动刷新浏览器。构建完成后，如果我们需要在页面中验证效果，需要手动刷新。
3. 无法精确定位错误。代码构建完成后，源代码被打包成一个 bundle，如果代码中出错，无法精确定位到出错代码的位置。



## 1. 自动构建

1. 下载：`npm i webpack-dev-server -D`

2. 修改配置 `config/webpack.config.js`

   ```
   module.exports = {
       ...
       devServer: {
           contentBase: path.join(__dirname, "dist")
       }
       ...
   }
   ```

3. 修改 `package.json`

   ```
   "scripts": {
     	"dev": "webpack-dev-server --open --config config/webpack.config.js"
   }
   ```

4. 执行 `npm run dev` ，默认开启 `8080` 端口，通过 `localhost:8080` 访问项目
5. 测试：修改 `app.vue` 的内容，会看到浏览器自动刷新



## 2. 模块热替换

能不能在页面改了个样式，不刷新，直接看效果呢？或者说，有一个N个字段的表单，修改了某处代码，之前输入的内容依然存在。

**程序员真是懒到极致了，太过分了**，不过这个需求，还是小case，能做到 - **模块热替换**

修改 `config/webpack.config.js` 文件配置就可以做到

```
module.exports = {
    ...
    devServer: {
    		hot: true,
        contentBase: path.join(__dirname, "dist")
    }
    ...
}
```

