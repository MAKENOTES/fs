import Vue from 'vue';
import iView from 'iview';
import Routers from './router';
import App from './app.vue';
import axios from 'axios';
import qs from 'qs';
import apis from './libs/apis';//接口
import fns from './libs/fns';//函数库
import bus from './libs/bus.js';//全局空间（可用于数据存储、交换传递）
import store from './store'//引入store
import VueWorker from 'vue-worker';
import VueClipboard from 'vue-clipboard2';
import "babel-polyfill";
import 'iview/dist/styles/iview.css';
import './static/icon-self/iconfont.js';

Vue.use(iView);
Vue.use(VueWorker)
Vue.use(VueClipboard)

Vue.prototype.$axios = axios;
Vue.prototype.$qs = qs;
Vue.prototype.bus = bus;

window.apis = apis;
window.fns = fns;

//引入electron接口
const path = require('path');
Vue.path = Vue.prototype.$path = path;//path接口

//简洁用法 this.$ipcRenderer.on  暂时感觉没必要
// let ipcRenderer = require('electron').ipcRenderer;
// Vue.ipcRenderer = Vue.prototype.$ipcRenderer = ipcRenderer;//ipc接口

//标准用法  this.$electron.ipcRenderer.on
if (!process.env.IS_WEB) Vue.use(require('vue-electron'))

new Vue({
    el: '#app',
    router: Routers,
    store,//使用store
    render: h => h(App)
});



axios.defaults.withCredentials=true;//ajax 携带cookie

//axios 请求拦截器
axios.interceptors.request.use(function(config){
    config.headers['Jwt'] = fns.token('Jwt');
    if (config.url.indexOf("/Proxy/User/loginJwt") == -1) {
        config.headers['MiddleFlag'] = fns.getStorage('middle_flag');
    }
    return config;
},function(error){
    return Promise.reject(error);
});

//axios 响应拦截器
axios.interceptors.response.use(
    response => {
        return response;
    },
    error => {
        if (error && error.response) {
            switch (error.response.status) {
                case 400: error.message = '请求错误(400)' ; break;
                case 401: error.message = '身份已过期，请重新登录'; bus.$emit('app_quit', true); break;
                case 403: error.message = '拒绝访问(403)'; break;
                case 404: error.message = '请求出错(404)'; break;
                case 408: error.message = '请求超时(408)'; break;
                case 500: error.message = '服务器错误(500)'; break;
                case 501: error.message = '服务未实现(501)'; break;
                case 502: error.message = '网络错误(502)'; break;
                case 503: error.message = '服务不可用(503)'; break;
                case 504: error.message = '网络超时(504)'; break;
                case 505: error.message = 'HTTP版本不受支持(505)'; break;
                default: error.message = `连接出错(${error.response.status})!`;
            }
        }else{
            error.message = '连接服务器失败，请检查网络连接或联系管理员'
        }
        iView.Message.error(error.message);
        return Promise.reject(error);
	}
);