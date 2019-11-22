import Vue from 'vue';
import Vuex from 'vuex';
import uploadList from './modules/uploadList'
import downloadList from './modules/downloadList'
import completedList from './modules/completedList'
import listenerStatus from './modules/listenerStatus'
Vue.use(Vuex);

export default new Vuex.Store({
    modules:{
        uploadList,
        downloadList,
        completedList,
        listenerStatus
    }
});