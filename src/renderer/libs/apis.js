let apis = {
    //接口前缀

    //prefix: 'http://middle.nngs.com',
    prefix: 'http://middle.tngs.com',
    //prefix: 'http://middle.i-sanger.com',
    
    //账号密码登录接口
    user_login: '/Proxy/User/login',
    //验证码获取
    user_get_verify: '/Proxy/User/getVerify',
    //短信快捷登录
    user_login_verify: '/Proxy/User/loginVerify',
    //token快捷登录
    user_login_jwt: '/Proxy/User/loginJwt',
    //注册接口
    register: '/Auth/register',
    //用户资料获取
    user_info: '/Proxy/User/info',
    //用户修改密码
    user_password: '/User/password',
    //用户资料修改
    user_edit: '/Proxy/User/edit',
    //用户头像
    user_avatar: '/Proxy/User/avatar',
    //用户列表
    user_list: '/User/getList',

    //用户当前文件列表
    folder_browse: '/Proxy/Folder/browse',
    folder_batch_down: '/Proxy/Folder/batchDown',
    folder_url_update: '/Proxy/Folder/urlUpdate',
    //用户当前文件列表
    folder_create: '/Folder/create',
    //用户当前文件列表
    folder_edit: '/Folder/edit',
    //用户当前文件列表
    folder_delete_logic: '/Proxy/Folder/deleteLogic',
    //用户当前文件列表
    folder_tree: '/Folder/tree',
    //移动tree 节点
    folder_move_tree: '/Folder/moveTree',
    //面包屑
    folder_bread: '/Folder/bread',

    //分享
    folder_share: '/Proxy/Folder/share',
    //提取文件
    folder_extract: '/Proxy/Folder/extract',
    folder_extract_list: '/Proxy/Folder/extractList',
    //我的分享
    folder_myshare: '/Proxy/Folder/myshare',
    //取消分享
    folder_share_cancel: '/Proxy/Folder/shareCancel',

    //共享
    folder_jointly: '/Folder/jointly',
    //共享列表
    folder_jointly_list: '/Folder/jointlyList',
    //共享
    folder_jointly_tree: '/Folder/jointlyTree',
    //共享
    folder_jointly_bread: '/Folder/jointlyBread',
    
    //回收站列表
    folder_trash: '/Proxy/Folder/trash',
    //文件恢复
    folder_trash_restore: '/Proxy/Folder/trashRestore',
    //回收站 删除
    folder_trash_delete: '/Proxy/Folder/trashDelete',

    //上传web api 端 中转
    object_create: '/Objects/create',
    //下载文件
    object_down: '/Objects/down',
    //文件名称修改
    object_edit: '/Objects/edit',
    //共享上传 暂时分开
    object_jointly_create: '/Objects/jointlyCreate',
    //批量下载文件
    object_batch_down: '/Objects/batchDown',

    //桌面客户端文件保存
    object_save_message: '/Objects/saveMessage',
    object_save_message_jointly: '/Objects/saveMessageJointly',

    //文件错误日志
    object_error_loger: '/Objects/errorLoger',

    //分段上传 有中转
    create_fragment: '/Objects/createFragment',
    //分段上传 直传ceph
    multipart_upload: '/Objects/multipartUpload',

    //应用更新
    update_info: '/Proxy/App/updateInfo',

    //分段上传 测试
    test: '/Objects/test',
    //错误接口
    err: '/error',

    //取得完整接口地址
    getUrl: function(u){
        if( ! this.hasOwnProperty(u)){
            //如果不存在此接口
            u = 'err';
        }
        return apis.prefix + apis[u];
    }
};

export default apis;
