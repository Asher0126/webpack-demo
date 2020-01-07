console.log('Hello Order');

// console.log('Hello Webpack');
import Vue from 'vue';
import Index from './index.vue';

new Vue({
    el: '#app',
    render: h => h(Index)
});