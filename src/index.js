// console.log('Hello Webpack');
import Vue from 'vue';
import App from './app.vue';

// console.log(App);
new Vue({
    el: '#app',
    render: h => h(App)
})