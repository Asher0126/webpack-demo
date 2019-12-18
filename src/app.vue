<template>
    <div>
        <h3>Hello Webpack</h3>
        <img src="./assets/images/baidu.png" alt />
        <img src="./assets/images/pikaqiu.jpg" alt />
        <span class="iconfont icon-bofang"></span>
        <span class="iconfont icon-qian"></span>
        <span class="iconfont icon-ziyuan"></span>
    </div>
</template>

<script>
export default {
    name: 'app'
}
</script>

<style lang="scss">
@import './assets/fonts/iconfont.css';

$color: red;
h3 {
    color: $color;
    transform: translate(100px, 100px);
}
</style>