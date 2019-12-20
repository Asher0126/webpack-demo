<template>
    <div>
        <h3 @click="handleClick">{{title}} - test change v3</h3>
        <img src="./assets/images/baidu.png" alt />
        <img src="./assets/images/pikaqiu.jpg" alt />
        <span class="iconfont icon-bofang"></span>
        <span class="iconfont icon-qian"></span>
        <span class="iconfont icon-ziyuan"></span>
    </div>
</template>

<script>
export default {
    name: 'app',
    data: () => ({
        title: 'Hello Webpack Demo'
    }),
    methods: {
        handleClick () {
            console.log('点击了标题');
        }
    }
};
</script>

<style lang="scss">
@import './assets/fonts/iconfont.css';

$color: blue;
h3 {
    // width: 100px;
    width: 100pt;
    color: $color;
    // background: #1x1;
    background: #111;
    transform: translate(100px, 100px);
}
</style>