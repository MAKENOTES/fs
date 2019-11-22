<template>
    <div>
        <Row type="flex">
            <Col span="12">
                <h2><Icon type="md-person" /> 上传头像</h2>
                <div style="margin-top:18px;">
                    <Upload
                        ref = "uploadAvatar"
                        :action="avatar_url"
                        :on-success="handleSuccess"
                        :format="['jpg', 'jpeg', 'png', 'gif']"
                        :on-format-error="handleFormatError"
                        :max-size="1024"
                        :on-exceeded-size="handleMaxSize"
                        :headers="upload_headers"
                        :show-upload-list="false"
                        :data = data
                    >
                        <Button type="info" icon="ios-cloud-upload-outline">选择</Button>
                    </Upload>
                </div>
            </Col>
            <Col span="12">
                <div style="padding:20px">
                    <Card :bordered="true">
                        <p slot="title">当前头像</p>
                        <p class="big_avatar" style="text-align:center;"><img :src="cm_user_avatar" /></p>
                    </Card>
                </div>
            </Col>
        </Row>
    </div>
</template>
<script>
    export default {
        name: 'avatar',
        data() {
            return {
                cm_user_avatar: fns.getCache('cm_user_avatar'),
                avatar_url: apis.getUrl('user_avatar'),
                upload_headers: {'Jwt': fns.token('Jwt'), 'MiddleFlag': fns.getStorage('middle_flag')},
                data: {'cm_user_id': fns.getStorage('remember_user_id')}
            };
        },
        mounted(){
            //得到用户资料
            //this.fetchUserAvatar();
        },
        methods: {
            handleSuccess (res, file) {
                if(res.c === 0){
                    this.$Message.success('上传头像成功');
                    this.cm_user_avatar = res.d.avatar;
                    this.bus.$emit('change_avatar', this.cm_user_avatar);
                    //更新 fns.setCache('cm_user_avatar')
                    fns.setCache('cm_user_avatar', this.cm_user_avatar);
                }else{
                    this.$Notice.error({
                        title: '上传失败',
                        desc: res.m
                    });
                }
            },
            handleFormatError (file) {
                this.$Notice.warning({
                    title: '格式错误',
                    desc: '上传头像图片格式【jpg, png, gif】'
                });
            },
            handleMaxSize (file) {
                this.$Notice.warning({
                    title: '图片太大',
                    desc: '图片大小不能超过512K.'
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
    .ivu-upload-list{
        display: none;
    }
</style>
