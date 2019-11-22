import { app, BrowserWindow, ipcMain, Menu, dialog, Tray } from 'electron';
import path from 'path';
import AwsS3Service from './service/AwsS3Service.js';
import UploadService from './service/UploadService.js';
import DownloadService from './service/DownloadService.js';
import db from '../datastore/db' // 取决于你的datastore.js的位置

let mainWindow
let closeMainwindow = false;

//托盘对象
let appTray = null;

//系统托盘右键菜单
let trayMenuTemplate = [
    {
        label: '退出',
        click: function () {
            //ipc.send('close-main-window');
            closeMainwindow = true;
            app.quit();
        }
    }
];

let configService = {
    accessKey: '',
    secretKey: ''
};
let s3 = null;
//let dbConfigService = db.read().get('configService').value();


/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
    global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

if (process.env.NODE_ENV === 'development') {
    global.__static = require('path').join(__dirname, '../../static').replace(/\\/g, '\\\\')
}

const winURL = process.env.NODE_ENV === 'development'
    ? `http://localhost:9080`
    : `file://${__dirname}/index.html`

function createWindow () {
    /**
     * Initial window options
    */
    let options = {
        height: 700,
        useContentSize: true,
        width: 1120,
        transparent: true,
        titleBarStyle: false,
        //vibrancy: 'ultra-dark', // 窗口模糊的样式
    }

    if (process.platform === 'win32') { // 如果平台是win32，也即windows
        options.show = true // 当window创建的时候打开
        options.frame = false // 创建一个frameless窗口，详情：https://electronjs.org/docs/api/frameless-window
        //options.backgroundColor = '#4f4f4f'
    }

    // if (dbConfigService) {
    //     configService.accessKey = dbConfigService.accessKey;
    //     configService.secretKey = dbConfigService.secretKey;
    //     AwsS3ServiceInit ();
    // }

    mainWindow = new BrowserWindow(options)

    //系统托盘图标目录
    appTray = new Tray(path.join(__static, 'app.png'));

    //图标的上下文菜单
    const contextMenu = Menu.buildFromTemplate(trayMenuTemplate);

    //设置此托盘图标的悬停提示内容
    appTray.setToolTip('美吉网盘');

    //设置此图标的上下文菜单
    appTray.setContextMenu(contextMenu);

    appTray.on('double-click', () => {
        mainWindow.show();
    })

    mainWindow.loadURL(winURL)

    mainWindow.webContents.on("did-frame-finish-load", () => {
        let updateLog = db.read().get('updateLog').value();
        if ('' != updateLog.content) {
            dialog.showMessageBox({
                type: 'info',
                title: '更新内容',
                message: updateLog.content,
            }, function (index) {
            }); 
            db.read().set('updateLog.content', '').write();
        }
        // mainWindow.webContents.once("devtools-opened", () => {
        //     mainWindow.focus();
        // });
        // mainWindow.webContents.openDevTools();
    });

    mainWindow.on('close', (event) => {
        console.log('close---------------------')
        if (false === closeMainwindow) {
            event.preventDefault();
            dialog.showMessageBox({
                type: 'info',
                title: '提示',
                message: '是否退出应用',
                buttons: ['确认', '取消', '最小化'],
                //icon: '',
                cancelId: 3,
            }, function (index) {
                console.log(index);
                if (0 === index) {
                    closeMainwindow = true;
                    app.quit()
                }
                if (1 === index) {
    
                }
                if (2=== index) {
                    mainWindow.hide();
                }
            });   
        }
    })

    mainWindow.on('closed', () => {
        mainWindow = null
    })

}

app.on('ready', createWindow)

app.on('before-quit', function (){
    console.log('before-quit------------------------')

});

app.on('window-all-closed', (event) => {
    console.log('window-all-closed--------------------')

    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow()
    }
})


//Electron单实例
const shouldQuit = app.makeSingleInstance((commandLine, workingDirectory) => {
	if (mainWindow) {
		if (mainWindow.isMinimized()){
			mainWindow.restore();
		};
		mainWindow.focus();
	};
});

if (shouldQuit) {
	app.quit();
}


/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
// mainWindow.webContents.send('UPDATER_DOWNLOADED', {'update-downloaded'})
    closeMainwindow = true;
    autoUpdater.quitAndInstall()
})

autoUpdater.on('error', function (error) {
    // mainWindow.webContents.send('UPDATER_ERROR', error)
    dialog.showMessageBox({
        type: 'info',
        title: '提示',
        message: '更新出错',
    }, function (index) {
    }); 
});

//当发现一个可用更新的时候触发，更新包下载会自动开始
autoUpdater.on('update-available', function (info) {
    // console.log('autoUpdater===========================update-available', info);
    mainWindow.hide();
    dialog.showMessageBox({
        type: 'info',
        title: '提示',
        message: '请稍后，正在下载更新中......',
    }, function (index) {
    }); 
});
//当没有可用更新的时候触发
autoUpdater.on('update-not-available', function (info) {
    // mainWindow.webContents.send('UPDATER_NOTAVAILABLE', info)
    dialog.showMessageBox({
        type: 'info',
        title: '提示',
        message: '当前版本为最新版本',
    }, function (index) {
    }); 
});
// ipcMain.on("CHECK_UPDATE",()=>{
//     //执行自动更新检查
//     autoUpdater.checkForUpdates();
// })

// app.on('ready', () => {
//   if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
// })
//当开始检查更新的时候触发
// autoUpdater.on('checking-for-update', function () {
//     mainWindow.webContents.send('UPDATER_CHECKING', {'checking-for-update'})
// });
// 更新下载进度事件
// autoUpdater.on('download-progress', function (progressObj) {
//     mainWindow.webContents.send('UPDATER_PROGRESS', progressObj)
// })


//render层用户登录 初始化s3配置
ipcMain.on('INIT_CONFIGSERVICE', async (evt, config) => {
    console.log('INIT_CONFIGSERVICE================================', config);
    // 设置
    db.read().set('configService', {
        accessKey: config.access_key,
        secretKey: config.secret_key
    }).write();

    configService.accessKey = config.access_key;
    configService.secretKey = config.secret_key;
    AwsS3ServiceInit ();
})

//main进程启动 初始化AwsS3Service服务
function AwsS3ServiceInit () {
    if (configService.accessKey !== null) {
        console.log('configService=======================', configService);
        s3 = new AwsS3Service(configService.accessKey, configService.secretKey, mainWindow);
    } else {
        throw new Error('未获取到用户配置信息');
    }
} 

//文件上传
const uploadFiles = async (webContents, fileList) => {
    let Upload = new UploadService(mainWindow, s3);
    Upload.uploadFileQueue(fileList);
}
//监听 文件上传 操作
ipcMain.on('UPLOAD_FILES', async (evt, files) => {
    return uploadFiles(evt.sender, files)
})
//监听 暂停上传 操作
ipcMain.on('UPLOAD_PAUSE', async (evt, FileId) => {
    let Upload = new UploadService(mainWindow, s3);
    Upload.uploadPause(FileId);
})
//监听 取消上传 操作
ipcMain.on('UPLOAD_REMOVE', async (evt, FileId) => {
    let Upload = new UploadService(mainWindow, s3);
    Upload.uploadRemove(FileId);
})

//监听 清空 文件上传队列
ipcMain.on('UPLOAD_CLEAR_ALL', async (evt, data) => {
    let Upload = new UploadService(mainWindow);
    Upload.uploadClearAll(data);
})

//文件下载
const downloadFiles = async (webContents, fileList) => {
    let Download = new DownloadService(mainWindow);
    Download.downloadFileQueue(fileList);
}
//监听 文件下载 操作
ipcMain.on('DOWNLOAD_FILES', async (evt, files) => {
    return downloadFiles(evt.sender, files)
})
//监听 暂停下载 操作
ipcMain.on('DOWNLOAD_PAUSE', async (evt, FileId) => {
    let Download = new DownloadService(mainWindow);
    Download.downloadPause(FileId);
})
//监听 取消下载 操作
ipcMain.on('DOWNLOAD_REMOVE', async (evt, FileId) => {
    let Download = new DownloadService(mainWindow);
    Download.downloadRemove(FileId);
})
//监听 重试下载 操作
ipcMain.on('DOWNLOAD_RETRY', async (evt, FileId) => {
    let Download = new DownloadService(mainWindow);
    Download.downloadRetry(FileId);
})
//监听 清空 文件和文件块下载队列
ipcMain.on('DOWNLOAD_CLEAR_ALL', async (evt, data) => {
    let Download = new DownloadService(mainWindow);
    Download.downloadClearAll(data);
})


//监听 设置文件下载路径 操作
ipcMain.on('DOWNLOAD_PATH', async (evt, data) => {
    let downpath = dialog.showOpenDialog({ properties: ['openDirectory'] });
    if (downpath) {
        let userPath = db.read().get('userData').find({ username: data.username }).value();
        if ('undefined' === typeof(userPath)) {
            db.read().get('userData').push({ username: data.username, path: downpath[0] }).write()
        } else {
            db.read().get('userData').find({ username: data.username }).assign({ path: downpath[0]}).write()
        }

        //仅仅设置下载路径
        if (false === data.status) {
            dialog.showMessageBox({
                type: 'info',
                title: '提示',
                message: '已成功设置下载路径',
            }, function (index) {
            }); 
        }
        //进入下载
        if (true === data.status) {
            mainWindow.webContents.send('DOWNLOAD_AUTO', true)
        }
    }
})

//监听 应用更新
ipcMain.on('DOWNLOAD_UPDATE', async (evt, path) => {
    autoUpdater.checkForUpdates();
})
