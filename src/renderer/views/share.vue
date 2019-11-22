<template>
    <div>
    	<!-- <Button type="info"  @click="cancelShare"><Icon type="md-cloud-download" /> 取消分享</Button> -->
        <Button class="btn-self" @click="cancelShare" >
            <svg class="icon-self-operate" aria-hidden="true" >
                <use xlink:href="#icons-cancel"></use>
            </svg>取消分享
        </Button>
    	<div style="margin-top: 12px;"></div>
        <div ref="header"></div>
        <Table 
            :height="this.tableHeight"
            :columns="folderColumns" 
            :data="folderData" 
            @on-select="selectOne" 
            @on-row-click="clickRows"
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
                        <span style="color: #2b85e4;">{{row.cm_folder_name}}</span>
                    </span>
                    <span v-show="row.cm_folder_text != ''"><br>{{row.cm_folder_text}}</span>
                </div>
            </template>
        </Table>
    </div>
</template>
<script>
    import { tableMixin } from '../common/mixins';
    export default {
        name: 'share',
        mixins: [tableMixin],
        data () {
            return {
                cm_bucket_id: '',
                cm_user_id: '',
                cm_folder_pid: 0,
                cm_folder_name: '',
                selectList:[],
                selectRows:{},
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
                    // {
                    //     title: '分享链接',
                    //     key: 'cm_share_link',
                    // },
                    {
                        title: '提取密码',
                        key: 'cm_share_key',
                    },
                    {
                        title: '分享时间',
                        key: 'cm_share_ts'
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
            this.getShareList();
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
            getShareList(){
            	var map = {'cm_bucket_id':this.cm_bucket_id, 'cm_user_id':this.cm_user_id};
                this.$axios({
                    method: 'post',
                    url: apis.getUrl('folder_myshare'),
                    data: map
                })
                .then(res => {
                    if (res.data.c === 0) {
                        console.log('getShareList----------------', res.data.d);
                        this.folderData = res.data.d;
                        this.extractLink = false;
                        

                    } else {
                        this.$Message.error(res.data.m);
                    }
                    this.loading = false;
                });
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
                console.log('clickRows----------------row', row, index,this.$refs);
                //this.$refs.table.highlightCurrentRow(index);
                this.$refs.table.toggleSelect(index);
                
            },
            selectChange(selection){
                this.selectList = selection;
            },
            cancelShare(){
            	var cancelData = {'cm_folder_list': this.selectList,'cm_bucket_id': this.cm_bucket_id}
                this.$axios({
                    method: 'post',
                    url: apis.getUrl('folder_share_cancel'),
                    data: cancelData
                })
                .then(res => {
                    if (res.data.c === 0) {
                        console.log('cancelShare----------------', res.data.d);
                        this.getShareList();

                    } else {
                        this.$Message.error(res.data.m);
                    }
                    this.loading = false;
                });
            }
        }
    }
</script>