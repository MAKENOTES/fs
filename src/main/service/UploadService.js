const fs = require('fs');
const notifier = require('node-notifier');
const async = require("async");

let mainWindow = null;
let s3 = null;
let uploadPause = {
    fileId: '',
    status: false
}
let uploadRemove = {
    fileId: '',
    status: false
}
let clearAll = {
    event: 'UPLOAD_CLEAR_ALL_CALL',
    status: false
};
//定义一个queue， 设worker数量为2
let uploadQueue = async.queue(function(task, callback){
    //console.log('worker is processing task: ' + task.name);
    task.run(callback);
}, 2);

/**
 * 将数据从主电子处理程序发送到呈现程序。
 * 只有在首先实例化窗口时才有效
 * @param thread
 * @param data
 */
const sendWebContentsMessage = (thread, data) => {
    if (mainWindow !== undefined) {
        mainWindow.webContents.send(thread, {
            data,
        });
    } else {
        console.warn('mainWindow is not defined, sending message ignored...');
    }
};

/**
 * 发送操作系统级别的通知
 * @param title
 * @param message
 */
const sendNotification = (title, message) => {
    notifier.notify({
        title,
        message,
    });
};


/**
 * 管理文件块 上传
 * 
 * @param uploadParam
 * @param cb
 */
const uploadPiece = (uploadParam, cb) => new Promise((resolve, reject) => {
    console.log('clearAll========================', clearAll);
    //全部取消
    if (true === clearAll.status) {
        uploadParam.isUnderway = false;
        cb(uploadParam);
    }

    //暂停上传
    if (true ===  uploadPause.status && uploadPause.FileId == uploadParam.FileId) {
        uploadPause.FileId = '';
        uploadPause.status = false;
        //队列回调  进行下个任务
        uploadParam.isUnderway = false;
        cb(uploadParam);
        
    }
    //取消上传
    if (true ===  uploadRemove.status && uploadRemove.FileId == uploadParam.FileId) {
        uploadRemove.FileId = '';
        uploadRemove.status = false;
        //队列回调  进行下个任务
        uploadParam.isUnderway = false;
        cb(uploadParam);
    }
    
    if (false === uploadParam.isUnderway) {
        return reject(uploadParam);
    }

    if (true ===  uploadParam.isUnderway) {
        s3.multipartUploadFile(uploadParam)
        .then(function (result) {
            if (result.isComplete == true) {
                return reject(result);
            } else {
                return resolve(result);
            }
        })
        .catch(function (reason) {
            return reject(reason);
        });
    }

});

/**
 * 设置文件块的 相关文件信息
 * 
 * @param file
 */
const setFileAndUpload = (file, cb, chunkNumCurrent = 1, uploadParam = {}) => {
    let path = file.path; //文件本地路径 
    let stats = fs.statSync(path);//读取文件信息
    let chunkSize = 10*1024*1024;//每片分块的大小10M
    let size = stats.size;//文件大小
    let pieces = Math.ceil(size / chunkSize);//总共的分片数  
    let endData = Math.min(size, (chunkNumCurrent) * chunkSize);//计算每块的结束位置

    //续传 文件参数设置
    if (file.progress != 0) {
        uploadParam = file;
    }

    //只在第一次运行
    if (JSON.stringify(uploadParam) == "{}") {
        //fs 和 s3 重要字段
        file.chunkNum = chunkNumCurrent,
        file.pieces = pieces,
        file.chunkSize = chunkSize, 
        file.endData = endData,
        //回调传参
        uploadParam  =  file; 
    }

    uploadPiece(uploadParam, cb)
        .then(function (params) {
            //console.log('AAAAAAAAAA-----------------setFileAndUpload', params);
            params.chunkNum = params.chunkNum+1;
            params.endData = Math.min(params.size, (params.chunkNum) * params.chunkSize);
            setFileAndUpload(file, cb, params.chunkNum, params)
        })
        .catch(function (result) {
            //console.log('BBBBBBBBBB-----------------setFileAndUpload', result);
            if (true === result.isComplete) {
                //队列回调 让其下个任务接着执行
                cb(result);
                sendNotification(result.name+'文件上传完成!', 'Link has been copied to clipboard');
                sendWebContentsMessage('UPLOAD_SUCCESS', result);
            } 
        });
    
};


/**
 * 管理文件上传
 * 
 * @param Window
 * @param s3Obj
 */
class UploadService {

    constructor (Window, s3Obj) {
        mainWindow = Window;
        s3 = s3Obj;
    }

    /**
     * 文件上传 队列管理
     * 
     * @param Bucket
     * @param fileList
     */
    uploadFileQueue (fileList) {
        // 当所有任务都执行完以后，将调用该函数
        uploadQueue.drain = function() {
            console.log('all tasks have been processed====================uploadQueue');
            if (true === clearAll.status) {
                sendWebContentsMessage(clearAll.event, true);
                clearAll.event = 'UPLOAD_CLEAR_ALL_CALL';
                clearAll.status = false;
            }
        }

        fileList.forEach((item) => {
            if (false === item.isComplete && false === item.paused) {
                console.log('进入文件上传队列===================', item.name);

                uploadQueue.push({name : item.name, run: function(cb){
                    //console.log(item.name + ' is running, waiting tasks:' + q.length());
                    //设置文件相关信息
                    item.status = 'underway';
                    item.isUnderway = true;
                    setFileAndUpload(item, cb);
                }}, function(data){
                    console.log(item.name + ' executed', data);
                });
            }
        });
    }

    /**
     * 文件上传 暂停
     * 
     * @param FileId
     */
    uploadPause (FileId) {
        if (FileId) {
            uploadPause.FileId = FileId;
            uploadPause.status = true;
        }
    }

    /**
     * 文件上传 取消
     * 
     * @param FileId
     */
    uploadRemove (FileId) {
        if (FileId) {
            uploadRemove.FileId = FileId;
            uploadRemove.status = true;
        }
    }

    /**
     * 
     * 
     */
    uploadClearAll (data) {
        clearAll.event = data.event;
        clearAll.status = data.status;
        console.log('====================clearAll========================', clearAll);
    }
}

export default UploadService;