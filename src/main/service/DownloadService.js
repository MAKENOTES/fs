import path from 'path';
const fs = require('fs');
const notifier = require('node-notifier');
const async = require("async");
const request = require('request');
const process = require('process');

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
//定义一个queue， 设worker数量为2
let downloadQueue = async.queue(function(task, callback){
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

/**
 * 发送操作系统级别的通知
 * 
 * @param title
 * @param message
 * 
 */
const sendNotification = (title, message) => {
    notifier.notify({
        title,
        message,
    });
};



/**
 * 获取指定响应流并写入指定文件指定位置
 * 
 * @param index
 * @param file
 * 
 */
const downloadParts = (index, file) => new Promise((resolve, reject) => {
    let startTime = 0;
    let endTime = 0;
    let receivedBytes = 0;
    let parts = file.Parts[index];

    //续传主进程与渲染进程下载进度同步
    if (parts.receivedBytes != 0) {
        //接收的字节 不需要加1  比如0---9   10个字节  parts.receivedBytes = 5  表示字节个数（0,1,2,3,4）  起始位5刚好
        parts.startData = parts.startData + parts.receivedBytes;
        file.Parts[index].startData = parts.startData;
    }

    //url处理
    file.Urls.forEach((item) => {
        if (path.join(parts.downloads, `\\${item.path}`) == path.join(parts.downloadPath)) {
            parts.url = item.url;
        }
    })

    console.log('parts.chunkNumCurrent------------------------parts.startData-----------------------parts.receivedBytes', parts.chunkNumCurrent, parts.startData, parts.receivedBytes);

    if (!fs.existsSync(parts.downloads))
    fs.mkdirSync(parts.downloads);

    if (!fs.existsSync(parts.downloadPath))
    fs.writeFileSync(parts.downloadPath, '');

    let params = {           
        "method": 'GET',           
        "url": parts.url,
        "forever": true,
        "headers": {
            "Range": 'bytes=' + parts.startData + '-' + parts.endData,
            //"Connection": "keep-alive"
        }
    };
    let options = {
        "start": parts.startData,
        "flags": 'r+'
    };

    let req = request(params);
    let out = fs.createWriteStream(parts.downloadPath, options);//返回可写流

    req.on('error', (e) => {
        console.log("请求遇到问题----------------------:", e.message, parts.chunkNumCurrent, file.Parts[index].receivedBytes);
        out.end();

        downloadRetry.fileId = file.FileId;
        downloadRetry.status = true;
        file.error           = true;
        file.isUnderway      = false;

        sendWebContentsMessage('DOWNLOAD_ERROR_NET', file);
        return reject('网络出现问题---文件块序号' + parts.chunkNumCurrent);
    });

    // req.on("socket", function (socket) {
    //     //console.log('socket============================', socket);
    //     socket.on("close", function() {
    //         console.log("socket has been closed");
    //     });
    // });

    
    out.on('error', (e) => { 
        console.log('可写流遇到问题----------------------', e, parts.name, parts.chunkNumCurrent, file.Parts[index].receivedBytes);
        out.end();

        downloadRetry.fileId = file.FileId;
        downloadRetry.status = true;
        file.error           = true;
        file.isUnderway      = false;

        sendWebContentsMessage('DOWNLOAD_ERROR_NET', file);
        return reject('文件块序号--------' + parts.chunkNumCurrent);
    });

    out.on('finish', () => {
        console.error('写入已完成', parts.name, parts.chunkNumCurrent, file.Parts[index].receivedBytes);
    });

    req.pipe(out);

    //流字节大小
    req.on('response', (res) => { 
        console.log(`响应头=========================: ${JSON.stringify(res.headers)}`);
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
    req.on('data', (chunk) => {

        //主动断开连接  清空下载列表
        if (true === clearAll.status) {
            file.isUnderway = false;
            req.abort();
            return resolve(parts.chunkNumCurrent);
        }

        //主动断开连接  暂停下载
        if (true ===  downloadPause.status && downloadPause.fileId == file.FileId) {
            file.paused = true;
            file.status = 'paused';
            file.isUnderway = false;
            req.abort();
            return resolve(parts.chunkNumCurrent);
        }

        //主动断开连接  取消下载
        if (true ===  downloadRemove.status && downloadRemove.fileId == file.FileId) {
            file.isRemove = true;
            file.isUnderway = false;
            req.abort();
            return resolve(parts.chunkNumCurrent);
        }

        //向 render 进程通信
        if (true === file.isUnderway) {
            endTime = new Date().getTime();
            receivedBytes += chunk.length;
            file.Parts[index].receivedBytes += chunk.length;

            //接收时间超过1秒或接收完毕  向render进程发送事件
            if (file.Parts[index].receivedBytes == parts.totalBytes || (endTime - startTime) > 1000) {
                //console.log('file.Parts[index].receivedBytes-----parts.totalBytes-----parts.chunkNumCurrent', file.Parts[index].receivedBytes, parts.totalBytes, parts.chunkNumCurrent);
                file.averageSpeed = receivedBytes;
                file.chunkNumCurrent = parts.chunkNumCurrent;
                file.milliTime = endTime - startTime;
                //存在通信队列 不能立即中断
                try {
                    sendWebContentsMessage('DOWNLOAD_PROGRESS', file);
                } catch (e) {
                    console.log('异常---------------DOWNLOAD_PROGRESS', e);
                    sendWebContentsMessage('DOWNLOAD_ERROR', e);
                }
                startTime = endTime;
                receivedBytes = 0;
            }
        }
    })
   
    //文件接收结束
    req.on('end', () => {
        req.abort();
        console.log('文件块接收结束=======================req==end',parts.downloadPath, parts.chunkNumCurrent, file.Parts[index].receivedBytes);
        if (true === file.isUnderway) {
            //网络中途出问题是 会不等 ,而且程序有可能不会跑到者  所以不在此处 reject
            if (file.chunkSize === file.Parts[index].receivedBytes || file.pieces !==  parts.chunkNumCurrent) {
                parts.isComplete = true;
                return resolve(parts.chunkNumCurrent);
            }
            //最后一块基本不会等于
            if ((parts.endData - parts.startData) === file.Parts[index].receivedBytes || file.pieces ===  parts.chunkNumCurrent) {
                parts.isComplete = true;
                return resolve(parts.chunkNumCurrent);
            }
        }
    });

});

/**
 * 控制文件块下载
 * 
 * @param index
 * @param file
 * @param cbParts
 * 
 */
const downloadFile = (index, file, cbParts) => {

    //文件块队列回调
    if (false === file.isUnderway) {
        console.log('========================块块块块块块块块=========================', index);
        cbParts(index);
    }

    if (true === file.isUnderway) {
        downloadParts(index, file)
        .then(function (data) {
            console.log('回调11111111111111111-------then---------downloadParts', data);
            cbParts(data);
        })
        .catch(function (data) {
            console.log('回调22222222222222222--------catch--------downloadParts', data);
            cbParts(index);
        })
    }

}

/**
 * 创建文件块数据
 * 
 * @param file
 * 
 */
const createFileParts = (file) => {

    file.folder_path.forEach((item) => {
        if (!fs.existsSync(path.join(file.downloads, `\\${item}`)))
        fs.mkdirSync(path.join(file.downloads, `\\${item}`));
    });

    const chunkSize = 1024 * 1024 * 100;
    let piecesAll = 0;
    let chunkNumCurrent = 1;

    file.Urls.forEach((item) => {
        let pieces = Math.ceil(item.size / chunkSize);//总共的分片数 
        piecesAll += pieces;
        for (let i = 0; i < pieces ; i++) {
            let obj = {
                name: item.name,
                url: '',
                downloadPath: path.join(file.downloads, `\\${item.path.replace(/\:|\*|\?/g,"")}`),
                downloads: file.downloads,
                receivedBytes: 0,
                totalBytes: 0,
                chunkNumCurrent: chunkNumCurrent,
                startData: i * chunkSize,
                endData: Math.min(item.size, (i+1) * chunkSize - 1),
                isComplete: false
            }
            obj.totalBytes = obj.endData - obj.startData + 1;
            if ((i + 1) == pieces) {
                obj.totalBytes = obj.endData - obj.startData
            }
            file.Parts.push(obj);
            chunkNumCurrent ++;
        }
    });

    file.chunkSize = chunkSize;
    file.totalBytes = file.size;
    file.pieces = piecesAll;
    file.downloadPath = path.join(file.downloads, `\\${file.name}`);
    return file;
}


/**
 * 设置并下载文件
 * 
 * @param file
 * @param cbFile
 * 
 */
const setFileAndDownload= async (file, cbFile) => {

    //定义一个queue， 设worker数量为2
    var partsQueue = async.queue(function(task, callback){
        task.run(callback);
    }, 3);

    // 当所有任务都执行完以后，将调用该函数
    partsQueue.drain = function() {
        if (true ===  downloadPause.status && downloadPause.fileId == file.FileId) {
            downloadPause.fileId = '';
            downloadPause.status = false;
        }

        if (true ===  downloadRemove.status && downloadRemove.fileId == file.FileId) {
            downloadRemove.fileId = '';
            downloadRemove.status = false;
        }

        if (true ===  downloadRetry.status && downloadRetry.fileId == file.FileId) {
            downloadRetry.fileId = '';
            downloadRetry.status = false;
        }

        console.log('all tasks have been processed====================partsQueue', file.downloadPath);
        if (false === file.paused && false === file.isRemove && false === file.error && false == clearAll.status) {
            //计算文件 md5
            //let rs = fs.createReadStream(path.join(file.downloadPath));
            // let rs = fs.createReadStream('E:\\迅雷下载\\cn_windows_10_business_edition_version_1809_updated_sept_2018_x86_dvd_31238f21.iso');
            
            // let hash = crypto.createHash('md5');
            // rs.on('data', hash.update.bind(hash));
            // rs.on('end', function () {
            //   console.log('hash====================================', hash.digest('hex'));
            // });
        
            sendNotification(file.name+'文件下载完成!', 'Link has been copied to clipboard');
        }
        //文件队列回调  进行下个任务
        cbFile(file.downloadPath);
    }

    file.Parts.forEach((item, index) => {
        if (false === item.isComplete) {
            partsQueue.push({name : item.name, run: function(cbParts){
                downloadFile(index, file, cbParts);
            }}, function(data){
                //console.log(item.name + '文件块队列 executed=============', data);
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
            console.log('all tasks have been processed====================downloadQueue');
            if (true === clearAll.status) {
                sendWebContentsMessage(clearAll.event, true);
                clearAll.event = 'DOWNLOAD_CLEAR_ALL_CALL';
                clearAll.status = false;
            }
        }

        fileList.forEach((item) => {
            //暂停的文件不进入文件下载队列， 处理应用重启时的问题
            if(false === item.paused){
                if (0 === item.Parts.length) {
                    console.log('===========DOWNLOAD_START===============', item.name);
                    item = createFileParts(item);
                    sendWebContentsMessage('DOWNLOAD_START', item);
                }
                downloadQueue.push({name : item.name, run: function(cbFile){
                    item.status = 'underway';
                    item.isUnderway = true;
                    setFileAndDownload(item, cbFile);
                }}, function(data){
                    console.log(item.name + '文件队列 executed===========', data);
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
     * 文件下载 暂停
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