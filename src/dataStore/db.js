import low from 'lowdb'
import FileSync from 'lowdb/adapters/FileSync'
import path from 'path'
import { app, remote } from 'electron'
import fs from 'fs-extra'

// const low = require('lowdb')
// const FileSync = require('lowdb/adapters/FileSync')


const APP = process.type === 'renderer' ? remote.app : app // 根据process.type来分辨在哪种模式使用哪种模块
const STORE_PATH = APP.getPath('userData') // 获取electron应用的用户目录

//生产模式下 APP.getPath('userData')  没有被创建  db.js就被加载 会报错
if (process.type !== 'renderer') {
    if (!fs.pathExistsSync(STORE_PATH)) {
        fs.mkdirpSync(STORE_PATH)
    }
}

//const adapter = new FileSync('db.json')
console.log('low-------------------', path.join(STORE_PATH, '/data.json'));
const adapter = new FileSync(path.join(STORE_PATH, '/data.json')) // 初始化lowdb读写的json文件名以及存储路径
const db = low(adapter)

// Set some defaults (required if your JSON file is empty)
if (!db.has('upload').value()) { // 先判断该值存不存在
    db.set('upload', []).write() // 不存在就创建
}

if (!db.has('download').value()) {
    db.set('download', []).write()
}

if (!db.has('completed').value()) {
    db.set('completed', []).write()
}

if (!db.has('userData').value()) {
    //db.set('userData', {}).write()
    db.set('userData', []).write()
}

if (!db.has('configService').value()) {
    db.set('configService', {
        accessKey: '', 
        secretKey: ''
    }).write()
}

if (!db.has('updateLog').value()) {
    db.set('updateLog', {
        version: '', 
        content: ''
    }).write()
}

// db.set('upload', []).write()
// db.set('download', []).write()
// db.set('completed', []).write()
// db.set('userData', {}).write()
// db.set('userData', []).write()
// db.defaults({ upload: [], download: [], complete: [] })
//   .write()

export default db // 暴露出去