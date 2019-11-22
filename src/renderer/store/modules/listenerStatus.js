//设置的全局访问的state对象
const state = {
    //listener 开启状态
    initOnce: false,
    //窗口最大化最小化状态
    browserWindow:false,
    //上传 暂停所有
    uploadPauseAll: false,
    //上传 取消所有
    uploadRemoveAll:false,
    //下载 暂停所有
    downloadPauseAll: false,
    //下载 取消所有
    downloadRemoveAll:false,
    //上传 单个暂停 
    uploadPause: [],
    //下载 单个暂停
    downloadPause: [],
};

//实时监听downloadList值的变化(最新状态)
const getters = {   
    getList (state) {  //方法名随意,主要是用来承载变化的changableNum的值
        return state
    }
};

//自定义改变downloadList初始值的方法，这里面的参数除了downloadList之外还可以再传额外的参数(变量或对象);
const mutations = {
    initOnce (state, status) {
        state.initOnce = status;
    },
    browserWindow (state, status) {
        state.browserWindow = status;
    },

    uploadPauseAll (state, status) {
        state.uploadPauseAll = status;
    },
    uploadRemoveAll (state, status) {
        state.uploadRemoveAll = status;
    },
    downloadPauseAll (state, status) {
        state.downloadPauseAll = status;
    },
    downloadRemoveAll (state, status) {
        state.downloadRemoveAll = status;
    },

    pushUploadPause (state, file) {
        state.uploadPause.push(file)
    },
    deleteUploadPause (state, index) {
        state.uploadPause.splice(index, 1)
    },

    pushDownloadPause (state, file) {
        state.downloadPause.push(file)
    },
    deleteDownloadPause (state, index) {
        state.downloadPause.splice(index, 1)
    },
    
    //初始化所有状态
    initSelf (state, init) {
        state.initOnce = false;
        state.browserWindow = false;

        state.uploadPauseAll = false;
        state.uploadRemoveAll = false;
        state.downloadPauseAll = false;
        state.downloadRemoveAll = false;

        let tempIndex1 = [];
        state.uploadPause.forEach((item, index) => {
            tempIndex1.push(index);
        });
        tempIndex1.reverse().forEach((item, index) => {
            state.uploadPause.splice(item, 1);
        });

        let tempIndex2 = [];
        state.downloadPause.forEach((item, index) => {
            tempIndex2.push(index);
        });
        tempIndex2.reverse().forEach((item, index) => {
            state.downloadPause.splice(item, 1);
        });

    },
    //初始化  单个上传 暂停数组
    initSelfUploadPause (state, init) {
        let tempIndex = [];
        state.uploadPause.forEach((item, index) => {
            tempIndex.push(index);
        });
        tempIndex.reverse().forEach((item, index) => {
            state.uploadPause.splice(item, 1);
        });
    },
    //初始化  单个下载 暂停数组
    initSelfDownloadPause (state, init) {
        let tempIndex = [];
        state.downloadPause.forEach((item, index) => {
            tempIndex.push(index);
        });
        tempIndex.reverse().forEach((item, index) => {
            state.downloadPause.splice(item, 1);
        });
    }
};

//自定义触发mutations里函数的方法，context与store 实例具有相同方法和属性  this.$store.updatedownloadList('updatedownloadList', index, file)
const actions = {
    initOnce(context, status){
        context.commit('initOnce', status)
    },
    browserWindow(context, status){
        context.commit('browserWindow', status)
    },

    uploadPauseAll(context, status) {
        context.commit('uploadPauseAll', status)
    },
    uploadRemoveAll(context, status) {
        context.commit('uploadRemoveAll', status)
    },
    downloadPauseAll(context, status) {
        context.commit('downloadPauseAll', status)
    },
    downloadRemoveAll(context, status) {
        context.commit('downloadRemoveAll', status)
    },

    pushUploadPause(context, file){
        context.commit('pushUploadPause', file)
    },
    deleteUploadPause(context, index){
        context.commit('deleteUploadPause', index)
    },
    pushDownloadPause(context, file){
        context.commit('pushDownloadPause', file)
    },
    deleteDownloadPause(context, index){
        context.commit('deleteDownloadPause', index)
    },


    initSelf(context, init){
        context.commit('initSelf', init)
    },
    initSelfUploadPause(context, init){
        context.commit('initSelfUploadPause', init)
    },
    initSelfDownloadPause(context, init){
        context.commit('initSelfDownloadPause', init)
    },
};

export default {
    namespaced:true,//用于在全局引用此文件里的方法时标识这一个的文件名
    state,
    getters,
    mutations,
    actions
}