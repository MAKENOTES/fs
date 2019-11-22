import db from '../../../datastore/db' // 取决于你的datastore.js的位置

//设置的全局访问的state对象
const state = {
    completedList: []
};

//实时监听completedList值的变化(最新状态)
const getters = {   
    getList (state) {  //方法名随意,主要是用来承载变化的changableNum的值
        return state.completedList
    }
};

//自定义改变completedList初始值的方法，这里面的参数除了completedList之外还可以再传额外的参数(变量或对象);
const mutations = {
    listMessage (state, file) {
        if (true === file.isComplete) {
            state.completedList.push(file)
            // 添加
            db.read().get('completed')
            .push(file)
            .write()
        }
    },
    deleteFile (state, indexFile) {
        state.completedList.splice(indexFile.index, 1)
        //删除
        db.read().get('completed')
        .remove({ FileId: indexFile.file.FileId })
        .write()
    },
    removeAll (state, UserId) {
        let tempIndex = [];
        state.completedList.forEach((item, index) => {
            tempIndex.push(index);
        });
        tempIndex.reverse().forEach((item, index) => {
            state.completedList.splice(item, 1);
        });

        //删除
        db.read().get('completed')
        .remove({ UserId: UserId })
        .write()
    },
    initList (state, fileList) {
        state.completedList = fileList
    },
    initSelf (state, init) {
        let tempIndex = [];
        state.completedList.forEach((item, index) => {
            tempIndex.push(index);
        });
        tempIndex.reverse().forEach((item, index) => {
            state.completedList.splice(item, 1);
        });
    }
};

//自定义触发mutations里函数的方法，context与store 实例具有相同方法和属性  this.$store.updatecompletedList('updatecompletedList', index, file)
const actions = {
    pushList(context, file){
        context.commit('listMessage', file)
    },
    deleteFile(context, indexFile){
        context.commit('deleteFile', indexFile)
    },
    removeAll(context, UserId){
        context.commit('removeAll', UserId)
    },
    initList(context, fileList){
        context.commit('initList', fileList)
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