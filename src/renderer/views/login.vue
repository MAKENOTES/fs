<style scoped lang="less">
body{
    margin: 0;
    padding: 0;
    background-color: #eff4f8;
}
.head2{
    font-size: 18px;
    font-weight: bold;
    text-align: center!important;
}
#login-page {
    height: 100%;
    position: relative;
    background-image: url("../static/images/login-bg.png");
    background-size: 100% 100%;
    background-repeat: no-repeat;
    border-radius: 4px;
}
.login-head {
    border: none;
}
.login-container{
    -webkit-border-radius: 10px;
    border-radius: 10px;
    -moz-border-radius: 10px;
    background-clip: padding-box;
    margin: auto;
    margin-top: 100px;
    width: 390px;
    padding: 50px 35px 0 35px;
    background: #fff;
    border: 1px solid #eaeaea;
    box-shadow: 0 0 25px #cac6c6;
    opacity:0.9;
}
.login-window {
    height: 74px;
    line-height: 74px;
}
.part-two{
    border-bottom: none; 
}
.fake-bar{
    color: #999;
}
.reg_div{
    margin: 0;
    text-align: right;
    font-size: 12px;
    color: #999;
}
.reg_div span{
    cursor: pointer;
    color: #409EFF;
}
.title_left {
    float:left;
    font-size: 16px;
    color: black;
}
.title_right {
    float:right;
    font-size: 14px;
    color:#2b85e4;
    cursor: pointer;
}
.codeGetingBtn {
    margin-left: 58px;
    width: 100px;
    line-height: 23px;
    background: aliceblue;
}
.codeGeting {
    //background: #cdcdcd;
    border-color: #cdcdcd;
}
</style>

<template>
<div id="login-page">
    <div class="part-one login-head">
        <Row type="flex" justify="center" align="middle" style="background-color: #2b85e4;opacity: 0.7;border-radius: 4px 4px 0 0;">
            <i-col span="21">
                &nbsp;
                <div class="login-window" style="padding-left: 10px;">
                    <img src="../static/images/logo.png" />
                </div>
            </i-col>
            <i-col span="3">
                <div class="distance-main login-window">

                    <span v-if="'win32' === os">


                        <svg  @click="minimizeWindow" class="icon-self-base fake-bar" aria-hidden="true" >
                            <use xlink:href="#icons-minimize"></use>
                        </svg>
                        <svg v-if="false === listenerStatus.browserWindow" @click="openMaxWindow" class="icon-self-base fake-bar" aria-hidden="true" >
                            <use xlink:href="#icons-max"></use>
                        </svg>

                        <svg v-if="true === listenerStatus.browserWindow" @click="openMiniWindow" class="icon-self-base fake-bar" aria-hidden="true" >
                            <use xlink:href="#icons-min"></use>
                        </svg>

                        <svg @click="closeWindow" class="icon-self-base fake-bar" aria-hidden="true" >
                            <use xlink:href="#icons-close"></use>
                        </svg>

                        <!-- <Icon class="fake-bar" @click="minimizeWindow" type="md-remove" size="22" /> -->

                        <!-- <Icon v-if="false === listenerStatus.browserWindow" class="fake-bar" @click="openMaxWindow" type="md-square-outline" size="16" />
                        <Icon v-if="true === listenerStatus.browserWindow" class="fake-bar" @click="openMiniWindow" type="ios-browsers-outline"  size="16" />
                        
                        <Icon class="fake-bar" @click="closeWindow" type="md-close" size="22" /> -->
                    </span>
                </div>
            </i-col>
        </Row>
    </div>
    <div class="part-two">
        <Row type="flex" justify="center" align="middle">
            <i-col span="24">
                <div class="login-container">
                    <Form ref="loginAccount" :model="loginAccount" :rules="ruleAccount" v-show="switchLabel == 'loginAccount'" >
                        <FormItem>
                            <span class="title_left" >帐号密码登录</span>
                            <span class="title_right" @click="switchLogin('loginSms')" >短信快捷登录></span>
                        </FormItem>
                        <FormItem prop="username">
                            <i-input type="text" size="large" v-model="loginAccount.username" placeholder="Email">
                                <Icon type="md-person" slot="prepend"></Icon>
                            </i-input>
                        </FormItem>
                        <FormItem prop="password">
                            <i-input type="password" size="large" v-model="loginAccount.password" placeholder="密码">
                                <Icon type="md-lock" slot="prepend"></Icon>
                            </i-input>
                        </FormItem>
                        <FormItem>
                            <Checkbox v-model="checked">记住账号</Checkbox>
                        </FormItem>
                        <FormItem>
                            <Button type="primary" size="large" :loading="loading" @click="handleSubmit('loginAccount')" long>登录</Button>
                        </FormItem>
                        <!-- <FormItem>
                            <p class="reg_div"><i class="el-icon-question"></i> 还没有账号？马上<span @click="goUrlRegister">注册</span></p>
                        </FormItem> -->
                    </Form>

                    <Form ref="loginSms" :model="loginSms" :rules="ruleSms" v-show="switchLabel == 'loginSms'" >
                        <FormItem>
                            <span class="title_left" >短信快捷登录</span>
                            <span class="title_right" @click="switchLogin('loginAccount')" >帐号密码登录></span>
                        </FormItem>
                        <FormItem prop="phone">
                            <i-input type="text" size="large" v-model="loginSms.phone" placeholder="手机号">
                                <Icon type="md-phone-portrait" slot="prepend"></Icon>
                            </i-input>
                        </FormItem>
                        <FormItem prop="verify">
                            <i-input type="text" size="large" style="width:160px;float: left;" v-model="loginSms.verify" placeholder="验证码">
                                <Icon type="md-mail" slot="prepend"></Icon>
                            </i-input>
                            <Button :class="{ codeGeting:isGeting }" class="codeGetingBtn" :disabled="disable"  @click="getVerifyCodes" >{{getCode}}</Button>
                        </FormItem>
                        <FormItem><Tag v-show="username != ''" checked @click.native="resureAccount" color="blue">{{username}}</Tag></FormItem>
                        <FormItem>
                            <Button type="primary" size="large" :loading="loading" @click="handleSubmit('loginSms')" long>登录</Button>
                        </FormItem>
                    </Form>
                </div>
            </i-col>
        </Row>
    </div>
    <Modal 
        v-model="allAccountLayer" 
        title="选择登录账号" 
        :styles="{top: '200px'}"
        :width="420"> 
            <Row>
                <i-col  v-for="item in allAccount" span="12" style=" margin-top: 10px">
                    <Tag checked @click.native="sureAccount(item.id, item.username)"  color="blue">{{item.username}}</Tag>
                </i-col>
            </Row>
            <div slot="footer">
            </div>  
    </Modal>
</div>
</template>

<script>
import {mapState,mapGetters,mapActions} from 'vuex';
import { remote } from 'electron';
const { Menu, dialog, BrowserWindow } = remote;
export default {
    data() {
        return {
            switchLabel: 'loginAccount',
            loginAccount: {
                username: "",
                password: ""
            },
            ruleAccount: {
                username: [
                    { required: true, message: '请输入Email', trigger: 'blur' }
                ],
                password: [
                    { required: true, message: '请输入密码', trigger: 'blur' },
                    { type: 'string', min: 6, message: '密码最少 6 位', trigger: 'blur' }
                ]
            },
            loginSms: {
                phone: "",
                verify: ""
            },
            ruleSms: {
                phone: [
                    { required: true, message: '请输入手机号', trigger: 'blur' }
                ],
                verify: [
                    { required: true, message: '请输入验证码', trigger: 'blur' },
                    { type: 'string', min: 6, message: '有效的验证码', trigger: 'blur' }
                ]
            },
            allAccountLayer: false,
            allAccount: [],
            username: '',
            checked: true,
            loading: false,
            getCode:'获取验证码',
            isGeting:false,
            count:60,
            disable:false,
            os: '',
        };
    },
    created () {
        console.log('remember_username==========================', fns.getStorage('remember_username'));
        let tempObj = this;
        document.onkeydown = function(e) {
            let key = window.event.keyCode;
            if (key == 13) {
                tempObj.handleSubmit('loginAccount');
            }
        }
        this.os = process.platform
    },
    mounted() {
        //进入页面把账号密码还原
        this.resumeAccount();
    },
    computed: {
        ...mapGetters('listenerStatus',{
            listenerStatus:'getList'
        })
    },
    methods: {
        switchLogin (label) {
            this.switchLabel = label;
        },
        getVerifyCodes () {
            var countDown = setInterval(()=>{
                if(this.count < 1){
                    this.isGeting = false;
                    this.disable = false;
                    this.getCode = '获取验证码';
                    this.count = 60;
                    clearInterval(countDown);
                }else{
                    this.isGeting = true;
                    this.disable = true;
                    this.getCode = this.count-- + 's后重发';
                }
            },1000);

            let params = {
                'cm_user_phone': this.loginSms.phone,
            };
            //获取验证码
            this.$axios({
                method: 'post',
                url: apis.getUrl('user_get_verify'),
                data: this.$qs.stringify(params)
            })
            .then(res => {
                if (res.data.c === 0) {
                    if (res.data.d.user.length > 1) {
                        this.allAccount = res.data.d.user;
                        this.allAccountLayer = true;
                    } else {
                        fns.setStorage('remember_user_id', res.data.d.user[0].id);
                    }
                    fns.setStorage('middle_flag', res.data.d.MiddleFlag);
                } else {
                    this.$Message.error(res.data.m);
                }
            });

        },
        sureAccount (id, username) {
            fns.setStorage('remember_user_id', id);
            this.username = username;
            this.allAccountLayer = false;
        },
        resureAccount () {
            this.allAccountLayer = true;
        },
        //登录之后，还原账号密码
        resumeAccount () {
            //调用 fns.getStorage 还原账号密码
            let i_username = fns.getStorage('remember_username');
            //var i_password = fns.getStorage('remember_password');
            //记住账号
            if(this.checked){
                this.loginAccount.username = i_username;
            }
            //this.loginAccount.password = i_password;
        },
        //注册页面
        goUrlRegister () {
            this.$router.push('/register');
        },
        //提交表单
        handleSubmit (name) {
            this.loading = true;
            this.$refs[name].validate((valid) => {
                if (valid) {
                    //账号密码登录
                    if ('loginAccount' == this.switchLabel) {
                        this.loginByAccount();
                    }
                    //短信登录
                    if ('loginSms' == this.switchLabel) {
                        this.loginBySms();
                    }
                } else {
                    this.$Message.error('请重新填写');
                    this.loading = false;
                }
            });
        },
        loginByAccount () {
            fns.setStorage('middle_flag', '');
            let params = {
                'cm_user_username': this.loginAccount.username,
                'cm_user_password': this.loginAccount.password
            };
            this.$axios({
                method: 'post',
                url: apis.getUrl('user_login'),
                data: this.$qs.stringify(params)
            })
            .then(res => {
                if (res.data.c === 0) {
                    //保存token、user_id
                    fns.setStorage('Jwt', res.data.d.Jwt);
                    fns.setStorage('middle_flag', res.data.d.MiddleFlag);
                    fns.setStorage('remember_user_id', res.data.d.user_id);
                    fns.setStorage('remember_username', params.cm_user_username);

                    //备用
                    fns.setStorage('remember_bucket_id', 0);
                    fns.setStorage('remember_bucket_name', 'bucket_name');
                    //this.$electron.ipcRenderer.send('INIT_CONFIGSERVICE', res.data.d);

                    //跳转到首页
                    this.$router.push('/');
                } else {
                    this.$Message.error(res.data.m);
                    this.loading = false;
                }
            });
        },
        loginBySms () {
            if (!fns.getStorage('middle_flag')) {
                this.$Message.error('请重新获取验证码');
                this.loading = false;
                return false;
            }
            if (!fns.getStorage('remember_user_id')) {
                this.$Message.error('未选择用户');
                this.loading = false;
                this.allAccountLayer = true;
                return false;
            }
            let params = {
                'cm_user_phone': this.loginSms.phone,
                'cm_user_verify': this.loginSms.verify,
                'cm_user_id': fns.getStorage('remember_user_id')
            };
            this.$axios({
                method: 'post',
                url: apis.getUrl('user_login_verify'),
                data: this.$qs.stringify(params)
            })
            .then(res => {
                if (res.data.c === 0) {
                    //保存token、user_id
                    fns.setStorage('Jwt', res.data.d.Jwt);
                    // fns.setStorage('middle_flag', res.data.d.MiddleFlag);
                    fns.setStorage('remember_user_id', res.data.d.user_id);
                    fns.setStorage('remember_username', res.data.d.username);

                    //备用
                    fns.setStorage('remember_bucket_id', 0);
                    fns.setStorage('remember_bucket_name', 'bucket_name');
                    //this.$electron.ipcRenderer.send('INIT_CONFIGSERVICE', res.data.d);

                    //跳转到首页
                    this.$router.push('/');
                } else {
                    this.$Message.error(res.data.m);
                    this.loading = false;
                }
            });
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
    }
};
</script>
