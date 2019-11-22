<style>
.trees{border: 1px solid #f2f2f2;}
.ivu-progress{width: 80% !important;}
.demo-upload-list{border-bottom: 1px solid #dcdee2;margin-top: 10px;}
.paging{
    float:right;
    margin-top:-5px;
    margin-right: 35px;
}
</style>
<template>
    <div>
        <div style="height:30px">
            <!-- <uploader-btn @addFileBtn="addFileBtn">上传</uploader-btn> -->

            <Button class="btn-self" @click="downloadFileBtn" >
                <svg class="icon-self-operate" aria-hidden="true" >
                    <use xlink:href="#icons-download"></use>
                </svg>
                下载
            </Button>

            <!-- <Button class="btn-self" @click="makeFolder = true" >
                <svg class="icon-self-operate" aria-hidden="true" >
                    <use xlink:href="#icons-add-folder"></use>
                </svg>
                新建文件夹
            </Button>
            <Modal v-model="makeFolder" title="新建文件夹" @on-ok="makeOk" @on-cancel="makeCancel">
                文件夹名称：<Input v-model="cm_folder_name" style="width: 300px" />
            </Modal> -->

            <Button class="btn-self" @click="sureExpire" >
                <svg class="icon-self-operate" aria-hidden="true" >
                    <use xlink:href="#icons-share"></use>
                </svg>
                分享文件
            </Button>

            <!-- <Button class="btn-self" @click="forlderJointly" >
                <svg class="icon-self-operate" aria-hidden="true" >
                    <use xlink:href="#icons-jointly"></use>
                </svg>
                共享
            </Button> -->

            <Dropdown placement="bottom-end">
                <Button class="btn-self">
                    更多
                    <svg class="icon-self-operate" aria-hidden="true" >
                        <use xlink:href="#icons-arrow-bottom"></use>
                    </svg>
                </Button>
                <DropdownMenu slot="list">
                    <!-- <DropdownItem @click.native="moveFloder"><Icon type="md-swap" /> 移动</DropdownItem> -->
                    <DropdownItem @click.native="deleteFloder"><Icon type="ios-trash" /> 删除</DropdownItem>
                </DropdownMenu>
            </Dropdown>

            <Button class="btn-self" @click="refresh" >
                <svg class="icon-self-operate" aria-hidden="true" >
                    <use xlink:href="#icons-refresh"></use>
                </svg>
                刷新
            </Button>

            <Input search enter-button placeholder="输入文件或文件夹名称..." style="width: auto;float:right;" @on-search="searchName" />

            <ButtonGroup style="float: right;margin-right: 10px;">
                <Button v-if="'ngs' === this.platform" type="primary" @click="switchPlatform('ngs')">Ngs</Button>
                <Button v-if="'ngs' !== this.platform" @click="switchPlatform('ngs')">Ngs</Button>
                <Button v-if="'cloud' === this.platform" type="primary" @click="switchPlatform('cloud')">Cloud</Button>
                <Button v-if="'cloud' !== this.platform" @click="switchPlatform('cloud')">Cloud</Button>
            </ButtonGroup>

        </div>
        <div style="margin-top: 12px;">
            <Spin fix v-show="isSpinInitShow">
                <Icon type="ios-loading" size=18 class="demo-spin-icon-load"></Icon>
                <div>Loading</div>
            </Spin>
            <Breadcrumb style="height: 21px;">
                <BreadcrumbItem to="/"  v-for="(item,index) in breadList">
                    <span @click="choiseBread(item.cm_folder_pid, item.cm_folder_id)">
                    <Icon  v-if="index==0" type="ios-home-outline"></Icon>
                    <Icon  v-if="index>0" type="ios-folder-outline"></Icon> 
                    {{item.cm_folder_name}}
                    </span>
                </BreadcrumbItem>
            </Breadcrumb>
            <div ref="header"></div>
            <Table 
                :height="this.tableHeight"
                :columns="folderColumns" 
                :data="folderData"
                ref="table" 
                @on-select="selectOne" 
                @on-row-click="clickRows"
                @on-row-dblclick="dbclickRows"
                @on-select-all="selectAll"
                @on-selection-change="selectChange"
                :highlight-row="true">
                <template slot-scope="{ row, index }" slot="cm_folder_name">
                    <Spin fix v-show="isSpinShow">
                        <Icon type="ios-loading" size=18 class="demo-spin-icon-load"></Icon>
                        <div>Loading</div>
                    </Spin>
                    <div v-if="0 !== row.cm_is_file">
                        <svg class="icon-self-file" aria-hidden="true" >
                            <use xlink:href="#icons-open-file-filled"></use>
                        </svg>
                        <span :class="{ listSpan: true }" :style="{ display: row.disSpan }" :title="row.cm_folder_name" >{{row.cm_folder_name}}</span>

                        <Input :class="{ editInput: true }"  :style="{ display: row.disInput }" type="text" :value="preFileName(row.cm_folder_name)" @on-change="fileNameChange($event, index)" />

                        <span v-show="index == editShow" title="修改">
                            <svg class="icon-self-operate" aria-hidden="true"  :style="{ display: row.disSpan }" @click="fileRename(index)" >
                                <use xlink:href="#icons-rename"></use>
                            </svg>
                        </span>
                        
                        <span title="确认">
                            <svg class="icon-self-operate" aria-hidden="true"  :style="{ display: row.disInput }" @click="fileSureName(index)" >
                                <use xlink:href="#icons-sure"></use>
                            </svg>
                        </span> 
                    </div>
                    <div v-else>
                        <svg v-if="0 === row.cm_jointly_st" class="icon-self-folder" aria-hidden="true" >
                            <use xlink:href="#icons-folder"></use>
                        </svg>
                        <svg v-if="0 !== row.cm_jointly_st" class="icon-self-folder" aria-hidden="true" >
                            <use xlink:href="#icons-folder-jointly"></use>
                        </svg>

                        <span :class="{ listSpan: true }" :style="{ display: row.disSpan }" :title="row.cm_folder_name">
                            <span @click="folderClickName(row)" style="cursor: pointer;color: #2b85e4;">{{row.cm_folder_name}}</span>
                        </span>
                        <span v-show="row.cm_folder_text != ''"><br>{{row.cm_folder_text}}</span>

                        <Input :class="{ editInput: true }"  :style="{ display: row.disInput }" type="text" :value="row.cm_folder_name" @on-change="folderNameChange($event, index)" />

                        <span v-show="index == editShow" title="修改">
                            <svg class="icon-self-operate" aria-hidden="true"  :style="{ display: row.disSpan }" @click="folderRename(index)" >
                                <use xlink:href="#icons-rename"></use>
                            </svg>
                        </span>

                        <span title="确认">
                            <svg class="icon-self-operate" aria-hidden="true"  :style="{ display: row.disInput }" @click="folderSureName(index)" >
                                <use xlink:href="#icons-sure"></use>
                            </svg>
                        </span>
                    </div>

                </template>
            </Table>
        </div>
        <Page :total="dataCount" :page-size="pageSize" size="small" class="paging" show-elevator show-total @on-change="changePage"></Page>

        <Modal v-model="moveFloderLayer" title="移动到" @on-ok="moveOk" @on-cancel="moveCancel">
            <div class="trees">
                <Tree :data="data1"  :render="renderContent"></Tree>
            </div>
        </Modal>

        <Modal 
            v-model="shareLayer" 
            title="选择分享有效期" 
            :styles="{top: '200px'}"
            :width="420">
                <RadioGroup  v-model="expireTime">
                    <Radio :label="7">7天</Radio>
                    <Radio :label="30">1个月</Radio>
                    <Radio :label="90">3个月</Radio>
                    <Radio :label="180">6个月</Radio>
                    <Radio :label="360">1年</Radio>
                </RadioGroup >
                <div slot="footer">
                <Button type="info" @click="shareFile">确认</Button>
                </div>  
        </Modal>

        <Modal 
            v-model="extractLayer" 
            title="分享文件" 
            :styles="{top: '200px'}"
            :width="520">
                <!-- <p>分享链接：{{extract_data.cm_share_link}}</p>
                <div style="height: 10px"></div> -->
                <p>提取密码：{{extract_data.cm_share_key}}
                    <input type="hidden" v-model="extract_data.cm_share_key">
                    <Button type="dashed" shape="circle" size="small" style="color: #4a83ea;border-color: #4a83ea;"
                    v-clipboard:copy="extract_data.cm_share_key"
                    v-clipboard:success="onCopy"
                    v-clipboard:error="onError">点击复制</Button>
                </p>
                <div slot="footer">
                <Button type="info" @click="closeExtract">关闭</Button>
                </div>  
        </Modal>

        <Modal v-model="jointlyLayer" :width="720" title="选择共享人员" @on-ok="jointlyOk">
            <!-- <div class="demo-upload-list" v-for="item in userList">
                <p>用户名称：{{item.cm_user_nickname}} </p>
                <p>用户头像：{{item.cm_user_avatar}} </p>
            </div> -->
            <Transfer
            :data="data2"
            :target-keys="targetKeys2"
            filterable
            :titles="['可选人员列表', '已选人员列表']"
            :filter-method="filterMethod"
            :list-style="{width: '300px'}"
            @on-change="handleChange2">
            </Transfer>
        </Modal>

    </div>
</template>

<script>
    import {mapState,mapGetters,mapActions} from 'vuex';
    import UploaderBtn from '../components/uploader-btn.vue';
    import { formatedSize } from '../utils/utils';
    import db from '../../datastore/db'; // 取决于你的datastore.js的位置
    import { tableMixin } from '../common/mixins';
    import path from 'path'
    const fs = require('fs');
    const md5 = require('md5');

    var ceph = {
        name: 'ceph',
        mixins: [tableMixin],
        userInfo: {cm_user_id: 0,cm_bucket_id: 0},//模块间用
        data() {
            return {
                platform: fns.getStorage('middle_flag'),
                cm_bucket_id: '',
                cm_user_id: '',
                cm_user_username: '',
                cm_folder_pid: 0,
                cm_folder_name: '',

                extract_data: {cm_share_link: '',cm_share_key: ''},
                expireTime: 360,
                makeFolder: false,
                moveFloderLayer: false,
                shareLayer: false,
                extractLayer: false,
                jointlyLayer: false,
                selectList:[],
                userList:[],
                selectRows:{},
                choiseFolder:{},
                breadList:{},
                editShow: -1,
                folderColumns: [
                    {
                        type: 'selection',
                        width: 60,
                        align: 'center'
                    },
                    {
                        title: '名称',
                        key: 'cm_folder_name',
                        slot: 'cm_folder_name',
                        width: 500,
                    },
                    {
                        title: '大小',
                        key: 'cm_folder_size',
                    },
                    {
                        title: '过期时间',
                        key: 'cm_expire_ts'
                    },
                    // {
                    //     title: '更新时间',
                    //     key: 'cm_update_ts'
                    // }
                ],
                folderData: [],
                dataCount: 0,
                pageSize: 0,
                page: 1,
                data1: [],
                data2: [],
                targetKeys2: [],
                isSpinShow: false,
                isSpinInitShow: true,
            }
        },
        created() {
            console.log('全局监听者状态==========================', this.listenerStatus,this.listenerStatus.initOnce);
            //初始化监听者
            if (false === this.listenerStatus.initOnce) {
                //上传错误
                this.$electron.ipcRenderer.on('UPLOAD_ERROR', (e, error) => {
                    console.log('UPLOAD_ERROR---------------------渲染层', e, error);
                    this.errorLoger(error);
                });
                //上传开始
                this.$electron.ipcRenderer.on('UPLOAD_START', (e, data) => {
                    console.log('UPLOAD_START---------------------渲染层', e, data);
                });
                //上传进度
                this.$electron.ipcRenderer.on('UPLOAD_PROGRESS', (e, file) => {
                    this.updateUploadList(file.param)
                });
                //上传成功
                this.$electron.ipcRenderer.on('UPLOAD_SUCCESS', (e, file) => {
                    console.log('UPLOAD_SUCCESS------------------渲染层', e, file);
                    file.data.statusText = '上传完成';
                    this.updateUploadList(file.data)
                    if (true === file.data.jointly) {
                        this.saveMessageJointly(file.data)
                    } else {
                        this.saveMessage(file.data)
                    }
                });
                //上传队列清空事件
                this.$electron.ipcRenderer.on('UPLOAD_CLEAR_ALL_CALL', (e, status) => {
                    console.log('UPLOAD_CLEAR_ALL_CALLL=========================', this.listenerStatus);
                    if (true === this.listenerStatus.uploadPauseAll) {
                        //设置所有文件暂停
                        this.uploadList.forEach((item, index) => {
                            this.uploadList[index].paused = true;
                            this.uploadList[index].status = 'waiting';
                            this.uploadList[index].isUnderway = false;
                            
                            let indexFile = { index: index, file: this.uploadList[index] }
                            this.$store.dispatch('uploadList/updateFile', indexFile)
                        })
                        //解除 由于全部暂停产生的文件更新限制
                        this.$store.dispatch('listenerStatus/uploadPauseAll', false);
                    }
                    if (true === this.listenerStatus.uploadRemoveAll) {
                        //清空  vuex---downloadList 和 db---downloadList
                        this.$store.dispatch('uploadList/removeAll', this.cm_user_id)
                        
                        //解除 由于全部取消产生的文件更新限制
                        this.$store.dispatch('listenerStatus/uploadRemoveAll', false);
                    }
                });

                //下载错误
                this.$electron.ipcRenderer.on('DOWNLOAD_ERROR', (e, error) => {
                    console.log('DOWNLOAD_ERROR------------------渲染层', e, error);
                    //this.errorLoger(error);
                });
                //下载开始
                this.$electron.ipcRenderer.on('DOWNLOAD_START', (e, file) => {
                    console.log('---DOWNLOAD_START------------------渲染层', e, file);
                    this.$nextTick(() => {
                        this.$store.dispatch('downloadList/pushList', file.data);
                    });
                });
                //下载进度
                this.$electron.ipcRenderer.on('DOWNLOAD_PROGRESS', (e, file) => {
                    //console.log('---DOWNLOAD_PROGRESS------------------渲染层', e, file);
                    this.$nextTick(() => {
                        this.updateDownloadList(file.data);
                    });
                });
                //下载重试
                this.$electron.ipcRenderer.on('DOWNLOAD_ERROR_NET', (e, file) => {
                    console.log('DOWNLOAD_ERROR_NET------------------渲染层', e, file);
                    this.updateDownloadListError(file.data)
                });
                //自动下载
                this.$electron.ipcRenderer.on('DOWNLOAD_AUTO', (e, status) => {
                    this.downloadFileBtn();
                });
                //开启监听状态
                this.$store.dispatch('listenerStatus/initOnce', true)
                //下载队列清空事件
                this.$electron.ipcRenderer.on('DOWNLOAD_CLEAR_ALL_CALL', (e, status) => {
                    console.log('DOWNLOAD_CLEAR_ALL_CALL=========================', this.listenerStatus);
                    if (true === this.listenerStatus.downloadPauseAll) {
                        //设置所有文件暂停
                        this.downloadList.forEach((item, index) => {
                            this.downloadList[index].paused = true;
                            this.downloadList[index].status = 'waiting';
                            this.downloadList[index].isUnderway = false;
                            
                            let indexFile = { index: index, file: this.downloadList[index] }
                            this.$store.dispatch('downloadList/updateFile', indexFile)
                        })
                        //解除 由于全部暂停产生的文件更新限制
                        this.$store.dispatch('listenerStatus/downloadPauseAll', false);
                    }
                    if (true === this.listenerStatus.downloadRemoveAll) {
                        //清空  vuex---downloadList 和 db---downloadList
                        this.$store.dispatch('downloadList/removeAll', this.cm_user_id)
                        
                        //解除 由于全部取消产生的文件更新限制
                        this.$store.dispatch('listenerStatus/downloadRemoveAll', false);
                    }

                });

            }
        },
        mounted(){
            console.log('db--------------------------all', db.read().value());
            //初始化
            this.cm_bucket_id = fns.getStorage('remember_bucket_id');
            this.cm_user_id = fns.getStorage('remember_user_id');
            this.cm_user_username = fns.getStorage('remember_username');
            this.getUserFolderList(0, this.cm_bucket_id, this.cm_user_id, this.page);

            if (0 === Number(this.uploadList.length)) {
                let dbUpload = [];
                dbUpload = db.read().get('upload').value();
                console.log('初始化上传列表===================所有', dbUpload);
                if (dbUpload.length > 0) {
                    let tempFile = [];
                    Array.from(dbUpload).forEach((item, index) => {
                        if (this.cm_user_username == item.username) {
                            this.$store.dispatch('uploadList/initList', item)
                            tempFile.push(item);
                            if (true === item.paused) {
                                this.$store.dispatch('listenerStatus/pushUploadPause', {FileId: item.FileId, status: true})
                            }
                        }
                    });
                    console.log('初始化上传列表===================用户', tempFile);
                    this.$electron.ipcRenderer.send('UPLOAD_FILES', tempFile)
                }
            }

            if (0 === Number(this.downloadList.length)) {
                let dbDownload = [];
                dbDownload = db.read().get('download').value();
                console.log('初始化下载列表===================所有', dbDownload, this.cm_user_id);
                if (dbDownload.length > 0) {
                    let folderIds = [];
                    Array.from(dbDownload).forEach((item, index) => {
                        if (this.cm_user_username == item.username) {
                            folderIds.push(item.id);
                        }
                    });
                    this.$axios({
                        method: 'post',
                        url: apis.getUrl('folder_url_update'),
                        data: {cm_folder_ids: folderIds, cm_user_id: this.cm_user_id}
                    })
                    .then(res => {
                        if (res.data.c === 0) {
                            let urlData = res.data.d;
                            let tempFile = [];
                            Array.from(dbDownload).forEach((item, index) => {
                                if (this.cm_user_username == item.username) {
                                    //更新url
                                    if (urlData[item.id].length > 0) {
                                        item.Urls =  urlData[item.id];
                                    }
                                    //其余初始化
                                    this.$store.dispatch('downloadList/initList', item);
                                    tempFile.push(item);
                                    if (true === item.paused) {
                                        this.$store.dispatch('listenerStatus/pushDownloadPause', {FileId: item.FileId, status: true})
                                    }
                                }
                            });
                            console.log('初始化下载列表===================用户', tempFile, this.downloadList);
                            this.$electron.ipcRenderer.send('DOWNLOAD_FILES', tempFile)
                        } else {
                            this.$Message.error(res.data.m);
                        }
                    });
                }
            }

            if (0 === Number(this.completedList.length)) {
                let dbCompleted = [];
                dbCompleted = db.read().get('completed').value();
                if (dbCompleted.length > 0) {
                    let tempFile = [];
                    Array.from(dbCompleted).forEach((item, index) => {
                        if (this.cm_user_username == item.username) {
                            tempFile.push(item);
                        }
                    });
                    this.$store.dispatch('completedList/initList', tempFile);
                }
            }

        },
        computed: {
            ...mapGetters('uploadList',{ //用mapGetters来获取uploadList.js里面的getters
                uploadList:'getList'
            }),
            ...mapGetters('downloadList',{ 
                downloadList:'getList'
            }),
            ...mapGetters('completedList',{ 
                completedList:'getList'
            }),
            ...mapGetters('listenerStatus',{ 
                listenerStatus:'getList'
            })
        },
        beforeUpdate () {
            // console.log('this.$refs===================================', document.body.clientHeight, this.$refs.header.offsetHeight, this.tableHeight);
            this.tableHeight = document.body.clientHeight - (this.$refs.header.offsetHeight + 220) + "px";

            //放在mounted  切换路由时不会运行
            // this.$nextTick(() => {
            //     //注意 箭头函数  不然this不能传递到里面
            //     document.getElementsByClassName("ivu-table-tbody")[0].addEventListener("mouseenter", () => {
            //         //console.log('0000000000000===============', this, document.getElementsByClassName("ivu-table-row"));
            //         let objs =  document.getElementsByClassName("ivu-table-row");
            //         for (let i = 0; i < objs.length; i++) {
            //             objs[i].addEventListener("mouseenter", () => {
            //                 this.editShow = i;
            //             }) 

            //             objs[i].addEventListener("mouseleave", () => {
            //                 this.editShow = -1;
            //             }) 
            //         }
            //     }) 
            // })
        },
        methods: {
            getUserFolderList(cm_folder_pid, cm_bucket_id, cm_user_id, cm_page, cm_name_like = ''){
                let map = {'cm_folder_pid': cm_folder_pid, 'cm_bucket_id': cm_bucket_id, 'cm_user_id': cm_user_id, 'cm_page': cm_page, 'cm_name_like': cm_name_like};
                this.isSpinShow = true;
                this.$axios({
                    method: 'post',
                    url: apis.getUrl('folder_browse'),
                    data: map
                })
                .then(res => {
                    if (res.data.c === 0) {
                        this.folderData = res.data.d.folder;
                        this.breadList  = res.data.d.bread;
                        this.dataCount  = res.data.d.count;
                        this.pageSize   = res.data.d.pageSize
                    } else {
                        this.$Message.error(res.data.m);
                    }
                    this.isSpinShow = false;
                    this.isSpinInitShow = false;
                });
            },
            refresh(){
                this.getUserFolderList(this.cm_folder_pid, this.cm_bucket_id, this.cm_user_id, 1);
            },
            changePage(page){
                this.page = page;
                this.getUserFolderList(this.cm_folder_pid, this.cm_bucket_id, this.cm_user_id, this.page);
            },
            searchName(name){
                this.getUserFolderList(this.cm_folder_pid, this.cm_bucket_id, this.cm_user_id, 1, name);
            },
            getBreadList(cm_folder_pid){
                var map = {'cm_folder_pid':cm_folder_pid};
                console.log('aaaaaaa', map);
                this.$axios({
                    method: 'post',
                    url: apis.getUrl('folder_bread'),
                    data: map
                })
                .then(res => {
                    if (res.data.c === 0) {
                        //提示消息
                        //this.$Message.success('获取成功！');
                        //模板列表赋值
                        console.log('getBreadList-----------------------', res.data.d);
                        this.breadList = res.data.d;

                    } else {
                        this.$Message.error(res.data.m);
                    }
                    this.loading = false;
                });
            },
            choiseBread(cm_folder_pid, cm_folder_id){
                this.selectList = [];
                this.cm_folder_pid = cm_folder_id;
                this.getUserFolderList(cm_folder_id, this.cm_bucket_id, this.cm_user_id, 1);
            },
            makeOk () {
                var add_data = {'cm_folder_pid':this.cm_folder_pid, 'cm_folder_name':this.cm_folder_name, 'cm_bucket_id':this.cm_bucket_id, 'cm_user_id':this.cm_user_id};
                this.$axios({
                    method: 'post',
                    url: apis.getUrl('folder_create'),
                    data: add_data
                })
                .then(res => {
                    if (res.data.c === 0) {
                        //提示消息
                        this.$Message.success('添加成功！');
                        this.getUserFolderList(this.cm_folder_pid, this.cm_bucket_id, this.cm_user_id, this.page);
                    } else {
                        this.$Message.error(res.data.m);
                    }
                    this.loading = false;
                });
            },
            makeCancel () {
                this.$Message.info('Clicked cancel');
            },
            errorLoger (param) {
                this.$axios({
                    method: 'post',
                    url: apis.getUrl('object_error_loger'),
                    data: param
                })
                .then(res => {
                    console.log('日志返回', res);
                    //this.$Message.error('发生错误');
                });
            },
            // checkUpdate () {
            //     this.$electron.ipcRenderer.send('CHECK_UPDATE')
            // },
            //通过上传按钮 上传文件
            addFileBtn (files) {
                let uploadList = [];
                Array.from(files).forEach((item, index) => {
                    let obj = {
                        UserId: this.cm_user_id,
                        /********文件基本信息********/
                        name: item.name,
                        path: item.path,
                        size: item.size,
                        type: item.type,
                        extension: item.extension,

                        progress: 0,
                        formatedSize:  formatedSize(item.size),
                        uploadedSize: 0,
                        timeRemaining: 0,
                        averageSpeed: 0,

                        FileId: md5(item.name+(new Date()).valueOf()),

                        /********文件重要指标信息********/
                        operate: 'upload',
                        status:  'waiting',
                        statusText: '',
                        paused:  false,
                        error:  false,
                        isComplete:  false,
                        isUnderway: false,
                        isRemove: false,
                        isFolder:  false,
                        
                        /*******fs 和 s3 重要字段*******/
                        UploadId: '',
                        Parts: [],
                        Key: md5(item.name+(new Date()).valueOf())+item.extension,
                        Bucket: fns.getStorage('remember_bucket_name'),

                        chunkNum: 0,
                        pieces: 0,
                        chunkSize: 0,
                        endData: 0,

                        cm_folder_pid: this.cm_folder_pid,
                        jointly: false
                    }
                    this.$store.dispatch('uploadList/pushList', obj)
                    uploadList.push(obj);
                })
                console.log('上传文件===============================', uploadList);
                this.$electron.ipcRenderer.send('UPLOAD_FILES', uploadList)
            },
            //更新文件列表 vuex
            updateUploadList (file) {
                let isUpdate = true;
                this.listenerStatus.uploadPause.forEach((item, index) => {
                    if ( this.listenerStatus.uploadPause[index].FileId == file.FileId) {
                        isUpdate = false;
                    }
                })
                if (true === this.listenerStatus.uploadPauseAll) {
                    isUpdate = false;
                }
                if (true === this.listenerStatus.uploadRemoveAll) {
                    isUpdate = false;
                }

                console.log('更新状态==========================', isUpdate, this.uploadList);
                this.uploadList.forEach((item, index) => {
                    if (this.uploadList[index].FileId == file.FileId) {
                        if (true === isUpdate) {
                            let indexFile = { index: index, file: file }
                            this.$store.dispatch('uploadList/updateFile', indexFile);
                            this.$store.dispatch('completedList/pushList', file);
                        }
                    }
                })
            },
            //保存文件信息
            saveMessage (param) {
                let fileMessage = {
                    cm_bucket_id: fns.getStorage('remember_bucket_id'),
                    cm_folder_pid: param.cm_folder_pid ? param.cm_folder_pid : 0,
                    type: param.extension.substring(1),
                    key: param.Key,
                    files_name: param.name,
                    files_size: param.formatedSize,
                    files_size_byte: param.size,
                };
                this.$axios({
                    method: 'post',
                    url: apis.getUrl('object_save_message'),
                    data: fileMessage
                })
                .then(res => {
                    if (res.data.c === 0) {
                        this.$Message.success('上传成功！');
                        this.getUserFolderList(this.cm_folder_pid, this.cm_bucket_id, this.cm_user_id, this.page);
                    } else {
                        this.$Message.error(res.data.m);
                    }
                });
            },
            //共享保存文件信息
            saveMessageJointly (param) {
                let fileMessage = {
                    cm_bucket_id: param.cm_bucket_id,
                    cm_folder_pid: param.cm_folder_pid ? param.cm_folder_pid : 0,
                    type: param.extension.substring(1),
                    key: param.Key,
                    files_name: param.name,
                    files_size: param.formatedSize,
                    files_size_byte: param.size,
                    cm_owner_id: param.cm_owner_id,
                };
                this.$axios({
                    method: 'post',
                    url: apis.getUrl('object_save_message_jointly'),
                    data: fileMessage
                })
                .then(res => {
                    if (res.data.c === 0) {
                        this.$Message.success('上传成功！');
                        this.getUserFolderList(this.cm_folder_pid, this.cm_bucket_id, this.cm_user_id, this.page);
                    } else {
                        this.$Message.error(res.data.m);
                    }
                });
            },
            downloadBeforeCheck () {
                let dbPath = db.read().get('userData').find({ username: this.cm_user_username }).value();
                console.log('dbPath===========================', typeof(dbPath));
                if ('undefined' === typeof(dbPath)) {
                    this.$Modal.confirm({
                        title: '提示消息',
                        content: '<p>是否现在设置文件下载路径</p>',
                        onOk: () => {
                            this.$electron.ipcRenderer.send('DOWNLOAD_PATH', {username: this.cm_user_username, status:true});
                        },
                        onCancel: () => {
                        }
                    });
                    return false;
                }
            },
            //通过点击按钮下载文件
            downloadFileBtn () {
                this.downloadBeforeCheck();
                let dbPath = db.read().get('userData').find({ username: this.cm_user_username }).value();
                if ('undefined' === typeof(dbPath)) { return false;}

                if(this.selectList.length <= 0){
                    this.$Message.error('请勾选文件需要下载的文件！');
                    this.selectList = [];
                    return false;
                }
                //正在下载
                let Already = true;
                let downAlready = [];
                Array.from(this.downloadList).forEach((item, index) => {
                    downAlready.push(item.name);
                });
                Array.from(this.selectList).forEach((item, index) => {
                    if (downAlready.indexOf(item.cm_folder_name) !== -1) {
                        this.$Message.error('已在下载列表中');
                        Already = false;
                    }
                });
                if (false === Already) {
                    return false;
                }

                this.$axios({
                    method: 'post',
                    url: apis.getUrl('folder_batch_down'),
                    data: this.selectList
                })
                .then(res => {
                    if (res.data.c === 0) {
                        let downloadList = [];
                        downloadList = res.data.d;
                        Array.from(downloadList).forEach((item, index) => {
                            //如果下载文件存在
                            if (fs.existsSync(path.join(dbPath.path, `\\${item.name}`))) {
                                downloadList[index].name = item.time+item.name;
                                if (downloadList[index].folder_path) {
                                    Array.from(downloadList[index].folder_path).forEach((item1, index1) => {
                                        downloadList[index].folder_path[index1] = item.time+item1;
                                    });
                                }
                                if (downloadList[index].file_path) {
                                    Array.from(downloadList[index].file_path).forEach((item2, index2) => {
                                        downloadList[index].file_path[index2] = item.time+item2;
                                    });
                                }
                                if (downloadList[index].Urls) {
                                    Array.from(downloadList[index].Urls).forEach((item3, index3) => {
                                        downloadList[index].Urls[index3].path = item.time+item3.path;
                                    });
                                }
                            }

                            downloadList[index].downloads = dbPath.path;
                        })
                        this.$electron.ipcRenderer.send('DOWNLOAD_FILES', downloadList)
                    } else {
                        this.$Message.error(res.data.m);
                    }
                });

                
            },
            //更新文件下载列表 vuex
            updateDownloadList (file) {
                let isUpdate = true;
                this.listenerStatus.downloadPause.forEach((item, index) => {
                    if (this.listenerStatus.downloadPause[index].FileId == file.FileId) {
                        isUpdate = false;
                    }
                })
                if (true === this.listenerStatus.downloadPauseAll) {
                    isUpdate = false;
                }
                if (true === this.listenerStatus.downloadRemoveAll) {
                    isUpdate = false;
                }
                
                //console.log('===================文件更新状态===================', isUpdate, this.listenerStatus);
                this.downloadList.forEach((folder, index) => {
                    if (folder.FileId == file.FileId) {
                        let chunkNumCurrent = file.chunkNumCurrent - 1;
                        folder.Parts[chunkNumCurrent].receivedBytes = file.Parts[chunkNumCurrent].receivedBytes
                        //console.log('-----------当前块-----------', folder.Parts[chunkNumCurrent]);
                        
                        //相关信息修改
                        folder.error  = file.error;
                        folder.paused = file.paused;
                        folder.status = file.status;
                        folder.isUnderway = file.isUnderway;
                        folder.isRemove   = file.isRemove;
                        
                        folder.receivedBytes = folder.receivedBytes + file.averageSpeed;
                        folder.progress = parseInt((folder.receivedBytes * 100) / folder.totalBytes);
                        folder.milliTime = folder.milliTime + file.milliTime;
                        folder.averageSpeed = Math.ceil(folder.receivedBytes / Math.ceil(folder.milliTime / 1000)) * 3;//平均速度 与 worker 数有关
                        console.log('原来的字节----------接收的字节----------总接收的字节', this.downloadList[index].receivedBytes, file.averageSpeed, folder.receivedBytes);
                        // console.log('平均速度--------------所消耗总时间', folder.averageSpeed, folder.milliTime);

                        //处理文件块是否完成的状态标识
                        if (folder.Parts[chunkNumCurrent].totalBytes == folder.Parts[chunkNumCurrent].receivedBytes) {
                            folder.Parts[chunkNumCurrent].isComplete = true;
                        }
                        //文件完成
                        if (folder.progress == 100) {
                            console.log('----------总接收的字节----------', folder.receivedBytes);
                            if (folder.receivedBytes !== this.downloadList[index].totalBytes) {
                                console.log('源文件大小-----------失败数据-----------下载文件大小', this.downloadList[index].totalBytes, folder.receivedBytes);
                                folder.status = 'error';
                                folder.error  = true;
                                folder.isUnderway = false;
                                folder.statusText = '下载失败';
                                this.$Message.error('下载失败！');
                                return false;
                            }
                            folder.status = 'success';
                            folder.isUnderway = false;
                            folder.isComplete = true;
                            folder.statusText = '下载完成';
                            folder.Parts = [];
                            this.$store.dispatch('completedList/pushList', folder)
                        }
                        //文件下载列表更新
                        if (true === isUpdate) {
                            console.log('===================文件更新状态===================', isUpdate, this.listenerStatus);
                            let indexFile = { index: index, file: folder }
                            this.$store.dispatch('downloadList/updateFile', indexFile);
                        }
                    }
                })
            },
            updateDownloadListError (file) {
                let isUpdate = true;
                this.listenerStatus.downloadPause.forEach((item, index) => {
                    if ( this.listenerStatus.downloadPause[index].FileId == file.FileId) {
                        isUpdate = false;
                    }
                })
                console.log('文件网络错误信息更新状态=====================', isUpdate);
                this.downloadList.forEach((item, index) => {
                    if (this.downloadList[index].FileId == file.FileId) {
                        if (true === isUpdate) {
                            this.downloadList[index].error = true;
                            this.downloadList[index].status = 'error';
                            this.downloadList[index].paused = true;
                            this.downloadList[index].isUnderway = false;

                            let indexFile = { index: index, file: this.downloadList[index] }
                            this.$store.dispatch('downloadList/updateFile', indexFile)
                        }
                    }
                })
            },
            selectOne(selection, row){
                console.log('selection----------------row', selection, row);
                this.selectList = selection;
                this.selectRows = row;
            },
            selectAll(selection){
                console.log('selectAll----------------selection', selection);
                this.selectList = selection;
            },
            clickRows(row, index){
                this.$refs.table.toggleSelect(index);
                console.log('selectAll----------------row', this.selectList);
                
            },
            selectChange(selection){
                this.selectList = selection;
            },
            dbclickRows(row, index){
                if(row.cm_is_file == 0){
                    this.selectList = [];
                    this.cm_folder_pid = row.cm_folder_id;
                    this.getUserFolderList(row.cm_folder_id, row.cm_bucket_id, row.cm_user_id, 1)
                }
            },
            deleteFloder(){
                if(this.selectList.length <= 0){this.$Message.error('请勾选文件或者文件夹！');return false;}
                this.$Modal.confirm({
                    title: '提示消息',
                    content: '<p>确认删除！！！</p>',
                    onOk: () => {
                        this.sureDeleteFloder();
                    },
                    onCancel: () => {
                        this.$Message.info('已取消');
                    }
                });
            },
            sureDeleteFloder () {
                this.$axios({
                    method: 'post',
                    url: apis.getUrl('folder_delete_logic'),
                    data: {'cm_folder_list': this.selectList, 'cm_user_id':this.cm_user_id}
                })
                .then(res => {
                    if (res.data.c === 0) {
                        this.$Message.success('删除成功！');
                        this.getUserFolderList(this.cm_folder_pid, this.cm_bucket_id, this.cm_user_id, this.page);
                    } else {
                        this.$Message.error(res.data.m);
                    }
                    this.loading = false;
                });
            },
            moveFloder(){
                if(this.selectList.length <= 0){this.$Message.error('请勾选文件或者文件夹！');return false;}
                this.getTreeData();
            },
            //文件名 操作
            preFileName (fileName) {
                return fileName.substr(0,fileName.lastIndexOf('.'));
            },
            fileNameChange (event, index) {
                this.folderData[index].new_name = event.target.value;
            },
            fileRename (index) {
                this.folderData[index].disSpan = "none";
                this.folderData[index].disInput = "inline-flex";
                this.folderData[index].new_name = "";
            },
            fileSureName (index) {
                this.folderData[index].disSpan = "inline-flex";
                this.folderData[index].disInput = "none";

                let fileType = this.folderData[index].cm_folder_name.split(".");
                fileType = fileType[fileType.length - 1].toLowerCase();
                this.folderData[index].new_name = this.folderData[index].new_name ? this.folderData[index].new_name + "." + fileType : this.folderData[index].cm_folder_name;
                let params = {
                    cm_folder_id: this.folderData[index].cm_folder_id,
                    cm_is_file: this.folderData[index].cm_is_file,
                    cm_folder_name: this.folderData[index].new_name,
                    cm_folder_pid: this.folderData[index].cm_folder_pid
                };
                if (this.folderData[index].cm_folder_name != params.cm_folder_name) {
                    this.editFileName(params);
                    this.folderData[index].cm_folder_name = params.cm_folder_name;
                    this.folderData[index].new_name = '';
                }
            },
            editFileName(param){
                this.$axios({
                    method: 'post',
                    url: apis.getUrl('object_edit'),
                    data: param
                })
                .then(res => {
                    if (res.data.c === 0) {
                        this.$Message.success('修改成功！');
                    } else {
                        this.$Message.error(res.data.m);
                        this.getUserFolderList(this.cm_folder_pid, this.cm_bucket_id, this.cm_user_id, this.page);
                    }
                    this.loading = false;
                });
            },
            //文件夹名 操作
            preFolderColor (cm_jointly_st) {
                return 0 === cm_jointly_st ? "#FFCC33" : "#19be6b";
            },
            folderClickName (row) {
                if(row.cm_is_file == 0){
                    this.selectList = [];
                    this.cm_folder_pid = row.cm_folder_id;
                    this.getUserFolderList(row.cm_folder_id, row.cm_bucket_id, row.cm_user_id, 1)
                }
            },
            folderNameChange (event, index) {
                this.folderData[index].new_name = event.target.value;
            },
            folderRename (index) {
                this.folderData[index].disSpan = "none";
                this.folderData[index].disInput = "inline-flex";
            },
            folderSureName (index) {
                this.folderData[index].disSpan = "inline-flex";
                this.folderData[index].disInput = "none";
                this.folderData[index].new_name = this.folderData[index].new_name ? this.folderData[index].new_name : this.folderData[index].cm_folder_name;
                let params = {
                    cm_folder_id: this.folderData[index].cm_folder_id,
                    cm_folder_name: this.folderData[index].new_name,
                    cm_folder_pid: this.folderData[index].cm_folder_pid
                };
                if (this.folderData[index].cm_folder_name != params.cm_folder_name) {
                    this.editFolderName(params);
                    this.folderData[index].cm_folder_name = params.cm_folder_name;
                    this.folderData[index].new_name = '';
                }
            },
            editFolderName(param){
                this.$axios({
                    method: 'post',
                    url: apis.getUrl('folder_edit'),
                    data: param
                })
                .then(res => {
                    if (res.data.c === 0) {
                        this.$Message.success('修改成功！');
                    } else {
                        this.$Message.error(res.data.m);
                        this.getUserFolderList(this.cm_folder_pid, this.cm_bucket_id, this.cm_user_id, this.page);
                    }
                    this.loading = false;
                });
            },
            getTreeData(){
                this.$axios({
                    method: 'post',
                    url: apis.getUrl('folder_tree'),
                    data: {'cm_bucket_id': this.cm_bucket_id}
                })
                .then(res => {
                    if (res.data.c === 0) {
                        //提示消息
                        this.data1 = res.data.d;
                        this.moveFloderLayer = true;

                    } else {
                        this.$Message.error(res.data.m);
                    }
                    this.loading = false;
                });
            },
            renderContent(h, { root, node, data }){
                return h('span', [ 
                    h('Icon', {
                        props: {
                            type: 'ios-folder',
                            size: 22
                        },
                        style: {
                            marginRight: '8px',
                            color: '#FFCC33'
                        }
                    }),
                    h('Button', {
                        props: Object.assign({}, this.buttonProps, {
                            type: 'text'
                        }),
                        on: {
                            click: () => { this.selectFolder(root, node, data); }
                        }
                    },data.title)
                ]);
            },
            selectFolder(root, node, data){
                this.choiseFolder = {};
                this.choiseFolder = data;
                
            },
            moveOk(){
                this.$axios({
                    method: 'post',
                    url: apis.getUrl('folder_move_tree'),
                    data: {'cm_folder_id': this.choiseFolder.cm_folder_id, 'selectList': this.selectList}
                })
                .then(res => {
                    if (res.data.c === 0) {
                        this.getUserFolderList(this.cm_folder_pid, this.cm_bucket_id, this.cm_user_id, this.page);
                    } else {
                        this.$Message.error(res.data.m);
                    }
                    this.loading = false;
                });
            },
            moveCancel(){
            },
            sureExpire(){
                if(this.selectList.length<1){ this.$Message.error('请选择要分享的文件或文件夹！'); return false;}
                this.shareLayer = true;
            },
            shareFile(){
                this.shareLayer = false;
                this.$axios({
                    method: 'post',
                    url: apis.getUrl('folder_share'),
                    data: {'cm_folder_list': this.selectList, 'local': window.location.origin, 'cm_user_id': this.cm_user_id, cm_expire_time: this.expireTime}
                })
                .then(res => {
                    if (res.data.c === 0) {
                        this.extract_data.cm_share_key = res.data.d.share_key;
                        this.extractLayer = true;
                    } else {
                        this.$Message.error(res.data.m);
                    }
                    this.loading = false;
                });

            },
            getUserList(cm_jointly_id){
                this.$axios({
                    method: 'post',
                    url: apis.getUrl('user_list'),
                    data:{cm_jointly_id: cm_jointly_id}
                })
                .then(res => {
                    if (res.data.c === 0) {
                       
                        this.data2 = res.data.d.user_list;
                        this.targetKeys2 = res.data.d.user_join;
                    } else {
                        this.$Message.error(res.data.m);
                    }
                    this.loading = false;
                });
            },
            forlderJointly(){
                this.targetKeys2 = [];
                if(this.selectList.length<1){ this.$Message.error('请选择要共享的文件夹！'); return false;}
                if(this.selectList.length>1){ this.$Message.error('一次只能选择一个文件夹共享！');return false;}
                if(this.selectRows.cm_is_file > 0){ this.$Message.error('不能选择文件进行共享！'); return false;}

                this.getUserList(this.selectRows.cm_jointly_id);
                this.jointlyLayer = true;
            },
            jointlyOk(){
                this.$axios({
                    method: 'post',
                    url: apis.getUrl('folder_jointly'),
                    data:{folder: this.selectRows, others: this.targetKeys2}
                })
                .then(res => {
                    if (res.data.c === 0) {
                        this.$Message.success('文件夹共享成功！');
                        this.getUserFolderList(this.cm_folder_pid, this.cm_bucket_id, this.cm_user_id, this.page);
                        this.selectList = [];
                    } else {
                        this.$Message.error(res.data.m);
                    }
                    this.loading = false;
                });
            },
            getTargetKeys () {

            },
            handleChange2 (newTargetKeys) {
                this.targetKeys2 = newTargetKeys;
            },
            filterMethod (data, query) {
                return data.label.indexOf(query) > -1;
            },
            closeExtract(){
                this.extractLayer = false;
            },
            switchPlatform (flag) {
                console.log('flag============', flag);
                this.$axios({
                    headers: {
                        'MiddleFlag': flag
                    },
                    method: 'post',
                    url: apis.getUrl('user_login_jwt'),
                    data: {'cm_user_username': fns.getStorage('remember_username')}
                })
                .then(res => {
                    if (res.data.c === 0) {
                        this.platform = flag;
                        fns.setStorage('Jwt', res.data.d.Jwt);
                        fns.setStorage('middle_flag', flag);
                        fns.setStorage('remember_user_id', res.data.d.user_id);
                        this.switchInit();
                    } else {
                        this.$Message.error(res.data.m);
                    }
                });
            },
            switchInit () {
                this.bus.$emit('ceph_index_user', this.platform);
                this.cm_user_id = fns.getStorage('remember_user_id');
                this.getUserFolderList(0, this.cm_bucket_id, this.cm_user_id, 1);
            },
            onCopy(e) {
                this.$Message.success('复制成功！');
            },
            onError(e) {
                this.$Message.error('复制失败！');
            }
        },
        beforeDestroy () {
        },
        components: {
            UploaderBtn
        }
    }
    export default ceph
</script>
