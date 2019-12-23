
<style>
    table.gridtable {
        font-family: verdana,arial,sans-serif;
        font-size:11px;
        color:#333333;
        border-width: 1px;
        border-color: #666666;
        border-collapse: collapse;
    }
    table.gridtable th {
        width: 400px;
        border-width: 1px;
        padding: 8px;
        border-style: solid;
        border-color: #666666;
        background-color: #dedede;
    }
    table.gridtable td {
        border-width: 1px;
        padding: 8px;
        border-style: solid;
        border-color: #666666;
        background-color: #ffffff;
        word-break: break-all; 
        word-wrap:break-word;
    }
    .ivu-modal-header {
        background-color: #3589ff !important;
    }
    .ivu-modal-body {
        background-color: aliceblue;
    }
</style>
<template>
    <div>
        <div style="height: 32px;font-size: 14px;border-bottom: 1px solid #d8dfea;">
            下载列表
            <div style="float:right;">

                <Button class="btn-self" @click="downloadPauseAll" >
                    全部暂停
                </Button>
                <Button class="btn-self" @click="downloadStartAll" >
                    全部开始
                </Button>
                <Button class="btn-self" @click="downloadRemoveAll" >
                    全部取消
                </Button>
            </div>
        </div>

        <div v-if="this.downloadList.length==0" style="text-align: center;padding-top: 100px;">
            暂无数据
        </div>    

        <div ref="header"></div>
        <div style="overflow-y: auto;" :style="{height:this.tableHeight}">
            <Downloader
                :file-list-data="downloadList"
                @pause="pause"
                @resume="resume"
                @remove="remove"
                @retry="retry"
                @openFileError="openFileError"
            ></Downloader>
        </div>
        <div>
            <Modal 
                v-model="fileError" 
                title="文件传输错误信息" 
                :mask=false
                :styles="{top: '100px' }"
                :width="820">
                    <div style="overflow-y: auto;height: 300px;">
                    <table class="gridtable">
                        <th>文件路径</th>
                        <th>失败原因</th>
                        <tr v-for="(item, index) in fileErrorList" :key="index">
                            <td>{{item.path}}</td>
                            <td>{{item.tip}}</td>
                        </tr>
                    </table>
                    </div>
                    <div slot="footer">
                    <Button type="primary" size="small" @click="closeFileError">关闭</Button>
                    </div>  
            </Modal>
        </div>
    </div>
</template>

<script>
    import {mapState, mapGetters, mapActions} from 'vuex';
    import Downloader from '../components/downloader.vue';
    import { tableMixin } from '../common/mixins';

    let download = {
        name: 'download',
        mixins: [tableMixin],
        data () {
            return {
                fileErrorList: [],
                fileError: false
            }
        },
        created() {
        },
        mounted () {
            this.tableHeight = document.body.clientHeight - (this.$refs.header.offsetHeight + 180) + "px";
        },
        computed: {
            ...mapGetters('downloadList',{ //用mapGetters来获取downloadList.js里面的getters
                downloadList:'getList'
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
            //更新文件列表 vuex
            updateFileList (file) {
                this.downloadList.forEach((item, index) => {
                    if (this.downloadList[index].FileId == file.FileId) {
                        let indexFile = { index: index, file: file }
                        this.$store.dispatch('downloadList/updateFile', indexFile)
                    }
                })
            },
            //暂停下载 避免渲染层意外销毁 暂保留修改vuex状态操作
            pause (FileId) {
                console.log('暂停文件块的===============FileId', FileId);
                this.downloadList.forEach((item, index) => {
                    if (this.downloadList[index].FileId == FileId) {
                        if (false === this.downloadList[index].isUnderway) {
                            this.$Message.error('文件还未开始上传！');
                            return false;
                        }
                        this.downloadList[index].paused = true;
                        this.downloadList[index].status = 'paused';
                        this.downloadList[index].isUnderway = false;

                        let indexFile = { index: index, file: this.downloadList[index] }
                        this.$store.dispatch('downloadList/updateFile', indexFile)
                        //添加文件信息更新限制
                        this.$store.dispatch('listenerStatus/pushDownloadPause', {FileId: FileId, status: true})
                    }
                })

                this.$electron.ipcRenderer.send('DOWNLOAD_PAUSE', FileId);
            },
            //恢复下载
            resume (FileId) {
                let tempFile = [];
                this.downloadList.forEach((item, index) => {
                    if (this.downloadList[index].FileId == FileId) {

                        this.downloadList[index].paused = false;
                        this.downloadList[index].status = 'underway';
                        this.downloadList[index].isUnderway = true;

                        let indexFile = { index: index, file: this.downloadList[index] }
                        tempFile[index] = this.downloadList[index];
                        this.$store.dispatch('downloadList/updateFile', indexFile)
                    }
                })
                //去除文件信息更新限制
                this.listenerStatus.downloadPause.forEach((item, index) => {
                    if ( this.listenerStatus.downloadPause[index].FileId == FileId) {
                         this.$store.dispatch('listenerStatus/deleteDownloadPause', index)
                    }
                })

                if (tempFile) {
                    console.log('恢复下载========================================', tempFile);
                    this.$electron.ipcRenderer.send('DOWNLOAD_FILES', tempFile)
                }
            },
            //取消下载 避免渲染层意外销毁 暂保留修改vuex状态操作
            remove (FileId) {
                this.downloadList.forEach((item, index) => {
                    if (this.downloadList[index].FileId == FileId) {
                        if (true == this.downloadList[index].paused) {
                            this.downloadList[index].isRemove = true;
                            let indexFile = { index: index, file: this.downloadList[index] }
                            this.$store.dispatch('downloadList/updateFile', indexFile)
                        } else {
                            this.downloadList[index].isRemove = true;
                            let indexFile = { index: index, file: this.downloadList[index] }
                            this.$store.dispatch('downloadList/updateFile', indexFile)
                            this.$electron.ipcRenderer.send('DOWNLOAD_REMOVE', FileId)
                        }
                    }
                })
            },
            retry (FileId) {
                let tempFile = [];
                this.downloadList.forEach((item, index) => {
                    if (this.downloadList[index].FileId == FileId) {

                        this.downloadList[index].paused = false;
                        this.downloadList[index].status = 'underway';
                        this.downloadList[index].isUnderway = true;
                        this.downloadList[index].error = false;

                        let indexFile = { index: index, file: this.downloadList[index] }
                        tempFile[index] = this.downloadList[index];
                        //this.$store.dispatch('downloadList/updateFile', indexFile)
                    }
                })
                //去除文件信息更新限制
                this.listenerStatus.downloadPause.forEach((item, index) => {
                    if ( this.listenerStatus.downloadPause[index].FileId == FileId) {
                         this.$store.dispatch('listenerStatus/deleteDownloadPause', index)
                    }
                })

                if (tempFile) {
                    console.log('重试========================================', tempFile);
                    this.$electron.ipcRenderer.send('DOWNLOAD_RETRY', tempFile)
                    this.$electron.ipcRenderer.send('DOWNLOAD_FILES', tempFile)
                }
            },
            openFileError (FileId) {
                console.log('openFileError===================================', FileId);
                this.fileErrorList = [];
                this.downloadList.forEach((item, index) => {
                    if (this.downloadList[index].FileId == FileId) {
                        this.downloadList[index].Urls.forEach((item1, index1) => {
                            if (true === item1.error) {
                                this.fileErrorList.push(item1);
                            }
                        })
                    }
                })
                if (this.fileErrorList.length > 0) {
                    this.fileError = true;
                } else {
                    this.$Message.info('请求超时');
                }
            },
            closeFileError () {
                this.fileError = false;
            },
            //全部暂停
            downloadPauseAll () {
                //清空  vuex---listenerStatus-downloadPause
                this.$store.dispatch('listenerStatus/initSelfDownloadPause', []);
                //限制文件更新
                this.$store.dispatch('listenerStatus/downloadPauseAll', true)
                //清空主进程 文件下载队列和文件块下载队列
                this.$electron.ipcRenderer.send('DOWNLOAD_CLEAR_ALL', {event: 'DOWNLOAD_CLEAR_ALL_CALL', status: true});
            },
            //全部开始
            downloadStartAll () {
                //清空  vuex---listenerStatus-downloadPause
                this.$store.dispatch('listenerStatus/initSelfDownloadPause', []);
                this.$store.dispatch('listenerStatus/downloadPauseAll', false)
                let tempFile = [];
                this.downloadList.forEach((item, index) => {
                    this.downloadList[index].paused = false;
                    this.downloadList[index].error = false;

                    let indexFile = { index: index, file: this.downloadList[index] }
                    tempFile[index] = this.downloadList[index];
                    this.$store.dispatch('downloadList/updateFile', indexFile)
                })
                this.$electron.ipcRenderer.send('DOWNLOAD_FILES', tempFile)
            },
            //全部取消  下载文件
            downloadRemoveAll () {
                let pauseAll = true;
                this.downloadList.forEach((item, index) => {
                    if (true === item.isUnderway) {
                        pauseAll = false;
                    }
                })
                //所有文件处于暂停状态  只需要处理 vuex 和 db
                if (true === pauseAll) {
                    console.log('==============处于暂停状态==================');
                    //清空  vuex---downloadList 和 db---downloadList
                    this.$store.dispatch('downloadList/removeAll', fns.getStorage('remember_username'))
                } else {
                    //清空  vuex---listenerStatus-downloadPause
                    this.$store.dispatch('listenerStatus/initSelfDownloadPause', []);
                    //限制文件更新
                    this.$store.dispatch('listenerStatus/downloadRemoveAll', true)
                    this.$store.dispatch('downloadList/removeAll', fns.getStorage('remember_username'))
                    //清空主进程 文件下载队列和文件块下载队列
                    this.$electron.ipcRenderer.send('DOWNLOAD_CLEAR_ALL', {event: 'DOWNLOAD_CLEAR_ALL_CALL', status: true});
                }

            }
        },
        components: {
            Downloader
        }
    }
    export default download
</script>

<style>

</style>
