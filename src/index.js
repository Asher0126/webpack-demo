// console.log('Hello Webpack');
import Vue from 'vue';
import App from './app.vue';

// const str = 'hello str';

// console.log(App);
new Vue({
    el: '#app',
    render: h => h(App)
})