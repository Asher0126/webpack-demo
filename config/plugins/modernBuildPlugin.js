/**
 * 我们构建两份代码：支持新特性和不支持新特性的代码
 * 原因：减少已经支持新特性的浏览器的不必要文件资源的加载
 * 为什么单独封装plugin：
 *      需要执行两次编译，两次编译独立进行
 *      单纯依靠 HtmlWebpackPlugin 无法将两个独立构建的 js 一并插入到 html 中
 * 原理：
 *  生成一个临时文件，将 legacy 的构建数据记录到下来
 *  再将 modern 的构建数据追加到临时文件中
 *  最后临时文件中的内容通过 HtmlWebpackPlugin 写入到 html 中
 */
const fs = require("fs-extra");
const path = require("path");

const safariFix = `!function(){var e=document,t=e.createElement("script");if(!("noModule"in t)&&"onbeforeload"in t){var n=!1;e.addEventListener("beforeload",function(e){if(e.target===t)n=!0;else if(!e.target.hasAttribute("nomodule")||!n)return;e.preventDefault()},!0),t.type="module",t.src=".",e.head.appendChild(t),t.remove()}}();`;

class ModernBuildPlugin {
    constructor({ modern }) {
        this.isModernBuild = modern;
    }
    apply (compiler) {
        if (!this.isModernBuild) {
            this.applyLegacy(compiler);
        } else {
            this.applyModern(compiler);
        }
    }

    /**
     * applyLegacy 方法主要负责创建临时文件，
     * 并在 htmlWebpackPluginAlterAssetTags 这个钩子函数中取得构建出来的 js
     * 将 js 的信息写入到临时文件中，供下面使用
     */
    applyLegacy (compiler) {
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

    /**
     * 
     * applyModern 方法在 htmlWebpackPluginAlterAssetTags 钩子中读取 legacy 的构建内容
     * 并给 legacy 的 js 添加 nomodule 属性
     * 将 modern 构建的 js 添加 module 属性
     * 同时我们添加了一段内联脚本来避免 Safari 10 重复加载 nomodule 脚本包（Safari10 的一个 bug）
     * 最后在 htmlWebpackPluginAfterHtmlProcessing 钩子中将两次构建的数据集中写入到 html 中
     */
    applyModern (compiler) {
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