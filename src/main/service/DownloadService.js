import path from 'path';
const fs = require('fs');
const async = require("async");
const request = require('request');
const process = require('process');

const selfLib = require('../util/selfLib.js');

const crypto = require('crypto');

process.on('warning', (e) => {
    console.log('process---------------------', e);
})

let mainWindow = null;

let downloadPause = {
    fileId: '',
    status: false
}
let downloadRemove = {
    fileId: '',
    status: false
}
let downloadRetry = {
    fileId: '',
    status: false
}
let clearAll = {
    event: 'DOWNLOAD_CLEAR_ALL_CALL',
    status: false
};

//定义一个下载任务， 设worker数量为2
var downloadQueue = async.queue(function(task, callback){
    task.run(callback);
}, 2);

/**
 * 将数据从主电子处理程序发送到呈现程序。
 * 只有在首先实例化窗口时才有效
 * 
 * @param thread
 * @param data
 * 
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

// const sleepPromise = function(interval) {
//     return new Promise(resolve => {
//         setTimeout(resolve, interval);
//     })
// };
/**
 * 获取指定响应流并写入指定文件指定位置
 * 
 * @param file
 * @param indexFile
 * @param indexParts
 * 
 */
const downloadParts = (file, indexFile, indexParts) => new Promise((resolve, reject) => {

    if (false === file.isUnderway) {
        return reject('isUnderway-------------------downloadParts---------------------------false' + file.name);
    }

    let startTime = 0;
    let endTime = 0;
    let receivedBytes = 0;
    let parts = file.Urls[indexFile].Parts[indexParts];
    //console.log('parts.startData--------------------------------parts.receivedBytes', parts.startData, parts.receivedBytes);
    //续传主进程与渲染进程下载进度同步
    // if (parts.receivedBytes != 0) {
    //     //接收的字节 不需要加1  比如0---9   10个字节  parts.receivedBytes = 5  表示字节个数（0,1,2,3,4）  起始位5刚好
    //     parts.startData = parts.startData + parts.receivedBytes;
    //     file.Urls[indexFile].Parts[indexParts].startData = parts.startData;
    // }
    //console.log('parts.startData-----------------------parts.receivedBytes', parts.startData, parts.receivedBytes);
    //url处理
    file.Urls.forEach((item) => {
        if (path.join(parts.downloads, `\\${item.path}`) == path.join(parts.downloadPath)) {
            parts.url = item.url;
        }
    })

    if (!fs.existsSync(parts.downloads))
    fs.mkdirSync(parts.downloads);

    if (!fs.existsSync(parts.downloadPath))
    fs.writeFileSync(parts.downloadPath, '');

    let params = {           
        "method": 'GET',           
        "url": parts.url,
        "forever": true,
        "timeout": 40000,
        "headers": {
            "Range": 'bytes=' + parts.startData + '-' + parts.endData,
            //"Connection": "keep-alive"
        }
    };
    let reqParts = request(params);
    reqParts.on('error', (e) => {
        console.log("请求遇到问题----------------------:", e.message, parts.chunkNumCurrent, file.Urls[indexFile].Parts[indexParts].receivedBytes);
        outParts.end();

        downloadRetry.fileId = file.FileId;
        downloadRetry.status = true;
        file.error           = true;
        file.isUnderway      = false;

        sendWebContentsMessage('DOWNLOAD_ERROR_NET', file);
        return reject('网络出现问题---文件块序号' + parts.chunkNumCurrent);
    });
//console.log('请求头参数--------------------------------', params);
    let options = {
        "start": parts.startData,
        "flags": 'r+'
    };
    let outParts = fs.createWriteStream(parts.downloadPath, options);//返回可写流
    outParts.on('error', (e) => { 
        console.log('可写流遇到问题----------------------', e, parts.name, parts.chunkNumCurrent, file.Urls[indexFile].Parts[indexParts].receivedBytes);
        outParts.end();

        downloadRetry.fileId = file.FileId;
        downloadRetry.status = true;
        file.error           = true;
        file.isUnderway      = false;

        sendWebContentsMessage('DOWNLOAD_ERROR_NET', file);
        return reject('文件块序号--------' + parts.chunkNumCurrent);
    });


    // reqParts.on("socket", function (socket) {
    //     //console.log('socket============================', socket);
    //     socket.on("close", function() {
    //         console.log("socket has been closed");
    //     });
    // });

    outParts.on('finish', () => {
        //console.error('写入已完成', parts.name, parts.chunkNumCurrent, file.Urls[indexFile].Parts[indexParts].receivedBytes);
    });

    reqParts.pipe(outParts);

    //流字节大小
    reqParts.on('response', (res) => { 
        //console.log(`响应头=========================: ${JSON.stringify(res.headers)}`);
        if (206 === res.statusCode) {
            //parts.totalBytes = parseInt(res.headers['content-length'], 10);
            startTime = new Date().getTime();
        } else {
            console.log('响应遇到问题----------------------', res.statusCode);
            downloadRetry.fileId = file.FileId;
            downloadRetry.status = true;
            file.error           = true;
            file.isUnderway      = false;

            sendWebContentsMessage('DOWNLOAD_ERROR_NET', file);
            return reject('文件不存在--------文件块序号' + parts.chunkNumCurrent);
        }
    });

    //接收到文件流事件   file.receivedBytes
    reqParts.on('data', (chunk) => {

        //主动断开连接  清空下载列表
        if (true === clearAll.status) {
            file.isUnderway = false;
            reqParts.abort();
            return resolve(parts.chunkNumCurrent);
        }

        //主动断开连接  暂停下载
        if (true ===  downloadPause.status && downloadPause.fileId == file.FileId) {
            file.paused = true;
            file.status = 'paused';
            file.isUnderway = false;
            reqParts.abort();
            return resolve(parts.chunkNumCurrent);
        }

        //主动断开连接  取消下载
        if (true ===  downloadRemove.status && downloadRemove.fileId == file.FileId) {
            file.isRemove = true;
            file.isUnderway = false;
            reqParts.abort();
            return resolve(parts.chunkNumCurrent);
        }

        //主动断开处理
        if (false === file.isUnderway) {
            reqParts.abort();
        }

        //向 render 进程通信
        if (true === file.isUnderway) {
            endTime = new Date().getTime();
            receivedBytes += chunk.length;
            file.Urls[indexFile].Parts[indexParts].receivedBytes += chunk.length;
            file.Urls[indexFile].Parts[indexParts].startData     += chunk.length;

            //接收时间超过1秒或接收完毕  向render进程发送事件
            if (file.Urls[indexFile].Parts[indexParts].receivedBytes == parts.totalBytes || (endTime - startTime) > 1000) {

                file.Urls[indexFile].Parts[indexParts].averageSpeed = receivedBytes;
                file.milliTime = endTime - startTime;
                if (file.Urls[indexFile].Parts[indexParts].receivedBytes == parts.totalBytes) {
                    file.Urls[indexFile].Parts[indexParts].isComplete = true;
                    //小于1M 的 文件块
                    if(parts.totalBytes < 1048576) {
                        file.milliTime = file.milliTime + 500;
                    }
                }
                //存在通信队列 不能立即中断
                try {
                    let sendData = {
                        task: {
                            FileId:         file.FileId,
                            Parts:          file.Urls[indexFile].Parts[indexParts],
                            fileSize:       file.Urls[indexFile].size,
                            error:	        file.error,
                            paused:	        file.paused,
                            status:	  	    file.status,
                            isUnderway:	    file.isUnderway,
                            isRemove:	    file.isRemove,
                            size:		    file.size,
                            milliTime:      file.milliTime,
                            receivedBytes:  receivedBytes
                        },
                        indexFile: indexFile,
                        indexParts: indexParts,
                    };
                    sendWebContentsMessage('DOWNLOAD_PROGRESS', sendData);
                } catch (e) {
                    console.log('异常---------------DOWNLOAD_PROGRESS', e);
                }
                startTime = endTime;
                receivedBytes = 0;
            }
        }
    })
   
    //文件接收结束
    reqParts.on('end', () => {
        reqParts.abort();
        //console.log('文件块接收结束=======================reqParts==end',parts.downloadPath, file.Urls[indexFile].Parts[indexParts].receivedBytes, file.isUnderway);
        if (true === file.isUnderway) {
            if (file.Urls[indexFile].Parts[indexParts].totalBytes === file.Urls[indexFile].Parts[indexParts].receivedBytes) {
                //小于1M 的 文件块
                if (file.Urls[indexFile].Parts[indexParts].totalBytes < 1048576) {
                    setTimeout(() => {
                        return resolve(parts.chunkNumCurrent);
                    }, 500);
                } else {
                    return resolve(parts.chunkNumCurrent);
                }

            }
        }
    });

});


/**
 * 创建文件块数据
 * 
 * @param file
 * @param cutFile
 * 
 */
const createFileParts = (file, cutFile) => {

    const chunkSize = 1024 * 1024 * 100;
    let chunkNumCurrent = 1;

    let pieces = Math.ceil(cutFile.size / chunkSize);//总共的分片数 
    for (let i = 0; i < pieces ; i++) {
        let obj = {
            name: cutFile.name,
            url: '',
            downloadPath: path.join(file.downloads, `\\${cutFile.path.replace(/\:|\*|\?/g,"")}`),
            downloads: file.downloads,
            averageSpeed: 0,
            receivedBytes: 0,
            totalBytes: 0,
            chunkNumCurrent: chunkNumCurrent,
            startData: i * chunkSize,
            endData: Math.min(cutFile.size, (i+1) * chunkSize - 1),
            isComplete: false
        }
        obj.totalBytes = obj.endData - obj.startData + 1;
        if ((i + 1) == pieces) {
            obj.totalBytes = obj.endData - obj.startData
        }
        //判断块之前切过
        if (!cutFile.Parts.hasOwnProperty(i)) {
            cutFile.Parts.splice(i, 1, obj);
        }
        chunkNumCurrent ++;
    }

    return cutFile;
}


/**
 * 校验文件信息
 * 
 * @param file
 * @param indexFile
 * 
 */
const checkFileMessage = (file, indexFile) => new Promise((resolve, reject) => {
    let fileMessage = file.Urls[indexFile];
    let params ={           
        "method": 'get',
        "url": fileMessage.url,
        // "forever": true,
        // "timeout": 15000,
    }

    try {
        let reqCheck = request(params);
        reqCheck.on('error', (e) => {
            let sendData = {
                FileId: file.FileId,
                indexFile: indexFile,
                tip: e.message,
            };
            console.log('请求遇到问题========================error', e.message);
            sendWebContentsMessage('DOWNLOAD_ERROR_SIGN', sendData);
            reqCheck.abort();
            return reject();
        });
        reqCheck.on('response', (res) => { 
            let totalBytes = parseInt(res.headers['content-length'], 10)
            if (200 === res.statusCode && !isNaN(totalBytes)) {
                if (fileMessage.size != totalBytes) {
                    console.log('接口文件大小========================================实际文件大小', fileMessage.size, totalBytes);
                }
                reqCheck.abort();
                return resolve(totalBytes);
            } else {
                console.log('请求遇到问题========================资源不存在');
                let sendData = {
                    FileId: file.FileId,
                    indexFile: indexFile,
                    tip: '资源不存在',
                };
                sendWebContentsMessage('DOWNLOAD_ERROR_SIGN', sendData);
                reqCheck.abort();
                return reject();
            }
        });
    } catch (e) {
        let sendData = {
            FileId: file.FileId,
            indexFile: indexFile,
            tip: e.message,
        };
        console.log('请求遇到问题========================trycache', e.message);
        sendWebContentsMessage('DOWNLOAD_ERROR_SIGN', sendData);
        return reject();
    }

});

/**
 * 块队列
 * 
 * @param file
 * @param indexFile
 * @param cb
 * 
 */
const setPartsQueue= async (file, indexFile, cbFiles) => {
    //定义一个 块队列 
    let partsQueue = async.queue(function(task, callback){
        task.run(callback);
    }, 3);

    //块队列执行完成时 触发
    partsQueue.drain = function() {
        //console.log('partsQueue------------------------------------------------------------------completed');
        cbFiles(file.downloadPath);
    }

    try {
        if (false == file.Urls[indexFile].isComplete) {
            //文件信息校验
            let checkSize = await checkFileMessage(file, indexFile);

            //大小校验处理
            if (Number(checkSize) != Number(file.Urls[indexFile].size)) {
                file.size = file.size + (checkSize - file.Urls[indexFile].size);
                file.Urls[indexFile].size = checkSize;
            }
        }

        //创建文件块 切块函数会续切块，不用判断是否切块
        file.Urls[indexFile] = createFileParts(file, file.Urls[indexFile]);

        //设置块队列
        file.Urls[indexFile].Parts.forEach((itemParts, indexParts) => {
            if (false === itemParts.isComplete) {
                partsQueue.push({name : itemParts.name, run: function(cbParts){
                    //await sleepPromise(300);
                    /**********************块下载回调处理**********************/
                    downloadParts(file, indexFile, indexParts)
                    .then(function (vDown) {
                        cbParts(vDown);
                    })
                    .catch(function (eDown) {
                        console.log('catch块下载功能--------------------------------reject', eDown, file.isUnderway);
                        if (false === file.isUnderway) {
                            partsQueue.kill();
                            cbFiles('filesQueue-kill');
                        }
                    })
                }}, function(errPQueue){
                });
            }
        });

    } catch(e) {

        //处理校验失败的文件
        cbFiles();
    }

}

/**
 * 文件队列
 * 
 * @param file
 * @param cb
 * 
 */
const setFilesQueue= async (file, cb) => {
    //定义一个文件队列
    let filesQueue = async.queue(function(task, callback){
        task.run(callback);
    }, 1);

    // 当所有任务都执行完以后，将调用该函数
    filesQueue.drain = function() {
        console.log('filesQueue------------------------------------------------------------------completed');
        sendWebContentsMessage('DOWNLOAD_FILE_CHECK', file.FileId);
        cb(file.downloadPath);
    }

    file.Urls.forEach((itemFile, indexFile) => {
        //已标记完成的文件 不进入文件队列
        if (false === itemFile.isComplete) {
            //console.log('正在进入文件队列FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF', file.isUnderway);
            filesQueue.push({name : itemFile.name, run: function(cbFiles){
                //设置块队列
                setPartsQueue(file, indexFile, cbFiles);

            }}, function(errFQueue){
                //处理块队列异常
                if ('filesQueue-kill' == errFQueue) {
                    console.log('filesQueue----------------------------------------------err'+errFQueue);
                    filesQueue.kill();
                    
                    if (downloadPause.fileId == file.FileId) {
                        downloadPause.fileId = '';
                        downloadPause.status = false;
                    }
                    if (downloadRemove.fileId == file.FileId) {
                        downloadRemove.fileId = '';
                        downloadRemove.status = false;
                    }
                    if (downloadRetry.fileId == file.FileId) {
                        downloadRetry.fileId = '';
                        downloadRetry.status = false;
                    }
                    cb();
                }

            });
        }
    });

}

/**
 * 管理文件上传
 * 
 * @param Window
 * 
 */
class DownloadService {

    constructor (Window) {
        mainWindow = Window;
    }

    /**
     * 文件下载 队列管理
     * 
     * @param fileList
     * 
     */
    downloadFileQueue (fileList) {

        downloadQueue.drain = function() {
            console.log('downloadQueue------------------------------------------------------------------completed');

            if (true === clearAll.status) {
                sendWebContentsMessage(clearAll.event, true);
                clearAll.event = 'DOWNLOAD_CLEAR_ALL_CALL';
                clearAll.status = false;
            }
        }

        fileList.forEach((item) => {
            //提前创建好文件夹
            item.folder_path.forEach((folderPath) => {
                if (!fs.existsSync(path.join(item.downloads, `\\${folderPath}`)))
                fs.mkdirSync(path.join(item.downloads, `\\${folderPath}`));
            });
            if (item.downloadPath == '') {
                item.downloadPath = path.join(item.downloads, `\\${item.name}`);
            }

            //暂停的文件不进入文件下载队列， 处理应用重启时的问题
            if(false === item.paused){
                
                console.log('下载任务大小===================================', item.size, item.isUnderway);
                if (0 === item.Urls[0].Parts.length) {
                    item.status = 'underway';
                    item.isUnderway = true;
                    sendWebContentsMessage('DOWNLOAD_START', item);
                }

                //清空文件传输限制(初始化各种文件传输开关)
                downloadPause.fileId = '';
                downloadPause.status = false;
                downloadRemove.fileId = '';
                downloadRemove.status = false;
                downloadRetry.fileId = '';
                downloadRetry.status = false;
                clearAll.event = 'DOWNLOAD_CLEAR_ALL_CALL';
                clearAll.status = false;

                downloadQueue.push({name : item.name, run: function(cb){
                    item.status = 'underway';
                    item.isUnderway = true;

                    //设置文件队列
                    setFilesQueue(item, cb)

                }}, function(data){
                    console.log('==========================下载队列 executed==========================', data);
                });
            }
        });

    }

    /**
     * 文件下载 暂停
     * 
     * @param FileId
     * 
     */
    downloadPause (FileId) {
        if (FileId) {
            downloadPause.fileId = FileId;
            downloadPause.status = true;
        }
    }

    /**
     * 文件下载 取消
     * 
     * @param FileId
     * 
     */
    downloadRemove (FileId) {
        if (FileId) {
            downloadRemove.fileId = FileId;
            downloadRemove.status = true;
        }
    }

    /**
     * 文件下载 重试
     * 
     * @param FileId
     * 
     */
    downloadRetry (FileId) {
        if (FileId) {
            downloadRetry.fileId = '';
            downloadRetry.status = false;
        }
    }

    /**
     * 清空下载队列
     * 
     */
    downloadClearAll (data) {
        clearAll.event = data.event;
        clearAll.status = data.status;
    }

}

export default DownloadService;