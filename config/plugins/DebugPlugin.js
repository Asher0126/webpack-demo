const path = require("path");
const SingleEntryPlugin = require("webpack/lib/SingleEntryPlugin");
const MultiEntryPlugin = require("webpack/lib/MultiEntryPlugin");

// webpack内置的处理入口文件的插件
const itemToPlugin = (context, item, name) => {
    if (Array.isArray(item)) {
        return new MultiEntryPlugin(context, item, name);
    }
    return new SingleEntryPlugin(context, item, name);
};
class DebugPlugin {
    constructor(options) {
        this.options = Object.assign({}, { enable: false }, options);
    }
    apply (compiler) {
        compiler.hooks.entryOption.tap("vc-debug", (context, entry) => {
            const { enable } = this.options;
            console.log('vconsole', path.resolve());
            let vconslePath = path.resolve("config/libs/vconsole.js");
            if (enable) {
                // 将vconsole添加到entry中
                if (typeof entry === "string") {
                    entry = [vconslePath, entry];
                } else if (Array.isArray(entry)) {
                    entry.unshift(vconslePath);
                } else if (typeof entry === "object") {
                    entry["vconsole"] = vconslePath;
                }
                console.log("TCL: DebugPlugin -> apply -> entry", entry);
                // 使用entryPlugin重新解析entry
                if (typeof entry === "string" || Array.isArray(entry)) {
                    itemToPlugin(context, entry, "app").apply(compiler);
                } else if (typeof entry === "object") {
                    for (const name of Object.keys(entry)) {
                        itemToPlugin(context, entry[name], name).apply(compiler);
                    }
                }
                return true;
            }
        });
    }
}

module.exports = DebugPlugin;