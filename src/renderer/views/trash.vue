<template>
    <div>
    	<!-- <Button type="info"  @click="restore"><Icon type="ios-undo" /> 还原</Button> -->
    	<!-- <Button type="warning"  @click="shiftDelete"><Icon type="ios-trash" /> 删除</Button> -->
        <Button class="btn-self" @click="restore" >
            <svg class="icon-self-operate" aria-hidden="true" >
                <use xlink:href="#icons-restore"></use>
            </svg>还原
        </Button>

        <Button class="btn-self" @click="shiftDelete" >
            <svg class="icon-self-operate" aria-hidden="true" >
                <use xlink:href="#icons-trash"></use>
            </svg>删除
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
                    <svg v-if="0 === row.cm_jointly_st" class="icon-self-folder" aria-hidden="true" >
                        <use xlink:href="#icons-folder"></use>
                    </svg>
                    <svg v-if="0 !== row.cm_jointly_st" class="icon-self-folder" aria-hidden="true" >
                        <use xlink:href="#icons-folder-jointly"></use>
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
        name: 'trash',
        mixins: [tableMixin],
        data () {
            return {
                cm_bucket_id: '',
                cm_user_id: '',
                cm_folder_pid: 0,
                cm_folder_name: '',
                selectList:[],
                selectRows:{},
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
                        title: '删除时间',
                        key: 'cm_delete_ts'
                    }
                ],
                folderData:[]
            }
        },
        mounted(){
            //初始化
            this.cm_bucket_id = fns.getStorage('remember_bucket_id');
            this.cm_user_id = fns.getStorage('remember_user_id');
            this.getTrashList();
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
            getTrashList(){
            	var map = {'cm_bucket_id':this.cm_bucket_id, 'cm_user_id': this.cm_user_id};
                this.$axios({
                    method: 'post',
                    url: apis.getUrl('folder_trash'),
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
            restore(){
                this.$axios({
                    method: 'post',
                    url: apis.getUrl('folder_trash_restore'),
                    data: {'cm_folder_list': this.selectList, 'cm_user_id':this.cm_user_id}
                })
                .then(res => {
                    if (res.data.c === 0) {
                        console.log('restore----------------', res.data.d);
                        this.$Message.success('恢复成功！');
                        this.getTrashList();
                    } else {
                        this.$Message.error(res.data.m);
                    }
                    this.loading = false;
                });
            },
            shiftDelete(){
                this.$axios({
                    method: 'post',
                    url: apis.getUrl('folder_trash_delete'),
                    data: {'cm_folder_list': this.selectList, 'cm_user_id':this.cm_user_id}
                })
                .then(res => {
                    if (res.data.c === 0) {
                        console.log('restore----------------', res.data.d);
                        this.$Message.success('删除成功！');
                        this.getTrashList();
                    } else {
                        this.$Message.error(res.data.m);
                    }
                    this.loading = false;
                });
            }
        }
    }
</script>
