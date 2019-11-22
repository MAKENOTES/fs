<template>
    <div>
        <div style="height: 32px;font-size: 14px;border-bottom: 1px solid #d8dfea;">
            上传列表
            <div style="float:right;">

                <Button class="btn-self" @click="uploadPauseAll" >
                    全部暂停
                </Button>
                <Button class="btn-self" @click="uploadStartAll" >
                    全部开始
                </Button>
                <Button class="btn-self" @click="uploadRemoveAll" >
                    全部取消
                </Button>
            </div>
        </div>

        <div v-if="this.uploadList.length==0" style="text-align: center;padding-top: 100px;">
            暂无数据
        </div>    

        <div ref="header"></div>
        <div style="overflow-y: auto;" :style="{height:this.tableHeight}">
            <Uploader
                :file-list-data="uploadList"
                @pause="pause"
                @resume="resume"
                @remove="remove"
            ></Uploader>
        </div>
    </div>
</template>

<script>
import {mapState,mapGetters,mapActions} from 'vuex';
import Uploader from '../components/uploader.vue';
import { formatedSize } from '../utils/utils';
import { tableMixin } from '../common/mixins';

let upload = {
    name: 'upload-list',
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
        ...mapGetters('uploadList',{
            uploadList:'getList'
        }),
        ...mapGetters('listenerStatus',{
            listenerStatus:'getList'
        })
    },
    beforeUpdate () {
        this.tableHeight = document.body.clientHeight - (this.$refs.header.offsetHeight + 180) + "px";
    },
    watch: {

    },
    methods: {
        //暂停上传
        pause (FileId) {
            this.uploadList.forEach((item, index) => {
                if (this.uploadList[index].FileId == FileId) {
                    this.uploadList[index].paused = true;
                    this.uploadList[index].status = 'paused';
                    this.uploadList[index].isUnderway = false;
                    //更新uploadList中文件信息
                    let indexFile = { index: index, file: this.uploadList[index] }
                    this.$store.dispatch('uploadList/updateFile', indexFile)
                    //添加文件信息更新限制
                    this.$store.dispatch('listenerStatus/pushUploadPause', {FileId: FileId, status: true})
                }
            })
            this.$electron.ipcRenderer.send('UPLOAD_PAUSE', FileId)
        },
        //恢复上传
        resume (FileId) {
            let tempFile = [];
            this.uploadList.forEach((item, index) => {
                if (this.uploadList[index].FileId == FileId) {
                    this.uploadList[index].paused = false;
                    this.uploadList[index].status = 'underway';
                    this.uploadList[index].isUnderway = true;
                    //更新uploadList中文件信息
                    let indexFile = { index: index, file: this.uploadList[index] }
                    this.$store.dispatch('uploadList/updateFile', indexFile);
                    tempFile[index] = this.uploadList[index];
                }
            })
            //去除文件信息更新限制
            this.listenerStatus.uploadPause.forEach((item, index) => {
                if (this.listenerStatus.uploadPause[index].FileId == FileId) {
                    this.$store.dispatch('listenerStatus/deleteUploadPause', index)
                }
            })
            if (tempFile) {
                this.$electron.ipcRenderer.send('UPLOAD_FILES', tempFile);
            }
        },
        //取消上传
        remove (FileId) {
            this.uploadList.forEach((item, index) => {
                if (this.uploadList[index].FileId == FileId) {
                    if (true == this.uploadList[index].paused) {
                        this.uploadList[index].isRemove = true;
                        //更新uploadList中文件信息
                        let indexFile = { index: index, file: this.uploadList[index] }
                        this.$store.dispatch('uploadList/updateFile', indexFile)
                    } else {
                        this.uploadList[index].isRemove = true;
                        //更新uploadList中文件信息
                        let indexFile = { index: index, file: this.uploadList[index] }
                        this.$store.dispatch('uploadList/updateFile', indexFile)
                        this.$electron.ipcRenderer.send('UPLOAD_REMOVE', FileId)
                    }
                }
            })
        },
        //全部暂停
        uploadPauseAll () {
            //清空  vuex---listenerStatus-uploadPause
            this.$store.dispatch('listenerStatus/initSelfUploadPause', []);
            //限制文件更新
            this.$store.dispatch('listenerStatus/uploadPauseAll', true)
            //清空主进程 文件上传
            this.$electron.ipcRenderer.send('UPLOAD_CLEAR_ALL', {event: 'UPLOAD_CLEAR_ALL_CALL', status: true});
        },
        //全部开始
        uploadStartAll () {
            //清空  vuex---listenerStatus-uploadPause
            this.$store.dispatch('listenerStatus/initSelfUploadPause', []);
            let tempFile = [];
            this.uploadList.forEach((item, index) => {
                this.uploadList[index].paused = false;

                let indexFile = { index: index, file: this.uploadList[index] }
                tempFile[index] = this.uploadList[index];
                this.$store.dispatch('uploadList/updateFile', indexFile)
            })
            this.$electron.ipcRenderer.send('UPLOAD_FILES', tempFile)
        },
        //全部取消 
        uploadRemoveAll () {
            let pauseAll = true;
            this.uploadList.forEach((item, index) => {
                if (true === item.isUnderway) {
                    pauseAll = false;
                }
            })
            //所有文件处于暂停状态  只需要处理 vuex 和 db
            if (true === pauseAll) {
                console.log('==============处于暂停状态==================');
                //清空  vuex---uploadList 和 db---uploadList
                this.$store.dispatch('uploadList/removeAll', fns.getStorage('remember_user_id'))
            } else {
                //清空  vuex---listenerStatus-uploadPause
                this.$store.dispatch('listenerStatus/initSelfUploadPause', []);
                //限制文件更新
                this.$store.dispatch('listenerStatus/uploadRemoveAll', true)
                //清空主进程 文件上传
                this.$electron.ipcRenderer.send('UPLOAD_CLEAR_ALL', {event: 'UPLOAD_CLEAR_ALL_CALL', status: true});
            }
        }
    },
    beforeDestroy () {

    },
    components: {
        Uploader
    }
}
export default upload
</script>

<style>
    .uploader-fragmentFile {
        width: 880px;
        padding: 15px;
        margin-top: 6px !important;
        font-size: 12px;
        box-shadow: 0 0 10px rgba(0, 0, 0, .4);
    }
    .uploader-fragmentFile .uploader-btn {
        margin-right: 4px;
    }
    .uploader-fragmentFile .uploader-list {
        max-height: 440px;
        overflow: auto;
        overflow-x: hidden;
        overflow-y: auto;
    }
</style>
