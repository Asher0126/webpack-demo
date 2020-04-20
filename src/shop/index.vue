<template>
    <div>
        <h3>设置字体</h3>
        <span class="iconfont iconadd"></span>

        <svg class="icon" aria-hidden="true">
            <use xlink:href="#iconfavorfill" />
        </svg>

        <swiper ref="mySwiper" :options="swiperOptions">
            <swiper-slide>Slide 1</swiper-slide>
            <swiper-slide>Slide 2</swiper-slide>
            <swiper-slide>Slide 3</swiper-slide>
            <swiper-slide>Slide 4</swiper-slide>
            <swiper-slide>Slide 5</swiper-slide>
            <div class="swiper-pagination" slot="pagination"></div>
        </swiper>
    </div>
</template>

<script>
import '../assets/fonts/iconfont.js';
import { Swiper, SwiperSlide, directive } from 'vue-awesome-swiper';
import 'swiper/css/swiper.css';

export default {
    name: 'Index',

    components: {
        Swiper,
        SwiperSlide
    },
    directives: {
        swiper: directive
    }
};

</script>

<style lang="scss">
@import '../assets/fonts/iconfont.css';
</style>
