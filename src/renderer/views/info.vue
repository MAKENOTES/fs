<template>
    <div>
        <h2><Icon type="md-document" /> 个人资料</h2>
        <Row type="flex">
            <Col span="12">
                <div style="padding:18px;">
                    <Card style="width:320px">
                        <p slot="title">
                            <Icon type="ios-film-outline" />
                            资料
                        </p>
                        <a slot="extra" @click="showEditForm">
                            <Icon type="ios-build" />
                            修改
                        </a>
                        <div style="text-align:center;">
                            <p class="big_avatar"><img :src="cm_user_avatar"></p>
                            <h3>{{cm_user_nickname}}</h3>
                            <h4>{{cm_user_email}}</h4>
                        </div>
                    </Card>
                </div>
            </Col>
            <Col span="12">
                <Form style="margin-top:16px;" v-show="showEdit">
                    <FormItem>
                        <Input size="large" type="text" v-model="cm_user_nickname" placeholder="请输入昵称">
                            <span slot="prepend">昵称</span>
                        </Input>
                    </FormItem>
                    <FormItem>
                        <RadioGroup v-model="cm_user_gender">
                            <Radio label="男"></Radio>
                            <Radio label="女"></Radio>
                        </RadioGroup>
                    </FormItem>
                    <FormItem>
                        <Button type="primary" :loading="loading" @click="handleSubmit('infoForm')" icon="md-checkmark">提交</Button>
                    </FormItem>
                </Form>
            </Col>
        </Row>
    </div>
</template>
<script>
    export default {
        name: 'info',
        data() {
            return {
                loading: false,
                cm_user_nickname: fns.getCache('cm_user_nickname'),
                cm_user_avatar: fns.getCache('cm_user_avatar'),
                cm_user_email: fns.getCache('cm_user_email'),
                cm_user_gender: fns.getCache('cm_user_gender'),
                showEdit: false,
            };
        },
        mounted(){
            ;
        },
        methods: {
            //显示隐藏编辑表单
            showEditForm(){
                this.showEdit = true;
            },
            //提交表单
            handleSubmit(name)
            {
                this.loading = true;
                var params = {
                    'cm_user_nickname': this.cm_user_nickname,
                    'cm_user_gender': this.cm_user_gender,
                    'cm_user_id': fns.getStorage('remember_user_id')
                };
                this.$axios({
                        method: 'post',
                        url: apis.getUrl('user_edit'),
                        data: this.$qs.stringify(params)
                    })
                    .then(res => {
                        if (res.data.c === 0) {
                            //提示消息
                            this.$Message.success('修改成功！');
                            //更新顶部nickname
                            this.bus.$emit('change_nickname', this.cm_user_nickname);
                            //更新
                            fns.setCache('cm_user_nickname', this.cm_user_nickname);
                            fns.setCache('cm_user_gender', this.cm_user_gender);
                        } else {
                            this.$Message.error(res.data.m);
                        }
                        this.loading = false;
                    });
            }
        }
    }
</script>

<style scoped lang="less">
    .big_avatar img{
        background-color: #fff;
        width: 100px;
        height: 100px;
        border-radius: 50px;
    }
</style>
