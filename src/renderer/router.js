import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

let sub_router = [
    {
        path: '/',
        name: 'ceph',
        component: (resolve) => require(['./views/ceph.vue'], resolve)
    },
    {
        path: '/ceph',
        name: 'ceph',
        component: (resolve) => require(['./views/ceph.vue'], resolve)
    },
    {
        path: '/avatar',
        name: 'avatar',
        component: (resolve) => require(['./views/avatar.vue'], resolve)
    },
    {
        path: '/binding',
        name: 'binding',
        component: (resolve) => require(['./views/binding.vue'], resolve)
    },
    {
        path: '/info',
        name: 'info',
        component: (resolve) => require(['./views/info.vue'], resolve)
    },
    {
        path: '/password',
        name: 'password',
        component: (resolve) => require(['./views/password.vue'], resolve)
    },
    {
        path: '/share',
        name: 'share',
        component: (resolve) => require(['./views/share.vue'], resolve)
    },
    {
        path: '/extract',
        name: 'extract',
        component: (resolve) => require(['./views/extract.vue'], resolve)
    },
    {
        path: '/trash',
        name: 'trash',
        component: (resolve) => require(['./views/trash.vue'], resolve)
    },
    // {
    //     path: '/jointly',
    //     name: 'jointly',
    //     component: (resolve) => require(['./views/jointly.vue'], resolve)
    // },
    // {
    //     path: '/upload',
    //     name: 'upload',
    //     component: (resolve) => require(['./views/upload.vue'], resolve)
    // },
    {
        path: '/download',
        name: 'download',
        component: (resolve) => require(['./views/download.vue'], resolve)
    },
    {
        path: '/completed',
        name: 'completed',
        component: (resolve) => require(['./views/completed.vue'], resolve)
    },
    {
        path: '/test',
        name: 'test',
        component: (resolve) => require(['./views/test.vue'], resolve)
    },
    {
        path: '/transmit',
        name: 'transmit',
        component: (resolve) => require(['./views/transmit.vue'], resolve)
    }
];

var router = new VueRouter({
    mode: 'hash',
    routes: [
        {
            path: '/',
            name: 'default',
            meta: {
                title: '美吉网盘'
            },
            component: (resolve) => require(['./views/index.vue'], resolve),
            children: sub_router
        },
        {
            path: '/login',
            name: 'login',
            meta: {
                title: '登录'
            },
            component: (resolve) => require(['./views/login.vue'], resolve)
        },
        {
            path: '/register',
            name: 'register',
            meta: {
                title: '注册'
            },
            component: resolve => require(['./views/register.vue'], resolve)
        }
    ]
});

export default router;

router.beforeEach((to, from, next) => {
    //iView.LoadingBar.start();
    console.log('router---------start', to.name);
    //没有匹配到路由
    if( ! to.name){
        router.push('/');
    }
    let token = fns.token('Jwt');
    //是否登录
    if(to.name=='login' || to.name=='register'){
        if(token){
            console.log('router---login---register---token', token);
            router.push('/');
        }
    }else{
        console.log('router---------token', token);
        if( ! token) {
            router.push('/login');
        }
    }
    next();
});

router.afterEach((to, from, next) => {
    //iView.LoadingBar.finish();
    window.scrollTo(0, 0);
});
