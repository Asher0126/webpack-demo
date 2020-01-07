module.exports = {
    env: {
        browser: true,
        node: true,
        es6: true
    },
    extends: ["eslint:recommended", "plugin:vue/strongly-recommended"],
    parserOptions: {
        parser: "babel-eslint",
        sourceType: "module"
    },
    plugins: ["vue"],
    rules: {
        'semi': ['error', 'always'],  // 强制分号
        "indent": ["error", 4], // 4个空格

        "camelcase": 0, // 不强制_形式，或者驼峰

        "vue/html-indent": ["error", 4], // vue中4个空格
        "vue/max-attributes-per-line": 0,
        "vue/singleline-html-element-content-newline": 0,
        "vue/html-self-closing": 0
    }
};