// console.log('Hello Webpack');
import Vue from 'vue';
import App from './app.vue';

// const str = 'hello str';
// test code: test suporting Promise in browser.
let p = new Promise(function (resolve) {
    setTimeout(() => {
        resolve("done");
    }, 1000);
});
p.then(res => {
    console.log(res);
});

// console.log(App);
new Vue({
    el: '#app',
    render: h => h(App)
});