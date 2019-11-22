<template>
    <div>
        <Button class="btn-self" @click="downloadFileBtn" >
            <svg class="icon-self-operate" aria-hidden="true" >
                <use xlink:href="#icons-download"></use>
            </svg>
            下载
        </Button>

        <Button class="btn-self" @click="againExtract" >
            <svg class="icon-self-operate" aria-hidden="true" >
                <use xlink:href="#icons-share-extract"></use>
            </svg>
            文件提取
        </Button>
        <Modal 
        v-model="extractLayer" 
        title="文件提取" 
        :styles="{top: '200px'}"
        :width="520">
            <!-- <div v-if="extractSee">
            	<p>分享链接：<Input v-model="extract_data.cm_share_link" style="width: 520px" placeholder="分享链接"/></p>
            	<div style="height: 10px"></div>
            </div>     -->
        	<p>提取密码：<Input v-model="extract_data.cm_share_key" style="width: 300px" placeholder="提取密码"/></p>
    	    <div slot="footer">
            <Button type="info"  @click="verifier">提取文件</Button>
       		</div>	
        </Modal>
        <div style="margin-top: 12px;"></div>

        <Breadcrumb>
            <BreadcrumbItem to="/extract" >
                <span @click="verifier()">
                <Icon type="ios-home-outline"></Icon> 全部文件
                </span>
            </BreadcrumbItem>
        </Breadcrumb>
        <div ref="header"></div>
        <Table 
            :height="this.tableHeight"
            :columns="folderColumns" 
            :data="folderData" 
            @on-select="selectOne" 
            @on-row-click="clickRows"
            @on-row-dblclick="dbclickRows"
            @on-select-all="selectAll"
            @on-selection-change="selectChange"
            ref="table" 
            :highlight-row="true"
        >
            <template slot-scope="{ row }" slot="cm_folder_name">
                <div v-if="0 !== row.cm_is_file">
                    <svg class="icon-self-file" aria-hidden="true" >
                        <use xlink:href="#icons-open-file-filled"></use>
                    </svg>
                    <span :class="{ listSpan: true }" :style="{ display: row.disSpan }" :title="row.cm_folder_name" >{{row.cm_folder_name}}</span>
                </div>
                <div v-else>
                    <svg class="icon-self-folder" aria-hidden="true" >
                        <use xlink:href="#icons-folder"></use>
                    </svg>
                    <span :class="{ listSpan: true }" :style="{ display: row.disSpan }" :title="row.cm_folder_name" >
                        <span @click="folderClickName(row)" style="cursor: pointer;color: #2b85e4;">{{row.cm_folder_name}}</span>
                    </span>
                    <span v-show="row.cm_folder_text != ''"><br>{{row.cm_folder_text}}</span>
                </div>
            </template>
        </Table>
    </div>
    
</template>
<script>
    import db from '../../datastore/db' // 取决于你的datastore.js的位置
    import { tableMixin } from '../common/mixins';
    const md5 = require('md5');
    export default {
        name: 'extract',
        mixins: [tableMixin],
        data () {
            return {
            	extractLayer: false,
                extractSee:true,
                cm_bucket_id: '',
                cm_user_id: '',
                cm_folder_pid: 0,
                cm_folder_name: '',
				extract_data: {cm_share_link: '', cm_share_key: '', cm_user_id: '', cm_bucket_id: ''},
                selectList:[],
                selectRows:{},
                breadList:{},
                tableHeight: null,
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
                        width: 420,

                    },
                    {
                        title: '大小',
                        key: 'cm_folder_size',
                    },
                    {
                        title: '过期时间',
                        key: 'cm_expire_ts'
                    }
                ],
                folderData:[]
            }
        },
        mounted(){
            //初始化
            this.cm_bucket_id = fns.getStorage('remember_bucket_id');
            this.cm_user_id = fns.getStorage('remember_user_id');

        	this.extract_data.cm_user_id = fns.getStorage('remember_user_id');
        	this.extract_data.cm_bucket_id = fns.getStorage('remember_bucket_id');
            //提取弹出层
            console.log('url------------', window.location.search);
            this.settingExtractLayer();

        },
        beforeUpdate () {
            //表格高度自适应 放在 mounted 获取不到真实的this.$refs.table.$el.offsetTop
            //this.setTableHeight();
            this.tableHeight = document.body.clientHeight - (this.$refs.header.offsetHeight + 200) + "px";
        },
        methods:{
            setTableHeight () {
                let h = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight; //浏览器高度
                let topH = this.$refs.table.$el.offsetTop;//表格距浏览器顶部距离
                let tableHeight =(h - topH)*0.76  //表格应该有的高度   乘以多少可自定义
                this.tableHeight = tableHeight;
            },
            settingExtractLayer(){
                if(fns.getCache('cm_share_key')){
                    this.extractLayer = false;
                    this.extract_data.cm_share_link = fns.getCache('cm_share_link');
                    this.extract_data.cm_share_key = fns.getCache('cm_share_key');
                    this.verifier();
                }else{
                    if(window.location.search){
                        this.extractSee = false;
                        this.extract_data.cm_share_link = window.location.href;
                    }
                    this.extractLayer = true;
                }
            },
        	verifier(){

                this.$axios({
                    method: 'post',
                    url: apis.getUrl('folder_extract'),
                    data: this.extract_data
                })
                .then(res => {
                    if (res.data.c === 0) {
                        console.log('verifier----------------', res.data.d);
                        this.folderData = res.data.d;
                        this.extractLayer = false;
                        //this.getBreadList(this.cm_folder_pid);待修复
                        fns.setCache('cm_share_link', this.extract_data.cm_share_link);
                        fns.setCache('cm_share_key', this.extract_data.cm_share_key);

                    } else {
                        this.$Message.error(res.data.m);
                    }
                    this.loading = false;
                });
        	},
            downloadBeforeCheck () {
                let support = false;
                this.selectList.forEach((item, index) => {
                    if (0 === this.selectList[index].cm_is_file) {
                        support = true;
                    }
                })
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
                    url: apis.getUrl('folder_batch_down'),
                    data: this.selectList
                })
                .then(res => {
                    if (res.data.c === 0) {
                        //文件下载信息
                        //console.log('down===========================', res.data.d);
                        let downloadList = [];
                        downloadList = res.data.d;
                        Array.from(downloadList).forEach((item, index) => {
                            downloadList[index].downloads = dbPath.path;
                        })
                        console.log('downloadList============================', downloadList, dbPath.path);
                        this.$electron.ipcRenderer.send('DOWNLOAD_FILES', downloadList)
                    } else {
                        this.$Message.error(res.data.m);
                    }
                });
                
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
                if(row.cm_is_file == 0){
                    this.cm_folder_id = row.cm_folder_id;
                    //面包屑
                    console.log('dbclickRows--------------', row);
                    //this.cm_folder_pid = row.cm_folder_id;
                    this.getExtractList();
                    //this.getBreadList(row.cm_folder_id);待修复
                }
            },
            getExtractList(){
            	var choise = {'cm_share_link':'', 'cm_share_key':'','cm_user_id': '', 'cm_bucket_id': '', 'cm_folder_id':''};
            	choise.cm_share_link = this.extract_data.cm_share_link;
            	choise.cm_share_key = this.extract_data.cm_share_key;
            	choise.cm_user_id = this.extract_data.cm_user_id;
            	choise.cm_bucket_id = this.extract_data.cm_bucket_id;
            	choise.cm_folder_id = this.cm_folder_id;
                this.$axios({
                    method: 'post',
                    url: apis.getUrl('folder_extract_list'),
                    data: choise
                })
                .then(res => {
                    if (res.data.c === 0) {
                        console.log('getExtractList----------------', res.data.d);
                        this.folderData = res.data.d;
                        this.extractLayer = false;
                        

                    } else {
                        this.$Message.error(res.data.m);
                    }
                    this.loading = false;
                });
            },
  		    choiseBread(cm_folder_pid, cm_folder_id){
  		    	console.log('choiseBread---------------', this.extract_data);
                this.cm_folder_id = cm_folder_id;
                this.getExtractList();
                //this.getBreadList(cm_folder_id);待修复
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
            againExtract(){
                this.extractSee = true;
            	this.extractLayer = true;
            },
            folderClickName (row) {
                if(row.cm_is_file == 0){
                    this.cm_folder_id = row.cm_folder_id;
                    //面包屑
                    console.log('dbclickRows--------------', row);
                    //this.cm_folder_pid = row.cm_folder_id;
                    this.getExtractList();
                    //this.getBreadList(row.cm_folder_id);待修复
                }
            }
        }
    }
</script>