let fns = {
    // sessionStorage (关闭浏览器失效)
    setCache: function(key, value)
    {
    	sessionStorage.setItem(key, JSON.stringify(value));	
    },
    // sessionStorage 获取本地缓存
    getCache: function(key)
    {
        var str = sessionStorage.getItem(key);
        if(str == 'undefined' || str == 'null') {
            return '';
        }
    	return JSON.parse(str);
    },
    // sessionStorage 清除一个 key
    rmCache: function(key)
    {
    	sessionStorage.setItem(key, null);
    },
    // sessionStorage 清空本地缓存
    clearCache: function()
    {
        let count = sessionStorage.length;
        for(let i = 0; i < count; i++) {
            let key = sessionStorage.key(i);       
            sessionStorage.setItem(key, null);
        }
    },

    // localStorage 会一直有效直到用户清除浏览器缓存
    setStorage: function(key, value)
    {
    	localStorage.setItem(key, JSON.stringify(value));	
    },
    // localStorage 获取本地缓存
    getStorage: function(key)
    {
        var str = localStorage.getItem(key);
        if(str == 'undefined' || str == 'null') {
            return '';
        }
    	return JSON.parse(str);
    },
    // localStorage 清除一个 key
    rmStorage: function(key)
    {
    	localStorage.setItem(key, null);
    },
    // localStorage 清空本地缓存
    clearStorage: function()
    {
        let count = sessionStorage.length;
        for(let i = 0; i < count; i++) {
            let key = sessionStorage.key(i);       
            localStorage.setItem(key, null);
        }
    },

    //获取token
    token: function(w)
    {
        if( ! w){ w = 'middle_jwt'; }
        return this.getStorage(w);
    },
    //是/否
    yn: function(v)
    {
        v = parseInt(v);
        return v === 1 ? '是' : '否';
    },
    //封装类似PHP的$_GET数组, 可以方便获取url什么的参数
    getParams: function()
    {
        let url = window.location.search;
        let $_GET = {};
        if(url) {
            let parameter_str = url.split('?')[1];
            if(parameter_str) parameter_str = parameter_str.split('#')[0];
            
            if(!parameter_str) return;
            let parameter_arr = parameter_str.split('&');  
            let tmp_arr;  
            for(let i = 0, len = parameter_arr.length; i <= len -1; i++){  
                tmp_arr = parameter_arr[i].split('=');  
                $_GET[tmp_arr[0]] = decodeURIComponent(tmp_arr[1]);  
            }  
        }
        window.$_GET = $_GET;
    },
    //退出登录
    logOut: function()
    {
        fns.clearCache();
        location.href = '/login';
    }
};

export default fns;
