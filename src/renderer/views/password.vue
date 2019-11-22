<template>
    <div>
        <h2><Icon type="md-lock" /> 修改密码</h2>
        <i-form ref="passwordForm" :model="passwordForm" :rules="ruleInPassword" style="margin-top:16px;">
            <Form-item prop="oldPassword">
                <i-input size="large" type="password" v-model="passwordForm.oldPassword" placeholder="请输入原密码">
                    <span slot="prepend">原密码</span>
                </i-input>
            </Form-item>
            <Form-item prop="newPassword">
                <i-input size="large" type="password" v-model="passwordForm.newPassword" placeholder="请输入新密码">
                    <span slot="prepend">新密码</span>
                </i-input>
            </Form-item>
            <Form-item prop="repeatNewPassword">
                <i-input size="large" type="password" v-model="passwordForm.repeatNewPassword" placeholder="请再次输入新密码">
                    <span slot="prepend">再次输入新密码</span>
                </i-input>
            </Form-item>
            <Form-item>
                <i-button type="primary" :loading="loading" @click="handleSubmit('passwordForm')" icon="md-checkmark">提交</i-button>
            </Form-item>
        </i-form>
    </div>
</template>
<script>
    export default {
        name: 'password',
        data() {
            return {
                loading: false,
                passwordForm: {
                    oldPassword: "",
                    newPassword: "",
                    repeatNewPassword: ""
                },
                ruleInPassword: {
                    oldPassword: [
                        { required: true, message: '请输入原密码', trigger: 'blur' },
                        { type: 'string', min: 6, message: '密码最少 6 位', trigger: 'blur' }
                    ],
                    newPassword: [
                        { required: true, message: '请输入新密码', trigger: 'blur' },
                        { type: 'string', min: 6, message: '密码最少 6 位', trigger: 'blur' }
                    ],
                    repeatNewPassword: [
                        { required: true, message: '请再次输入新密码', trigger: 'blur' },
                        { type: 'string', min: 6, message: '密码最少 6 位', trigger: 'blur' }
                    ]
                }
            };
        },
        methods: {
            //提交表单
            handleSubmit(name)
            {
                this.loading = true;
                this.$refs[name].validate((valid) => {
                    if (valid) {
                        var params = {
                            'old_password': this.passwordForm.oldPassword,
                            'new_password': this.passwordForm.newPassword,
                            'repeat_new_password': this.passwordForm.repeatNewPassword,
                            'cm_user_id': fns.getStorage('remember_user_id')
                        };
                        if(params.new_password != params.repeat_new_password){
                            this.$Message.error('两次输入密码不一致');
                            this.loading = false;
                            return;
                        }
                        this.$axios({
                                method: 'post',
                                url: apis.getUrl('user_edit'),
                                data: this.$qs.stringify(params)
                            })
                            .then(res => {
                                if (res.data.c === 0) {
                                    //提示消息
                                    this.$Message.success('修改成功！');
                                    //清空输入框
                                    this.passwordForm.oldPassword = '';
                                    this.passwordForm.newPassword = '';
                                    this.passwordForm.repeatNewPassword = '';
                                } else {
                                    this.$Message.error(res.data.m);
                                }
                                this.loading = false;
                            });
                    } else {
                        this.$Message.error(':-(');
                        this.loading = false;
                    }
                });
            }
        }
    }
</script>
