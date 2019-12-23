<template>
    <div>
        <div style="height: 32px;font-size: 14px;border-bottom: 1px solid #d8dfea;">
            完成列表
            <div style="float:right;">

                <Button class="btn-self" @click="completedRemoveAll" >
                    全部移除
                </Button>
            </div>
        </div>

        <div ref="header"></div>
        <div style="overflow-y: auto; height:100%" :style="{height:this.tableHeight}">
            <Completer
                :file-list-data="completedList"
                @remove="remove"
                @openFile="openFile"
                @openFolder="openFolder"
            ></Completer>
        </div>

    </div>
</template>

<script>
import {mapState, mapGetters, mapActions} from 'vuex';
import Completer from '../components/completer.vue';
import { tableMixin } from '../common/mixins';

let completed = {
    name: 'completed',
    mixins: [tableMixin],
    data () {
        return {
        }
    },
    created() {
    },
    mounted () {
        this.tableHeight = document.body.clientHeight - (this.$refs.header.offsetHeight + 180) + "px";
    },
    computed: {
        ...mapGetters('completedList',{ //用mapGetters来获取uploadList.js里面的getters
            completedList:'getList'
        })
    },
    beforeUpdate () {
        this.tableHeight = document.body.clientHeight - (this.$refs.header.offsetHeight + 180) + "px";
    },
    watch: {

    },
    methods: {
        remove (FileId) {
            this.completedList.forEach((item, index) => {
                if (this.completedList[index].FileId == FileId) {
                    let indexFile = { index: index, file: this.completedList[index] }
                    this.$store.dispatch('completedList/deleteFile', indexFile);
                }
            })
        },
        openFile (downloadPath) {
            console.log('打开文件================', downloadPath);
            const { shell } = this.$electron.remote
            shell.openItem(downloadPath)
        },
        openFolder (downloads) {
            console.log('打开文件所在文件夹================', downloads);
            const { shell } = this.$electron.remote
            shell.openItem(downloads)
        },
        completedRemoveAll () {
            //清空  vuex---completedList
            this.$store.dispatch('completedList/removeAll', fns.getStorage('remember_username'))
        }
    },
    components: {
        Completer
    }
}
export default completed
</script>

<style>

</style>
