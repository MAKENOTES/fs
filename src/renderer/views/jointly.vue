<style>
.trees{border: 1px solid #f2f2f2;}
.ivu-progress{width: 80% !important;}
.demo-upload-list{border-bottom: 1px solid #dcdee2;}
</style>
<template>
    <div>
    	<div v-if="cm_folder_pid==0" style="width:320px;height: 30px;font-size: 14px;">
            共享给我的文件夹列表
        </div>
        <div v-if="cm_folder_pid>0">
            <uploader-btn @addFileBtn="addFileBtn">上传</uploader-btn>

            <Button class="btn-self" @click="downloadFileBtn" >
                <svg class="icon-self-operate" aria-hidden="true" >
                    <use xlink:href="#icons-download"></use>
                </svg>
                下载
            </Button>


            <Button class="btn-self" @click="makeFolder = true" >
                <svg class="icon-self-operate" aria-hidden="true" >
                    <use xlink:href="#icons-add-folder"></use>
                </svg>
                新建文件夹
            </Button>


            <Modal v-model="makeFolder" title="新建文件夹" @on-ok="makeOk" @on-cancel="makeCancel">
                文件夹名称：<Input v-model="cm_folder_name" style="width: 300px" />
            </Modal>

            <Dropdown placement="bottom-end">
                <Button class="btn-self">
                    更多
                    <svg class="icon-self-operate" aria-hidden="true" >
                        <use xlink:href="#icons-arrow-bottom"></use>
                    </svg>
                </Button>
                <DropdownMenu slot="list">
                    <!-- <DropdownItem><Icon type="ios-create" /> 重命名</DropdownItem> -->
                    <DropdownItem @click.native="moveFloder"><Icon type="md-swap" /> 移动</DropdownItem>
                    <DropdownItem @click.native="deleteFloder"><Icon type="ios-trash" /> 删除</DropdownItem>
                </DropdownMenu>
            </Dropdown>
        </div>
        <div style="margin-top: 12px;">
            <Breadcrumb style="height: 21px;">
                <BreadcrumbItem to="/jointly"  v-for="(item,index) in breadList">
                    <span @click="choiseBread(item.cm_folder_pid, item.cm_folder_id, item)">
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
                :highlight-row="true"
            >
                <template slot-scope="{ row, index }" slot="cm_folder_name">
                    
                    <div v-if="0 !== row.cm_object_id">
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

                        <span :class="{ listSpan: true }" :style="{ display: row.disSpan }" :title="row.cm_folder_name" @click="folderClickName(index, row.cm_folder_id)" >{{row.cm_folder_name}}</span>

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

        <Modal v-model="moveFloderLayer" title="移动到" @on-ok="moveOk" @on-cancel="moveCancel">
            <div class="trees">
                <Tree :data="data1"  :render="renderContent"></Tree>
            </div>
        </Modal>
    </div>
</template>

<script>
    //import {mapState,mapGetters,mapActions} from 'vuex';
    import UploaderBtn from '../components/uploader-btn.vue';
    import { formatedSize } from '../utils/utils';
    import db from '../../datastore/db' // 取决于你的datastore.js的位置
    import { tableMixin } from '../common/mixins';
    const md5 = require('md5');
    var ceph = {
        name: 'jointly',
        mixins: [tableMixin],
        data() {
            return {
                cm_bucket_id: '',
                cm_user_id: '',
                cm_folder_pid: 0,
                cm_folder_name: '',
                cm_owner_id: '', //拥有者id
                cm_bucket_owner_id: '', //拥有者的bucket id

                makeFolder: false,
                moveFloderLayer: false,
                uploadList: [],
                selectList:[],
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
                        title: '更新时间',
                        key: 'cm_update_ts'
                    }
                ],
                folderData: [],
                data1: []
            }
        },
        mounted(){
            //初始化
            this.cm_bucket_id = fns.getStorage('remember_bucket_id');
            this.cm_user_id = fns.getStorage('remember_user_id');
            this.getUserFolderList(0, this.cm_bucket_id, this.cm_user_id);
        },
        beforeUpdate () {
            //表格高度自适应
            //this.setTableHeight();
            this.tableHeight = document.body.clientHeight - (this.$refs.header.offsetHeight + 200) + "px";
            //放在mounted  切换路由时不会运行
            this.$nextTick(() => {
                //注意 箭头函数  不然this不能传递到里面
                document.getElementsByClassName("ivu-table-tbody")[0].addEventListener("mouseenter", () => {
                    //console.log('0000000000000===============', this, document.getElementsByClassName("ivu-table-row"));
                    let objs =  document.getElementsByClassName("ivu-table-row");
                    for (let i = 0; i < objs.length; i++) {
                        objs[i].addEventListener("mouseenter", () => {
                            this.editShow = i;
                        }) 

                        objs[i].addEventListener("mouseleave", () => {
                            this.editShow = -1;
                        }) 
                    }
                }) 
            })
        },
        methods: {
            setTableHeight () {
                let h = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight; //浏览器高度
                let topH = this.$refs.table.$el.offsetTop;//表格距浏览器顶部距离
                let tableHeight =(h - topH)*0.76  //表格应该有的高度   乘以多少可自定义
                this.tableHeight = tableHeight;
            },
            getUserFolderList(cm_folder_pid, cm_bucket_id, cm_user_id){
                var map = {'cm_folder_pid':cm_folder_pid, 'cm_user_id':cm_user_id};
                console.log('aaaaaaa', map);
                this.$axios({
                    method: 'post',
                    url: apis.getUrl('folder_jointly_list'),
                    data: map
                })
                .then(res => {
                    if (res.data.c === 0) {
                        //提示消息
                        //this.$Message.success('获取成功！');
                        //模板列表赋值
                        this.folderData = res.data.d.folder;
                        this.breadList = res.data.d.bread;
                        //this.getBreadList(cm_folder_pid);
                    } else {
                        this.$Message.error(res.data.m);
                    }
                    this.loading = false;
                });
            },
            getBreadList(cm_folder_pid){
                var map = {'cm_folder_pid':cm_folder_pid};
                console.log('aaaaaaa', map);
                this.$axios({
                    method: 'post',
                    url: apis.getUrl('folder_jointly_bread'),
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
                        cm_bucket_id: this.cm_bucket_id,
                        jointly: true,
                        cm_owner_id: this.cm_owner_id
                    }
                    this.$store.dispatch('uploadList/pushList', obj)
                    uploadList.push(obj);
                })
                this.$electron.ipcRenderer.send('UPLOAD_FILES', uploadList)
            },
            downloadBeforeCheck () {
                let support = false;
                this.selectList.forEach((item, index) => {
                    if (0 === this.selectList[index].cm_object_id) {
                        support = true;
                    }
                })
                if (support) {this.$Message.error('暂不支持文件夹下载！');return false;} 
                if(this.selectList.length <= 0){this.$Message.error('请勾选文件需要下载的文件！');return false;}

                let dbPath = db.read().get('userData').find({ id: this.cm_user_id }).value();
                console.log('dbPath===========================', typeof(dbPath));
                if ('undefined' === typeof(dbPath)) {
                    this.$Modal.confirm({
                        title: '提示消息',
                        content: '<p>是否现在设置文件下载路径</p>',
                        onOk: () => {
                            this.$electron.ipcRenderer.send('DOWNLOAD_PATH', {id: this.cm_user_id, status:true});
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
                let dbPath = db.read().get('userData').find({ id: this.cm_user_id }).value();
                if ('undefined' === typeof(dbPath)) { return false;}

                this.$axios({
                    method: 'post',
                    url: apis.getUrl('object_batch_down'),
                    data: this.selectList
                })
                .then(res => {
                    if (res.data.c === 0) {
                        //提示消息
                        console.log('down===========================', res.data.d);
                        let downloadList = [];
                        Array.from(res.data.d).forEach((item, index) => {
                            let ident = md5(item.filename+(new Date()).valueOf());
                            let obj = {
                                UserId: this.cm_user_id,
                                /********文件基本信息********/
                                name: item.filename,
                                url: item.url,
                                size: item.sizeByte,
                                extension: item.filename.substring(item.filename.lastIndexOf('.') + 1),

                                progress: 0,
                                formatedSize: item.formatedSize,
                                receivedBytes: 0,
                                averageSpeed: 0,
                                milliTime: 0,
                                
                                /********文件重要指标信息********/
                                operate: 'download',
                                status: 'waiting',
                                statusText: '',
                                paused:  false,
                                error:  false,
                                isComplete: false,
                                isUnderway: false,
                                isRemove: false,
                                isFolder: false,

                                downloadPath: '',
                                downloads: dbPath.path,
                                chunkSize: 0,
                                totalBytes: 0,
                                pieces: 0,
                                chunkNumCurrent: 0,

                                Parts: [],
                                FileId: ident,
                            }
                            //this.$store.dispatch('downloadList/pushList', obj)
                            downloadList.push(obj);
                        })
                        console.log('downloadList============================', downloadList);
                        this.$electron.ipcRenderer.send('DOWNLOAD_FILES', downloadList)
                    } else {
                        this.$Message.error(res.data.m);
                    }
                });

                
            },
            choiseBread(cm_folder_pid, cm_folder_id, row){
            	this.selectList = [];//清空勾选
                this.cm_folder_pid = cm_folder_id;
                this.cm_owner_id = row.cm_user_id; //共享id
                this.cm_bucket_owner_id = row.cm_bucket_id;//共享者i
                console.log('面包屑----------------------', this.cm_owner_id);
                //this.getBreadList(cm_folder_pid);
                this.getUserFolderList(cm_folder_id, this.cm_bucket_id, this.cm_user_id);
            },
            makeOk () {
                var add_data = {'cm_folder_pid':this.cm_folder_pid, 'cm_folder_name':this.cm_folder_name, 'cm_bucket_id':this.cm_bucket_owner_id, 'cm_owner_id':this.cm_owner_id};
                console.log('add_data-----------------------', add_data, this);
                this.$axios({
                    method: 'post',
                    url: apis.getUrl('folder_create'),
                    data: add_data
                })
                .then(res => {
                    if (res.data.c === 0) {
                        //提示消息
                        this.$Message.success('添加成功！');
                        this.getUserFolderList(this.cm_folder_pid, this.cm_bucket_id, this.cm_user_id);
                    } else {
                        this.$Message.error(res.data.m);
                    }
                    this.loading = false;
                });
            },
            makeCancel () {
                this.$Message.info('Clicked cancel');
            },
            selectOne(selection, row){
                //console.log('selection----------------row', selection, row);
                this.selectList = selection;
                this.selectRows = row;
            },
            selectAll(selection){
                console.log('selectAll----------------selection', selection);
                this.selectList = selection;
            },
            clickRows(row, index){
                console.log('clickRows----------------row', row, index,this.$refs);
                //this.$refs.table.highlightCurrentRow(index);
                this.$refs.table.toggleSelect(index);
                
            },
            selectChange(selection){
                this.selectList = selection;
            },
            dbclickRows(row, index){
                if(row.cm_object_id == 0){
                    this.selectList = [];//清空勾选
                    this.cm_bucket_id = row.cm_bucket_id;
                    this.cm_folder_pid = row.cm_folder_id;
                    this.cm_owner_id = row.cm_user_id; //发起共享人id
                    this.cm_bucket_owner_id = row.cm_bucket_id;//发起共享人cm_bucket_id
                    this.getUserFolderList(row.cm_folder_id, row.cm_bucket_id, row.cm_user_id)
                }
            },
            deleteFloder(){
                console.log('this.selectList----------------', this.selectList);
                if(this.selectList.length <= 0){this.$Message.error('请勾选文件或者文件夹！');return false;}
                this.$Modal.confirm({
                    title: '提示消息',
                    content: '<p>确认删除！！！</p>',
                    onOk: () => {
                        this.sureDeleteFloder();
                        //this.$Message.info('Clicked ok');
                    },
                    onCancel: () => {
                        this.$Message.info('已取消');
                    }
                });
            },
            sureDeleteFloder () {
                this.$axios({
                    method: 'post',
                    url: apis.getUrl('folder_delete'),
                    data: this.selectList
                })
                .then(res => {
                    console.log('deleteFloder-----------res', res);
                    if (res.data.c === 0) {
                        //提示消息
                        this.$Message.success('删除成功！');
                        this.getUserFolderList(this.cm_folder_pid, this.cm_bucket_id, this.cm_user_id);
                    } else {
                        this.$Message.error(res.data.m);
                    }
                    this.loading = false;
                });
            },
            moveFloder(){
                if(this.selectList.length <= 0){this.$Message.error('请勾选文件或者文件夹！');return false;}
                this.getTreeData();
                this.moveFloderLayer = true;
                console.log('this.selectList----------------', this.selectList);
            },
            //文件名 操作
            preFileName (fileName) {
                return fileName.substr(0,fileName.lastIndexOf('.'));
            },
            fileNameChange (event, index) {
                console.log('event===================', event.target.value, index);
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
                //var fileImage = this.renderImage(fileType);
                this.folderData[index].new_name = this.folderData[index].new_name ? this.folderData[index].new_name + "." + fileType : this.folderData[index].cm_folder_name;
                let params = {
                    cm_folder_id: this.folderData[index].cm_folder_id,
                    cm_object_id: this.folderData[index].cm_object_id,
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
                console.log('editFileName----------------param', param);
                this.$axios({
                    method: 'post',
                    url: apis.getUrl('object_edit'),
                    data: param
                })
                .then(res => {
                    console.log('editFileName-----------res', res);
                    if (res.data.c === 0) {
                        //提示消息
                        this.$Message.success('修改成功！');

                    } else {
                        this.$Message.error(res.data.m);
                    }
                    this.loading = false;
                });
            },
            //文件夹名 操作
            preFolderColor (cm_jointly_st) {
                return 0 === cm_jointly_st ? "#FFCC33" : "#19be6b";
            },
            folderClickName (index, cm_folder_id) {
                // this.cm_folder_pid =  this.folderData[index].cm_folder_id;
                // this.getUserFolderList( this.folderData[index].cm_folder_id,  this.folderData[index].cm_bucket_id,  this.folderData[index].cm_user_id)
            },
            folderNameChange (event, index) {
                console.log('event===================', event.target.value, index);
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
                console.log('editFolderName----------------param', param);
                this.$axios({
                    method: 'post',
                    url: apis.getUrl('folder_edit'),
                    data: param
                })
                .then(res => {
                    console.log('editFileName-----------res', res);
                    if (res.data.c === 0) {
                        //提示消息
                        this.$Message.success('修改成功！');

                    } else {
                        this.$Message.error(res.data.m);
                    }
                    this.loading = false;
                });
            },
            getTreeData(){
                //if(this.selectList.length <= 0){this.$Message.error('请勾选文件或者文件夹！');return false;}
                this.$axios({
                    method: 'post',
                    url: apis.getUrl('folder_jointly_tree'),
                    data: {cm_owner_id: this.cm_owner_id}
                })
                .then(res => {
                    console.log('getTreeData-----------res', res);
                    if (res.data.c === 0) {
                        //提示消息
                        //this.$Message.success('修改成功！');
                        this.data1 = res.data.d;

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
                    //h('span', data.title)
                ]);
            },
            selectFolder(root, node, data){
                console.log('moveOk----------------param', root, node, data);
                this.choiseFolder = {};
                this.choiseFolder = data;
                
            },
            moveOk(){
                console.log('moveOk----------------param');
                this.$axios({
                    method: 'post',
                    url: apis.getUrl('folder_move_tree'),
                    data: {'cm_folder_id': this.choiseFolder.cm_folder_id, 'selectList': this.selectList}
                })
                .then(res => {
                    console.log('moveOk-----------res', res);
                    if (res.data.c === 0) {
                        //提示消息
                        //this.$Message.success('修改成功！');
                        this.getUserFolderList(this.cm_folder_pid, this.cm_bucket_id, this.cm_user_id);
                    } else {
                        this.$Message.error(res.data.m);
                    }
                    this.loading = false;
                });
            },
            moveCancel(){
                console.log('moveCancel----------------param');
            },
            renderName(h, params){

            },
            renderImage(fileType){
                var imgUrl = '';
                switch (fileType) {
                    case "pdf":
                    case "pptx":
                        imgUrl = "ppt_icn.png";
                        break;
                    case "docx":
                        imgUrl = "word_icn.png";
                        break;
                    case "xlsx":
                        imgUrl = "xlsx_icn.png";
                        break;
                    case "png":
                    case "jpg":
                    case "jpeg":
                    case "gif":
                        imgUrl = "img_icn.png";
                        break;
                    case "mp4":
                    case "mpeg":
                    case "mpg":
                    case "avi":
                    case "mov":
                    case "wmv":
                    case "mkv":
                    case "flv":
                        imgUrl = "video_icn.png";
                        break;
                    case "mp3":
                    case "wave":
                    case "wma":
                        imgUrl = "voice_icn.png";
                        break;
                    default:
                        break;
                }
                return imgUrl;
            },
            getUserList(){
                this.$axios({
                    method: 'post',
                    url: apis.getUrl('user_list'),
                })
                .then(res => {
                    if (res.data.c === 0) {
                        console.log('user_list----------------', res.data.d);
                        this.data2 = res.data.d;
                    } else {
                        this.$Message.error(res.data.m);
                    }
                    this.loading = false;
                });
            },
        },
        components: {
            UploaderBtn
        }
    }
    export default ceph
</script>
