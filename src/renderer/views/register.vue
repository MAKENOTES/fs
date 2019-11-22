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
.login-wrap{
    width: 100%;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    .ivu-row-flex{
        height: 100%;
    }
}
.login-container{
    -webkit-border-radius: 10px;
    border-radius: 10px;
    -moz-border-radius: 10px;
    background-clip: padding-box;
    margin: auto;
    width: 390px;
    padding: 50px 35px 0 35px;
    background: #fff;
    border: 1px solid #eaeaea;
    box-shadow: 0 0 25px #cac6c6;
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
</style>

<template>
    <div class="login-wrap">
        <Row type="flex" justify="center" align="middle">
            <Col span="24">
                <Form ref="regForm" :model="regForm" :rules="ruleInline" class="login-container">
                    <FormItem>
                        <p class="head2"><Icon type="archive"></Icon> 美吉生物网盘系统</p>
                    </FormItem>
                    <FormItem prop="username">
                        <Input type="text" size="large" v-model="regForm.username" placeholder="Email">
                            <Icon type="md-person" slot="prepend"></Icon>
                        </Input>
                    </FormItem>
                    <FormItem prop="password">
                        <Input type="password" size="large" v-model="regForm.password" placeholder="密码">
                            <Icon type="md-lock" slot="prepend"></Icon>
                        </Input>
                    </FormItem>
                    <FormItem>
                        <Button type="primary" size="large" :loading="loading" @click="handleSubmit('regForm')" long>注册</Button>
                    </FormItem>
                    <FormItem>
                        <p class="reg_div"><i class="el-icon-question"></i> 已经有账号？去<span @click="goUrlLogin">登录</span></p>
                    </FormItem>
                </Form>
            </Col>
        </Row>
    </div>
</template>

<script>
export default {
    data() {
        return {
            regForm: {
                username: "",
                password: ""
            },
            ruleInline: {
                username: [
                    { required: true, message: '请输入Email', trigger: 'blur' }
                ],
                password: [
                    { required: true, message: '请输入密码', trigger: 'blur' },
                    { type: 'string', min: 6, message: '密码最少 6 位', trigger: 'blur' }
                ]
            },
            checked: true,
            loading: false
        };
    },
    methods: {
        //登录页面
        goUrlLogin()
        {
            this.$router.push('/login');
        },
        //提交表单
        handleSubmit(name)
        {
            this.loading = true;
            this.$refs[name].validate((valid) => {
                if (valid) {
                    var params = {
                        'cm_user_email': this.regForm.username,
                        'cm_user_password': this.regForm.password
                    };
                    this.$axios({
                            method: 'post',
                            url: apis.getUrl('register'),
                            data: this.$qs.stringify(params)
                        })
                        .then(res => {
                            if (res.data.c === 0) {
                                fns.setStorage('remember_username', params.cm_user_email);
                                fns.setStorage('remember_password', params.cm_user_password);
                                //注册成功
                                this.$Message.success('注册成功！');
                                this.$router.push('/login');
                            } else {
                                this.$Message.error(res.data.m);
                                this.loading = false;
                            }
                        });
                } else {
                    this.$Message.error(':-(');
                    this.loading = false;
                }
            });
        }
    }
};
</script>
