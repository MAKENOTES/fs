import db from '../../../datastore/db' // 取决于你的datastore.js的位置

//设置的全局访问的state对象
const state = {
    downloadList: []
};

//实时监听downloadList值的变化(最新状态)
const getters = {   
    getList (state) {  //方法名随意,主要是用来承载变化的changableNum的值
        return state.downloadList
    }
};

//自定义改变downloadList初始值的方法，这里面的参数除了downloadList之外还可以再传额外的参数(变量或对象);
const mutations = {
    listMessage (state, file) {
        state.downloadList.push(file)
        console.log('downloadList.file================================', file);
        // 添加
        db.read().get('download')
        .push(file)
        .write()
    },
    fileMessage (state, indexFile) {
        if (true === indexFile.file.isComplete) {
            state.downloadList.splice(indexFile.index, 1)

            //删除
            db.read().get('download')
            .remove({ FileId: indexFile.file.FileId })
            .write()
        } else if(true === indexFile.file.isRemove) {
            state.downloadList.splice(indexFile.index, 1)
            
            //删除
            db.read().get('download')
            .remove({ FileId: indexFile.file.FileId })
            .write()
        } else {
            //console.log('downloadList=====================', indexFile.file.name);
            state.downloadList.splice(indexFile.index, 1, indexFile.file)

            //修改
            db.read().get('download')
            .find({ FileId: indexFile.file.FileId })
            .assign(indexFile.file)
            .write()  
        }
    },
    removeAll (state, UserId) {
        //不能这样赋值
        //state.downloadList = [];
        let tempIndex = [];
        state.downloadList.forEach((item, index) => {
            tempIndex.push(index);
        });
        tempIndex.reverse().forEach((item, index) => {
            state.downloadList.splice(item, 1);
        });
       
        //删除
        db.read().get('download')
        .remove({ UserId: UserId })
        .write()
    },
    initList (state, file) {
        state.downloadList.push(file)
    },
    //清空 vue和vuex的 downloadList
    initSelf (state, init) {
        let tempIndex = [];
        state.downloadList.forEach((item, index) => {
            tempIndex.push(index);
        });
        tempIndex.reverse().forEach((item, index) => {
            state.downloadList.splice(item, 1);
        });
    }
};

//自定义触发mutations里函数的方法，context与store 实例具有相同方法和属性  this.$store.updatedownloadList('updatedownloadList', index, file)
const actions = {
    pushList(context, file){
        context.commit('listMessage', file)
    },
    updateFile(context, indexFile){
        context.commit('fileMessage', indexFile)
    },
    removeAll(context, UserId){
        context.commit('removeAll', UserId)
    },
    initList(context, file){
        context.commit('initList', file)
    },
    initSelf(context, init){
        context.commit('initSelf', init)
    },
};

export default {
    namespaced:true,//用于在全局引用此文件里的方法时标识这一个的文件名
    state,
    getters,
    mutations,
    actions
}