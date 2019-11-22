const AWS = require('aws-sdk');
const fs = require('fs');

let s3Obj = null;
let mainWindow = null;

/**
 * 启动文件分块上传  createMultipartUpload
 * @returns {Promise}
 */
const startUpload = (param) => new Promise((resolve, reject) => {
    let paramsCreate = { 
        Bucket: param.Bucket, 
        Key: param.Key,
        ACL: 'public-read' 
    };
    //直接进入下一个then,不经过sdk
    if (param.chunkNum != 1) {
        return resolve(param);
    }
    s3Obj.createMultipartUpload(paramsCreate, function (err,data) {
        if (err) {
            //错误处理
            mainWindow.webContents.send('UPLOAD_ERROR', { err });
            return reject(err);
        }
        //开启上传
        mainWindow.webContents.send('UPLOAD_START', { data });
        param.UploadId = data.UploadId;
        return resolve(param);
    });
});

/**
 * 文件块上传  uploadPart
 * @returns {Promise}
 */
const uploadStreamPart = (param) => new Promise((resolve, reject) => {
    //获取可读流对象
    let fileStream = fs.createReadStream(param.path, { start: (param.chunkNum-1) * param.chunkSize, end: param.endData-1 });
    fileStream.on('error', function(err) {
        console.log('File Error', err);
    });
    let chunkArr = [];
    let chunkLen = 0;
    //on data读取数据
    fileStream.on('data', (chunk)=>{
        chunkArr.push(chunk);
        chunkLen+=chunk.length;
    });

    //文件流获取完成
    fileStream.on('end', ()=>{
        let paramsPart = { 
            Body: Buffer.concat(chunkArr,chunkLen), 
            Bucket: param.Bucket, 
            Key: param.Key, 
            PartNumber: param.chunkNum, 
            UploadId: param.UploadId 
        };

        s3Obj.uploadPart(paramsPart, function (err,data) {
            console.log('s3文件块上传回调=================================', data);
            if (err) {
                //错误处理
                mainWindow.webContents.send('UPLOAD_ERROR', { err });
                return reject(err);
            }
            param.Parts.push({ETag: data.ETag, PartNumber: paramsPart.PartNumber});
            console.log('========================================文件块上传参数=================================', param);
            //当文件块是最后一块，继续走 下一个 then 否则 走catch
            if (param.chunkNum == param.pieces) {
                return resolve(param);
            } else {
                return reject(param);
            }
            
        }).on('httpUploadProgress',function(evt){
            console.log('每个块实时进度显示=========================', evt)
            param.progress = parseInt(((evt.loaded + (param.chunkNum-1) * param.chunkSize) * 100) / param.size);
            param.averageSpeed = evt.loaded;
            //实时进度
            mainWindow.webContents.send('UPLOAD_PROGRESS', { param });
        });
    })

});

/**
 * 完成文件上传  completeMultipartUpload
 * @returns {Promise}
 */
const uploadComplete = (param) => new Promise((resolve, reject) => {
    let paramsComplete = {
        Bucket: param.Bucket, 
        Key: param.Key, 
        MultipartUpload: {
            Parts: param.Parts
        }, 
        UploadId: param.UploadId
    };

    s3Obj.completeMultipartUpload(paramsComplete, function (err,data) {
        if (err) {
            //错误处理
            mainWindow.webContents.send('UPLOAD_ERROR', { err });
            return reject(err);
        }
        param.isComplete = true;
        return reject(param);
    });
});

/**
 * 包装aws-sdk   s3接口
 */
class AwsS3Service {
    /**
     * 构造函数
     * 
     * @param accessKey
     * @param secretKey
     */
    constructor (accessKey, secretKey, Window) {
        this.accessKey = accessKey;
        this.secretKey = secretKey;

        AWS.config.update({
            region: '',
            version: '2006-03-01',
            use_path_style_endpoint: true,
            endpoint: 'http://s3.i-sanger.com',
            credentials: {accessKeyId:accessKey, secretAccessKey:secretKey}
            //computeChecksums: true
        });

        this.s3 = new AWS.S3();

        // console.log('==================s3相关信息===========================', this.s3)
        // this.s3.listObjects({Bucket: "wodeshujucangku_1"}, function(err, data) {
        //     if (err) {
        //         console.log("Error", err);
        //     } else {
        //         console.log("Success", data);
        //     }
        // });

        s3Obj = this.s3;
        mainWindow = Window;
    }

    /**
     * 获取bucket 列表
     * @returns {Promise}
     */
    getBuckets() {
        return new Promise((resolve, reject) => {
            this.s3.listBuckets((err, data) => {
                if (err) {
                    return reject(err);
                }
                return resolve(data);
            });
        });
    }

    /**
     * 文件分块上传
     * @returns {Promise}
     */
    multipartUploadFile (param) {
        //const uploadEventEmitter = new EventEmitter();
        return new Promise((resolve, reject) => {
            startUpload(param)
                .then(function (data) {
                    return uploadStreamPart(data);
                })
                .then(function (data) {
                    return uploadComplete(data);
                })
                .catch(function (data) {
                    //完成上传
                    if (data.isComplete == true ) {
                        return reject(data);
                    }
                    //正在上传文件块
                    if (data.isComplete == false ) {
                        return resolve(data);
                    } else {
                        return reject(data);
                    }

                })
        });
    } 

}

export default AwsS3Service;