<style scoped lang="less">
    #app {
        font-family: Helvetica, sans-serif;
        text-align: center;
    }
    .bg-grey-light {
        background: #eff4f8;
    }
    .grid-content {
        min-height: 36px;
    }
    #user_avatar img{
        width: 40px;
        height: 40px;
        border-radius: 20px;
        background:none;
    }
    .storage-content{
        height:98%;
    }
    .ivu-menu-light{
        background:none;
        border: none;
    }
    .ivu-menu-horizontal {
        height: 32px;
        line-height: 32px;
    }

    .ivu-menu-vertical.ivu-menu-light:after{
        width: 0;
    }
    .ivu-menu-horizontal.ivu-menu-light:after{
        height: 0px;
    }
    .part-one .ivu-menu-item-active{
        color: #2d8cf0 !important;
        background: white;
    }
    .ivu-menu-light.ivu-menu-vertical .ivu-menu-item-active:not(.ivu-menu-submenu) {
        background: #dce9fc;
    }

    .ivu-menu-light.ivu-menu-vertical .ivu-menu-item-active:not(.ivu-menu-submenu):after{
	    left:0;
    }
    .ivu-menu-vertical .ivu-menu-item, .ivu-menu-vertical .ivu-menu-submenu-title {
        padding: 10px 24px;
        color: #333333 !important;
    }


</style>
<template>
    <div style="height: 100%;position: relative;">
        <Spin fix v-show="isGlobalInitShow" style="background-color:rgba(20, 107, 237, 0.21);">
            <Icon type="ios-loading" size=24 class="demo-spin-icon-load"></Icon>
            <div>请稍等 .......</div>
        </Spin>
        <Row type="flex" justify="center" align="middle" class="part-one top-back-color">
            <i-col span="4">
                <div style="text-align: left; padding-left: 10px;">
                    <img style="max-width: 100%;" src="../static/images/logo.png" />
                </div>
            </i-col>
            <i-col span="15">
                <Menu mode="horizontal" :active-name="active_name_head" ref="headMenu" @on-select="menuTop">
                    <MenuItem to="/ceph" name="ceph" class="head-menu-self top-menu-ceph">
                        文件仓库
                    </MenuItem>
                    <!-- <MenuItem to="/jointly" name="jointly" class="head-menu-self top-menu-jointly">
                        共享给我的
                    </MenuItem> -->
                    <MenuItem to="/download" name="download" class="head-menu-self top-menu-transmit">
                        <span v-if="0 !== this.transNumberCurrent">
                            <svg class="icon-self-bounce" aria-hidden="true">
                                <use x="-5" y="0" xlink:href="#icons-down" class="animate-bounce-down" ></use>
                                <use x="5" y="-1" xlink:href="#icons-up" class="animate-bounce-up" ></use>
                            </svg>
                        </span>
                        <span v-if="0 === this.transNumberCurrent">
                            <svg class="icon-self-bounce" aria-hidden="true">
                                <use x="-5" y="0" xlink:href="#icons-down" ></use>
                                <use x="5" y="-1" xlink:href="#icons-up" ></use>
                            </svg>
                        </span>   
                        传输列表
                        <span v-if="0 !== this.transNumberTotal">
                            <span class="span_position">{{this.transNumberTotal}}</span>
                        </span>
                    </MenuItem>
                </Menu>
            </i-col>
            <i-col span="1">
                <Avatar size="large" :src="top_avatar" />
            </i-col>
            <i-col span="1">
                <div>
                    <!-- <a href="javascript:void(0)"> -->
                        &nbsp;&nbsp;{{nickName}}
                    <!-- </a> -->
                </div>
            </i-col>

            <i-col span="3">
                <div class="distance-main">
                    <Dropdown  @on-click="dropDownClick">
                        <svg class="icon-self-setting" aria-hidden="true" >
                            <use xlink:href="#icons-setting"></use>
                        </svg>
                        <DropdownMenu style="-webkit-app-region: no-drag;" slot="list">
                            <!-- <DropdownItem name="user_info"><Icon type="md-person"></Icon> 个人资料</DropdownItem>
                            <DropdownItem name="user_password"><Icon type="md-lock"></Icon> 修改密码</DropdownItem> -->
                            <DropdownItem name="clear_tash"><Icon type="ios-trash"></Icon> 清理数据</DropdownItem>
                            <DropdownItem name="down_path"><Icon type="md-folder"></Icon> 下载路径</DropdownItem>
                            <DropdownItem name="check_update"><Icon type="md-sync"></Icon> 检查更新</DropdownItem>
                            <DropdownItem name="user_logout" divided>
                                <svg class="icon-self-drop" aria-hidden="true" >
                                    <use xlink:href="#icons-quit"></use>
                                </svg>
                                退出登录
                            </DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                    <span v-if="'win32' === os">
                        <svg class="icon-self-setting" aria-hidden="true" >
                            <use xlink:href="#icons-line"></use>
                        </svg>
                        
                        <svg  @click="minimizeWindow" class="icon-self-base" aria-hidden="true" >
                            <use xlink:href="#icons-minimize"></use>
                        </svg>
                        <svg v-if="false === listenerStatus.browserWindow" @click="openMaxWindow" class="icon-self-base" aria-hidden="true" >
                            <use xlink:href="#icons-max"></use>
                        </svg>

                        <svg v-if="true === listenerStatus.browserWindow" @click="openMiniWindow" class="icon-self-base" aria-hidden="true" >
                            <use xlink:href="#icons-min"></use>
                        </svg>

                        <svg @click="closeWindow" class="icon-self-base" aria-hidden="true" >
                            <use xlink:href="#icons-close"></use>
                        </svg>
                    </span>
                </div>
            </i-col>
        </Row>
        <Row type="flex" class="part-two">
            <i-col span="4" class="left-back-color">
                <Menu 
                    :active-name="active_name_left"
                    :open-names="[]"
                    ref="leftMenu"
                    @on-select="menuLeft" style="width:auto;">

                    <div v-for="(item, index) in leftMenuNode" :key="index">
                        <Submenu v-if="item.child" :name="item.name">
                            <template slot="title">
                                <!-- <Icon :type="item.icon" /> -->
                                <svg class="icon-self-left" aria-hidden="true" >
                                    <use :xlink:href="item.icon"></use>
                                </svg>
                                {{item.title}}
                            </template>
                            <div v-for="(childv, childi) in item.child" :key="childi"> 
                                <MenuItem :name="childv.name" :to="childv.name">
                                    <!-- <Icon :type="childv.icon" /> -->
                                    <!-- <svg class="icon-self-left" aria-hidden="true" >
                                        <use :xlink:href="childv.icon"></use>
                                    </svg> -->
                                    {{childv.title}}
                                </MenuItem>
                            </div>
                        </Submenu>
                        <MenuItem v-else :name="item.name" :to="item.name">
                            <svg class="icon-self-left" aria-hidden="true" >
                                <use :xlink:href="item.icon"></use>
                            </svg>
                            <!-- <Icon :type="item.icon" /> -->
                            {{item.title}}
                            <span v-if="'upload' === item.name && 0 !== uploadNum.length">({{uploadNum.length}})</span>
                            <span v-if="'download' === item.name && 0 !== downloadNum.length">({{downloadNum.length}})</span>
                            <span v-if="'completed' === item.name && 0 !== completedNum.length">({{completedNum.length}})</span>
                        </MenuItem>
                    </div>

                </Menu>
            </i-col>
            <i-col span="20">
                <div class="storage-content">
                    <div style="margin:1%;height: 98%">
                        <transition><router-view></router-view></transition>
                    </div>
                </div>
            </i-col>
        </Row>
        <Row type="flex" class="part-three">
            <i-col span="24">
                <i-col span="2">
                    <div>
                        &nbsp;
                    </div>
                </i-col>
                <i-col span="19">
                    <div>
                        &nbsp;
                    </div>
                </i-col>
                <i-col span="3">
                    版本号：{{version}}
                </i-col>
            </i-col>
        </Row>
    </div>
</template>
<script>
import {mapState,mapGetters,mapActions} from 'vuex';
import db from '../../datastore/db' // 取决于你的datastore.js的位置
import { remote } from 'electron';
const { Menu, MenuItem , dialog, BrowserWindow } = remote;
export default {
    data() {
        return {
            currentTpl: 'ceph',
            nickName: '欢迎',
            top_avatar: '',
            version: '',
            os: '',
            transNumberCurrent: 0,
            transNumberTotal: 0,
            active_name_head: 'ceph',
            active_name_left: 'ceph',
            leftMenuNode: [],
            cephLeftNode: [
                {
                    title: '全部文件',
                    name: 'ceph',
                    icon: '#icons-project',
                    active: ''
                },
                // {
                //     title: '会员中心',
                //     name: 'member',
                //     icon: '#icons-member',
                //     active: '',
                //     child: [
                //         {
                //             title: '个人资料',
                //             name: 'info',
                //             icon: '#icons-person',
                //             active: '',
                //             key: '1-1'
                //         },
                //         {
                //             title: '上传头像',
                //             name: 'avatar',
                //             icon: '#icons-person',
                //             active: '',
                //             key: '1-2'
                //         },
                //         {
                //             title: '修改密码',
                //             name: 'password',
                //             icon: '#icons-password',
                //             active: '',
                //             key: '1-3'
                //         },
                //     ]
                // },
                {
                    title: '我的分享',
                    name: 'share',
                    icon: '#icons-share',
                    active: ''
                },
                {
                    title: '分享提取',
                    name: 'extract',
                    icon: '#icons-share-extract',
                    active: ''
                },
                {
                    title: '回收站',
                    name: 'trash',
                    icon: '#icons-trash',
                    active: ''
                },
            ],
            // jointlyLeftNode: [
            //     {
            //         title: '共享列表',
            //         name: 'jointly',
            //         icon: '#icons-jointly',
            //         active: ''
            //     },
            // ],
            transmitLeftNode: [
                // {
                //     title: '正在上传',
                //     name: 'upload',
                //     icon: '#icons-tansmit-upload',
                //     active: ''
                // },
                {
                    title: '正在下载',
                    name: 'download',
                    icon: '#icons-tansmit-download',
                    active: ''
                },
                {
                    title: '传输完成',
                    name: 'completed',
                    icon: '#icons-completed',
                    active: ''
                },
            ],
            isGlobalInitShow: false,
        }
    },
    created () {
        this.os = process.platform
        console.log('os======================', this.os);

        if (false === this.listenerStatus.initOnce) {
            this.$electron.ipcRenderer.on('LOG_OUT_CALL', (e, status) => {
                console.log('LOG_OUT_CALL=====================', status);
                //初始化 main进程下载限制
                this.$electron.ipcRenderer.send('UPLOAD_CLEAR_ALL', {event: 'UPLOAD_CLEAR_ALL_CALL', status: false});
                this.$electron.ipcRenderer.send('DOWNLOAD_CLEAR_ALL', {event: 'DOWNLOAD_CLEAR_ALL_CALL', status: false});
                this.logOut();
            });

            //下载错误
            this.$electron.ipcRenderer.on('DOWNLOAD_ERROR_NET', (e, file) => {
                let isUpdate = true;
                this.listenerStatus.downloadPause.forEach((item, index) => {
                    if ( this.listenerStatus.downloadPause[index].FileId == file.data.FileId) {
                        isUpdate = false;
                    }
                })
                if (isUpdate) {
                    this.$Message.error({content:'网络不稳定或文件已不存在！！！', duration: 8});
                }
            });
        }

        //监听 全局loading
        this.bus.$on('ceph_index_loading', status => {
            console.log('ceph_index_loading===================', status);
            this.isGlobalInitShow = status;
        });
    },
    mounted () {
        this.initPreventDefault();
        //打印Jwt
        console.log('Jwt-------------------', fns.getStorage('Jwt'));
        //左侧菜单初始化
        this.leftMenuNode = this.cephLeftNode;
        //更新动态生成的菜单
        this.updateActiveMenu();
        //得到用户资料
        this.setTopUserInfo();
        //
        this.rightMenueInit();
        //监听总线事件
        this.bus.$on('change_nickname', nickName => {
            this.nickName = nickName;
        });
        this.bus.$on('change_avatar', avatar => {
            this.top_avatar = avatar;
        });

        //监听 退出应用事件
        this.bus.$on('app_quit', status => {
            this.dropDownClick('user_logout');
        });

        this.bus.$on('ceph_index_user', flag => {
            this.setTopUserInfo();
        });

        //版本处理
        this.remindUpdate();
        let version = (db.read().get('updateLog').value()).version;
        if (version) {
            this.version =  version;
        } else {
            this.version = '2.1.3';
            db.read().set('updateLog.version', this.version).write();
        }
        console.log('version================', db.read().get('updateLog').value());
    },
    computed: {
        ...mapGetters('uploadList',{
            uploadNum:'getList'
        }),
        ...mapGetters('downloadList',{
            downloadNum:'getList'
        }),
        ...mapGetters('completedList',{
            completedNum:'getList'
        }),
        ...mapGetters('listenerStatus',{
            listenerStatus:'getList'
        })
    },
    watch: {
        uploadNum () {
            let uploadCount = 0;
            let downloadCount = 0;
            this.uploadNum.forEach((item, index) => {
                if (true === this.uploadNum[index].isUnderway) {
                    uploadCount++;
                }
            })
            this.downloadNum.forEach((item, index) => {
                if (true === this.downloadNum[index].isUnderway) {
                    downloadCount++;
                }
            })

            this.transNumberCurrent = Number(uploadCount) + Number(downloadCount);
            this.transNumberTotal = Number(this.uploadNum.length) + Number(this.downloadNum.length);
        },
        downloadNum () {
            let uploadCount = 0;
            let downloadCount = 0;
            this.uploadNum.forEach((item, index) => {
                if (true === this.uploadNum[index].isUnderway) {
                    uploadCount++;
                }
            })
            this.downloadNum.forEach((item, index) => {
                if (true === this.downloadNum[index].isUnderway) {
                    downloadCount++;
                }
            })

            this.transNumberCurrent = Number(uploadCount) + Number(downloadCount);
            this.transNumberTotal = Number(this.uploadNum.length) + Number(this.downloadNum.length);
        }
    },
    methods: {
        dropDownClick(name){
            //右上角下拉菜单
            if(name == 'user_info'){
                this.goTpl('info');
            }
            if(name == 'user_password'){
                this.goTpl('password');
            }
            if(name == 'clear_tash'){
                this.clearTash();
            }
            if(name == 'down_path'){
                this.setDownpath();
            }
            if(name == 'check_update'){
                this.checkUpdate();
            }
            if(name == 'user_logout'){
                this.isGlobalInitShow = true;
                fns.clearCache();

                fns.rmStorage('Jwt');
                fns.rmStorage('middle_flag');

                fns.rmStorage('remember_user_id');
                fns.rmStorage('remember_bucket_id');
                fns.rmStorage('remember_bucket_name');

                this.clearMainMask();
            }
        },
        goTpl(what_tpl){
            this.$router.push('/' + what_tpl);
        },
        goUrlLogin(){
            this.$router.push('/login');
        },
        updateActiveMenu(){
            this.$nextTick(() => {
                this.$refs.leftMenu.updateOpened();
                this.$refs.leftMenu.updateOpenKeys();
                this.$refs.leftMenu.updateActiveName();
            })
        },
        menuLeft(name){
            console.log('menuLeft==========', name, this.$refs);
            if( !['info', 'avatar', 'password'].includes(name) ){
                this.$refs.leftMenu.opened = false;
                this.updateActiveMenu();
            }
            this.active_name_left = name;
        },
        menuTop(name){
            if (name == 'ceph') {
                this.leftMenuNode = this.cephLeftNode;
                this.active_name_left = 'ceph';
                this.updateActiveMenu();
            } 
            if (name == 'jointly') {
                this.leftMenuNode = this.jointlyLeftNode;
                this.active_name_left = 'jointly';
                this.updateActiveMenu();
            }
            if (name == 'download') {
                this.leftMenuNode = this.transmitLeftNode;
                this.active_name_left = 'download';
                this.updateActiveMenu();
            }
        },
        setTopUserInfo(){
            this.$axios({
                    method: 'post',
                    url: apis.getUrl('user_info'),
                    data: {cm_user_id: fns.getStorage('remember_user_id')}
                })
                .then(res => {
                    if (res.data.c === 0) {
                        //显示用户名、头像等操作
                        this.nickName = res.data.d.nick_name;
                        if(res.data.d.avatar){
                            this.top_avatar = res.data.d.avatar;
                        } else {
                            this.top_avatar = "http://middle.i-sanger.com/static/img/common/default_avatar.png";
                        }
                        //缓存起来备用
                        fns.setCache('cm_user_nickname', res.data.d.nick_name);
                        fns.setCache('cm_user_email', res.data.d.email);
                        fns.setCache('cm_user_avatar', this.top_avatar);
                        fns.setCache('cm_user_gender', ((res.data.d.gender == 0) ? '男' : '女'));
                    } else {
                        this.$Message.error(res.data.m);
                    }
                });
        },
        isEleEditable(e){
            if(!e){
                return false;
            }
            //为input标签或者contenteditable属性为true
            if(e.tagName == 'INPUT' || e.contentEditable == 'true'){
                return true;
            }else{
                //递归查询父节点
                return this.isEleEditable(e.parentNode)
            }
        },
        rightMenueInit(){
            const menu = new Menu();
            menu.append(new MenuItem({label:'复制', role: 'copy' }));
            menu.append(new MenuItem({label:'粘贴', role: 'paste' }));
            window.addEventListener('contextmenu', (e) => { 
                e.preventDefault();
                if(this.isEleEditable(e.target)){
                    menu.popup(remote.getCurrentWindow());
                }else{
                    //判断有文本选中
                    let selectText = window.getSelection().toString();
                    if(!!selectText){
                        menu.popup(remote.getCurrentWindow());
                    }
                }
            }, false) 

        },
        minimizeWindow () {
            const window = BrowserWindow.getFocusedWindow()
            window.minimize()
        },
        openMaxWindow () {
            document.getElementById('file-manager').style.height = '100%';
            document.getElementById('file-manager').style.margin = '0';

            const window = BrowserWindow.getFocusedWindow()
            this.listenerStatus.browserWindow = true;
            window.maximize();
        },
        openMiniWindow () {
            //当 开启透明时 isMaximized  无效
            // if (window.isMaximized()) {
            //     window.restore();
            // } else {
            //     window.maximize();
            // }
            document.getElementById('file-manager').style.height = '98%';
            document.getElementById('file-manager').style.margin = '0.5%';

            const window = BrowserWindow.getFocusedWindow()
            this.listenerStatus.browserWindow = false;
            window.unmaximize();
        },
        closeWindow () {
            const window = BrowserWindow.getFocusedWindow()
            window.close()
        },
        clearTash () {
            this.$Modal.confirm({
                title: '提示消息',
                content: '请在没有文件下载的情况下，进行此操作！！！',
                onOk: () => {
                    db.set('download', []).write();
                    this.$Message.success('操作成功！');
                },
                onCancel: () => {
                }
            });
        },
        setDownpath () {
            let dbPath = db.read().get('userData').find({ username: fns.getStorage('remember_username') }).value();
            let strPath = '';
            if ('undefined' !== typeof(dbPath)) {
                if (dbPath.path) {
                    console.log('dbPath===========================',dbPath.path);
                    strPath = '<p style="color:#f90">当前路径:'+dbPath.path+'</p><p style="height:10px"></p>';
                }
            }
            this.$Modal.confirm({
                title: '提示消息',
                content: strPath+'<p>设置文件下载路径</p>',
                onOk: () => {
                    this.$electron.ipcRenderer.send('DOWNLOAD_PATH', {username: fns.getStorage('remember_username'), status:false});
                },
                onCancel: () => {
                }
            });
        },
        remindUpdate () {
            this.$axios({
                method: 'post',
                url: apis.getUrl('update_info'),
                data: {'version': db.read().get('updateLog').value().version}
            })
            .then(res => {
                if (res.data.c === 0) {
                    let remindVersion = db.read().get('remind').find({ version: res.data.d.version }).value();
                    if (!remindVersion) {
                        this.$Modal.confirm({
                            title: '更新提示',
                            content: '<p>发现新的版本，是否现在更新</p>',
                            cancelText: '不再提醒',
                            onOk: () => {
                                db.read().set('updateLog', {
                                    version: res.data.d.version, 
                                    content: res.data.d.content
                                }).write();
                                this.$electron.ipcRenderer.send('DOWNLOAD_UPDATE', false);
                            },
                            onCancel: () => {
                                db.read().get('remind')
                                .push({version: res.data.d.version})
                                .write()
                            }
                        });
                    }
                }
            });
        },
        checkUpdate () {
            this.$axios({
                method: 'post',
                url: apis.getUrl('update_info'),
                data: {'version': db.read().get('updateLog').value().version}
            })
            .then(res => {
                if (res.data.c === 0) {
                    db.read().set('updateLog', {
                        version: res.data.d.version, 
                        content: res.data.d.content
                    }).write();
                    this.$electron.ipcRenderer.send('DOWNLOAD_UPDATE', false);
                } else {
                    this.$Message.error(res.data.m);
                }
            });
        },
        clearMainMask () {
            let uploadCount = 0;
            this.uploadNum.forEach((item, index) => {
                if (true === this.uploadNum[index].isUnderway) {
                    uploadCount++;
                }
            })

            let downloadCount = 0;
            this.downloadNum.forEach((item, index) => {
                if (true === this.downloadNum[index].isUnderway) {
                    downloadCount++;
                }
            })
            /******main进程 上传和下载 退出******/
            //main进程正在上传
            if (0 < Number(uploadCount)) {
                //限制文件更新
                this.$store.dispatch('listenerStatus/uploadPauseAll', true)
                //清空主进程 文件队列
                this.$electron.ipcRenderer.send('UPLOAD_CLEAR_ALL', {event: 'LOG_OUT_CALL', status: true});
            }

            //main进程正在下载
            if (0 < Number(downloadCount)) {
                //限制文件更新
                this.$store.dispatch('listenerStatus/downloadPauseAll', true)
                //清空主进程 文件队列
                this.$electron.ipcRenderer.send('DOWNLOAD_CLEAR_ALL', {event: 'LOG_OUT_CALL', status: true});
            }

            //main 进程没有文件上传和下载
            if (0 === Number(uploadCount) && 0 === Number(downloadCount)) {
                console.log('主进程无任务退出！');
                this.logOut();
            }
        },
        logOut () {
            //移除render层所有listener 
            this.$electron.ipcRenderer.removeAllListeners('UPLOAD_ERROR');
            this.$electron.ipcRenderer.removeAllListeners('UPLOAD_START');
            this.$electron.ipcRenderer.removeAllListeners('UPLOAD_PROGRESS');
            this.$electron.ipcRenderer.removeAllListeners('UPLOAD_SUCCESS');

            this.$electron.ipcRenderer.removeAllListeners('DOWNLOAD_ERROR');
            this.$electron.ipcRenderer.removeAllListeners('DOWNLOAD_START');
            this.$electron.ipcRenderer.removeAllListeners('DOWNLOAD_PROGRESS');
            this.$electron.ipcRenderer.removeAllListeners('DOWNLOAD_ERROR_NET');
            this.$electron.ipcRenderer.removeAllListeners('DOWNLOAD_AUTO');

            this.$electron.ipcRenderer.removeAllListeners('initOnce');
            this.$electron.ipcRenderer.removeAllListeners('UPLOAD_CLEAR_ALL_CALL');
            this.$electron.ipcRenderer.removeAllListeners('DOWNLOAD_CLEAR_ALL_CALL');
            this.$electron.ipcRenderer.removeAllListeners('LOG_OUT_CALL');

            //vuex相关数据清空
            this.$store.dispatch('listenerStatus/initSelf', []);
            this.$store.dispatch('uploadList/initSelf', []);
            this.$store.dispatch('downloadList/initSelf', []);
            this.$store.dispatch('completedList/initSelf', []);
            console.log('LOG_OUT_CALL---------------------渲染层',  db.read().value());
            this.$router.push('/login');
        },
        initPreventDefault () {
            document.addEventListener ("drag", function( event ) { 
                event.preventDefault();
            }, false);

            document.addEventListener ("dragstart", function( event ) { 
                event.preventDefault();
            }, false);

            document.addEventListener ("dragend", function( event ) { 
                event.preventDefault();
            }, false);

            document.addEventListener ("dragover", function( event ) { 
                event.preventDefault();
            }, false);

            document.addEventListener ("dragenter", function( event ) { 
                event.preventDefault();
            }, false);

            document.addEventListener ("dragleave", function( event ) { 
                event.preventDefault();
            }, false);

            document.addEventListener ("drop", function( event ) { 
                event.preventDefault();
            }, false);
        }
    }
}
</script>