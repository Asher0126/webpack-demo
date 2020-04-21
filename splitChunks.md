# 1. splitChunks案例1：


```
// index.js

// dynamically import a.js
import('./a');
```



```
// a.js
import 'react';
```

结果：react被拆分

原因：

1. react被包含在node_modules中
2. react超过30kb
3. 导入模块的并行请求次数是2
4. 不会影响初始页面加载时的请求

原理：这背后的原因是什么？react可能不会像您的应用程序代码那样频繁地更改。通过将其移动到单独的块中，可以将该块与应用程序代码分开进行缓存（假设您使用的是chunkhash，records，Cache-Control或其他长期缓存方法）。



# 2. splitChunks案例2：

```
// entry.js

// dynamically import a.js and b.js
import("./a");
import("./b");
```



```
// a.js
import "./helpers"; // helpers is 40kb in size

// ...
```



```
// b.js
import "./helpers";
import "./more-helpers"; // more-helpers is also 40kb in size

// ...
```

结果：helpers被独立为chunk

原因：

1. 被两次import导入
2. helpers超过30kb
3. 导入模块的并行请求次数是2
4. 不会影响初始页面加载时的请求

原理：将 `helpers` 的内容放入每个块中将导致其代码被下载两次。通过使用单独的块，这只会发生一次。我们会支付额外请求的费用，这可以视为一种折衷。这就是为什么最小大小为30kb的原因。



# 3. 配置configuration

所有来自node_modules的模块都被打包到一个vendors的cache group

所有重复3次的chunk都被打包到default中

可以将一个模块分配给多个ca'che group。然后，优化将优先选择具有较高优先级（优先级选项）的cache group，或者优先选择形成更大块的cache group。



# 4. conditions

当满足所有条件时，来自相同块和缓存组的模块将形成一个新chunk。

上述的条件是：

1. minSize（default：30000）：chunk的最小尺寸
2. minChunks（default：1）：在spliting之前模块共享的次数
3. maxInitialRequests（default：3）一个entrypoint的最大并行请求次数
4. maxAsyncRequests（default：5）按需加载时最大并行请求数



# 5. Naming

通过name属性配置chunk的name名称

设置值为true：根据块和缓存组键自动选择名称，否则可以传递字符串或函数。

当名称与入口点名称匹配时，入口点被删除#



# 6. 分隔符：automaticNameDelimiter

默认原名称和chunk名称用的分隔符："~"



# 7. 选中模块：select modules

test参数：cache-group的参数：省略他会选择所有的模块，可以是一个正则，字符串，函数

可以匹配绝对路径、chunk name。

当chunk被选择之后，所有的模块都会被匹配



# 8. 选中chunks

用chunks配置 配置chunks。有三个值

Initial: 初始块

async：按需加载块

all：所有块



当模块完全匹配时，选项reuseExistingChunk允许重用现有的块，而不是创建新的块。



### `optimization.splitChunks.chunks: all`

如前所述，此插件将影响动态导入的模块。将optimization.splitChunks.chunks选项设置为“all”：初始块将受到它的影响（即使不是动态导入的块）。这样，chunk甚至可以在entry point和on-demand(按需加载)之间共享。

这是推荐的配置。

您可以将此配置与HtmlWebpackPlugin结合使用，它将为您注入所有生成的vendor chunk。



splitChunks的默认配置

```
splitChunks: {
    chunks: "async",
    minSize: 30000,
    minChunks: 1,
    maxAsyncRequests: 5,
    maxInitialRequests: 3,
    automaticNameDelimiter: '~',
    name: true,
    cacheGroups: {
        vendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10
        },
    default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true
        }
    }
}
```

默认情况下，cacheGroups继承自splitChunks*的选项，但是test，priority和reuseExistingChunk只能在cacheGroups级别上配置。

cacheGroups是一个对象，其中键是缓存组名称。上面列出的所有选项都是可能的：chunk，minSize，minChunks，maxAsyncRequests，maxInitialRequests，name。

您可以将optimization.splitChunks.cacheGroups.default设置为false以禁用默认缓存组，这与vendors缓存组相同。(怎么理解这句话)

默认组的优先级为负，以允许任何自定义缓存组获得更高的优先级（默认值为0）。



一些案例：

创建一个commons块，其中包括entry points之间共享的所有代码。

```
splitChunks: {
    cacheGroups: {
        commons: {
            name: "commons",
            chunks: "initial",
            minChunks: 2
        }
    }
}
```



创建vendor chunk，包含node_modules所有的code

```
splitChunks: {
    cacheGroups: {
        commons: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            chunks: "all"
        }
    }
}
```



将Optimization.runtimeChunk设置为true会向每个仅包含运行时的入口点添加一个附加块。

相反，值single将创建一个运行时文件，以供所有生成的块共享。