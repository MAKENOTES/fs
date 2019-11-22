<template>
    <div class="file-control" :status="status">
        <div class="file-control-progress" :class="progressingClass" :style="progressStyle"></div>
        <div class="file-control-info">
            <div class="file-control-name">
                <!-- <i class="file-control-icon" :icon="fileCategory"></i> -->
                <svg v-if="false === this.file.isFolder" class="icon-self-file" aria-hidden="true" >
                    <use xlink:href="#icons-open-file-filled"></use>
                </svg>
                <svg v-if="true === this.file.isFolder" class="icon-self-folder" aria-hidden="true" >
                    <use xlink:href="#icons-folder"></use>
                </svg>
                {{file.name}}
            </div>
            <div class="file-control-size">{{formatedSize}}</div>
            <div class="file-control-status">
                <span v-show="status !== 'underway'">{{statusText}}</span>
                <span v-show="status === 'underway'">
                    <span>{{progressStyle.progress}}</span>
                    <em>{{formatedAverageSpeed}}</em>
                    <i>{{formatedTimeRemaining}}</i>
                </span>
            </div>
            
            <div v-show="true === isComplete && 'download' == this.file.operate" class="file-control-meta">
                <span  @click="openFile">
                    <svg class="icon-self-transmit" aria-hidden="true" >
                        <use xlink:href="#icons-file"></use>
                    </svg>
                </span>
                <span  @click="openFolder">
                    <svg class="icon-self-transmit" aria-hidden="true" >
                        <use xlink:href="#icons-open-folder"></use>
                    </svg>
                </span>

            </div>

            <div v-show="true === isComplete && 'upload' == this.file.operate" class="file-control-meta">
            </div>

            <div v-show="false === isComplete" class="file-control-meta">
            </div>

            <div class="file-control-actions">
                <span class="file-control-pause" @click="pause"></span>
                <span class="file-control-resume" @click="resume">️</span>
                <span class="file-control-retry" @click="retry"></span>
                <span class="file-control-remove" @click="remove"></span>
            </div>
        </div>
    </div>
</template>

<script>
    import { secondsToStr, formatedSize } from '../../common/utils'
    
    export default {
        name: 'file-control',
        props: {
            file: {
                type: Object,
                default () {
                    return {}
                }
            }
        },
        data () {
            return {
                response: null,
                paused: false,
                error: false,
                averageSpeed: 0,
                isComplete: false,
                isUnderway: false,
                isFolder: false,
                size: 0,
                formatedSize: '',
                uploadedSize: 0,
                progress: 0,
                timeRemaining: 0,
                extension: '',
                progressingClass: ''
            }
        },
        computed: {
            fileCategory () {
                const extension = this.extension
                const isFolder = this.file.isFolder
                let type = isFolder ? 'folder' : 'unknown'
                //const categoryMap = this.file.uploader.opts.categoryMap

                const categoryMap = '';
                const typeMap = categoryMap || {
                    image: ['gif', 'jpg', 'jpeg', 'png', 'bmp', 'webp'],
                    video: ['mp4', 'm3u8', 'rmvb', 'avi', 'swf', '3gp', 'mkv', 'flv'],
                    audio: ['mp3', 'wav', 'wma', 'ogg', 'aac', 'flac'],
                    document: ['doc', 'txt', 'docx', 'pages', 'epub', 'pdf', 'numbers', 'csv', 'xls', 'xlsx', 'keynote', 'ppt', 'pptx']
                }
                Object.keys(typeMap).forEach((_type) => {
                    const extensions = typeMap[_type]
                    if (extensions.indexOf(extension) > -1) {
                        type = _type
                    }
                })
                return type
            },
            progressStyle () {
                let progress = Math.floor(this.file.progress)
                if (this.file.progress == 100) {
                    progress = 0
                }
                const style = `translateX(${Math.floor(progress - 100)}%)`
                return {
                    progress: `${progress}%`,
                    webkitTransform: style,
                    mozTransform: style,
                    msTransform: style,
                    transform: style
                }
            },
            formatedAverageSpeed () {
                const averageSpeed = formatedSize(this.file.averageSpeed);
                return averageSpeed+` / s`
            },
            status () {
                const isUnderway = this.file.isUnderway
                const isComplete = this.file.isComplete
                const isError = this.file.error
                const paused = this.file.paused
                if (isComplete) {
                    return this.file.statusText
                } else if (isError) {
                   return 'error'
                } else if (isUnderway) {
                   return 'underway'
                } else if (paused) {
                   return 'paused'
                } else {
                   return 'waiting'
                }
            },
            statusText () {
                const status = this.status
                return status;
            },
            formatedTimeRemaining () {
                const times = ((1 - this.file.progress/100) * this.file.size) / this.file.averageSpeed;
                const timeRemaining = secondsToStr(Math.ceil(times))
                return timeRemaining
            }
        },
        watch: {
            status (newStatus, oldStatus) {
                if (oldStatus && newStatus === 'underway' && oldStatus !== 'underway') {
                    this.tid = setTimeout(() => {
                        this.progressingClass = 'file-control-progressing'
                    }, 200)
                } else {
                    clearTimeout(this.tid)
                    this.progressingClass = ''
                }
            }
        },
        methods: {
            // _actionCheck () {
            //     this.paused = this.file.paused
            //     this.error = this.file.error
            //     this.isUnderway = this.file.isUnderway()
            // },
            pause () {
                this.$emit('pause', this.file.FileId);
            },
            resume () {
                this.$emit('resume', this.file.FileId);
            },
            remove () {
                this.$emit('remove', this.file.FileId);
            },
            retry () {
                this.$emit('retry', this.file.FileId);
            },
            processResponse (message) {
                let res = message
                try {
                    res = JSON.parse(message)
                } catch (e) {}
                this.response = res
            },
            openFile () {
                //console.log('this.file', this.file.downloadPath);
                this.$emit('openFile', this.file.downloadPath);
            },
            openFolder () {
                this.$emit('openFolder', this.file.downloads);
            }
        },
        mounted () {
            console.log('文件组件----文件对象---------', this)

            const fileMessage = [
                'isComplete', 'isUnderway', 'isFolder', 'size', 'formatedSize', 'uploadedSize', 'progress', 'timeRemaining', 'extension',
                'paused', 'error', 'averageSpeed'
            ]
            //文件上传信息初始化
            fileMessage.forEach((key) => {
                this[key] = this.file[key];
            })
        },
        destroyed () {

        }
    }
</script>

<style>
    .file-control {
        position: relative;
        height: 49px;
        line-height: 49px;
        overflow: hidden;
        border-bottom: 1px solid #cdcdcd;
    }
    .file-control[status="waiting"] .file-control-pause,
    .file-control[status="underway"] .file-control-pause {
        display: block;
    }
    .file-control[status="paused"] .file-control-resume {
        display: block;
    }
    .file-control[status="error"] .file-control-retry {
        display: block;
    }
    .file-control[status="success"] .file-control-remove {
        display: none;
    }
    .file-control[status="error"] .file-control-progress {
        background: #ffe0e0;
    }
    .file-control-progress {
        position: absolute;
        width: 100%;
        height: 100%;
        background:#e5f0ff;
        /* background: linear-gradient(to left, 
             #85cbef 5%,
             #f0faff 10%,
             #85cbef 20%,
             #f0faff 30%,
             #85cbef 40%,
             #f0faff 50%,
             #85cbef 60%,
             #f0faff 70%,
             #85cbef 80%,
             #f0faff 90%,
             #85cbef 95%
        );   */
        transform: translateX(-100%);
    }
    .file-control-progressing {
        transition: all .4s linear;
    }
    .file-control-info {
        position: relative;
        z-index: 1;
        height: 100%;
        overflow: hidden;
    }
    .file-control-info:hover {
        background-color: rgba(240, 240, 240, 0.2);
    }
    .file-control-info i,
    .file-control-info em {
        font-style: normal;
    }
    .file-control-name,
    .file-control-size,
    .file-control-meta,
    .file-control-status,
    .file-control-actions {
        float: left;
        position: relative;
        height: 100%;
    }
    .file-control-name {
        width: 45%;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        text-indent: 14px;
    }
    .file-control-icon {
        width: 24px;
        height: 24px;
        display: inline-block;
        vertical-align: top;
        margin-top: 13px;
        margin-right: 8px;
    }
    .file-control-icon::before {
        content: "📃";
        display: block;
        height: 100%;
        font-size: 24px;
        line-height: 1;
        text-indent: 0;
    }
    .file-control-icon[icon="folder"]::before {
        content: "📂";
    }
    .file-control-icon[icon="image"]::before {
        content: "📊";
    }
    .file-control-icon[icon="video"]::before {
        content: "📹";
    }
    .file-control-icon[icon="audio"]::before {
        content: "🎵";
    }
    .file-control-icon[icon="document"]::before {
        content: "📋";
    }
    .file-control-icon[icon="unknown"]::before {
        content: "📃";
    }
    .file-control-size {
        width: 10%;
        text-indent: 10px;
    }
    .file-control-meta {
        cursor: pointer;
        width: 14%;
    }
    .file-control-status {
        width: 21%;
        text-indent: 20px;
    }
    .file-control-actions {
        width: 10%;
    }
    .file-control-actions > span {
        display: none;
        float: left;
        width: 16px;
        height: 16px;
        margin-top: 16px;
        margin-right: 10px;
        cursor: pointer;
        background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAABkCAYAAAD0ZHJ6AAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAAJcEhZcwAACxMAAAsTAQCanBgAAARkSURBVGje7ZnfS1NRHMAH4ptPkvQSuAdBkCxD8FUQJMEULUgzy1KyyPVQ4JMiiP4Bvg6EwUQQfMmwhwRDshwaKUjDVCgoSdDNHkzTJZ6+Z37Purve8+PeTb2TM/ggu+ew89l33x8H9BBCPG7GowXTJej3+wnDvEm0JuLC04+EYWftVAUv+fiCvDUdQR1BHUEdQR3BTIygvixoQS14XgTtthLVdpNWwXRLqvQ724LplFRtyrYF0yVpFLQrKRVMh6RZ0I6kkmCqklaCqpKZH0FX56Crq9jVfdDVk0RfFrSgFsxkQVmLcdKCVrKySCrryhPEyYShhzOcrFtG0EoilfHHk1CRU5rF6ZjNZhlVOW6RnMSVyyilKies4pO41diVy8wIujoHXV3FGdMHXTtJKLFYTLhZtq4vC1rwXApCZTIqgR6g1PBMCO9DL3bMMSqBHqDU8EyISDAHiGKvWwcCQG2KgjlAFCDAOhAAap0K5gKLphk8mqJgLrCIgoxRJ4J5wKpJ7gAoMkn5EBXBPGDVJHcAFJmkfIhQcAql1oBpTvTol9gG9pm4RHAKpdaAaU706JfYBvaZuJVgPQrt4sFlnOh5MC/p3lmJYD0K7eLBZZzoeTAv6d5ZnuAYHjpgEOnk5F0ufhG6v1ggOIaHDhhEOjl5l4tfhO4vthLcwAMrFNvLJO5vEwhu4IEViu1lEve3WQmyoihQFBzG/V0CQVYUBYqCw7i/SxTBcpsRbFeIYLnNCLZbCY5b5KAnxRwct8hBj9McZFVMW0ihRNBuFdMWUigRlFaxuQ9WWYjRMTiIe5z0wSoLMToGB3GPsA9aTZIJoB+nRgBnM1tzOkkmgH6cGgGczWzNpzqLx3n/aULJJgezeNw07oxQySbVywKjBOgFRnDs+VEsx8FlgVEC9AIjOPb8KJYjvSzoG7UW1IJaUAtqQS14toLNM5fN5APdwBJA8G83Pk/aK/rgzVvXzeQD3cASQPBvNz5P2ssTzAaGUIrHEO6zI5gNDKEUjyHcxxWkh4Ylcowwk1QQpIeGJXKMMJO0EgwqyjGCioJBJvDrxRMSuVOTJEXfbz1/bHwWtBL0yoQehK6RucgE+bGzanzulQh6E3IgQV+xpc8kcrfuSO7eTfJ3ZYmQw0Oy9azVKOk1C/bJ5D5F38YPeLfx0rjWJxHsS0SqsSYuxySjj5qO5Oj7xQWy2VBtFOwzCy6ryH3YfE3uh64Y1xckgstJPydEjkkeHv07Iy4Xaao15+KCWTBx6M/db+T9xivSErqaJDdzXI6yLRE8Vgg0coex/SPJvT0SbWu0KpZtbgSpCH3NRt7I5OxHkObc6heU+/M/J5vrpBFM5GBLqCQux14COXs5CNXK5OjPGm1tSMrJSOMNYQ4mVTGV/L6zTL7+DovkbFUxbSW0Wo05l8hJWsU+cRWfSh+Mt5Lb1ck/J1TvVsdDaR/MiEni+llsdZuZp62EViu+96bpNjNPWwmtVnzvFd5m9IVVC54x/wA7gNvqFG9vXQAAAABJRU5ErkJggg==") no-repeat 0 0;
    }
    .file-control-actions > span:hover {
        background-position-x: -21px;
    }
    .file-control-actions .file-control-pause {
        background-position-y: 0;
    }
    .file-control-actions .file-control-resume {
        background-position-y: -17px;
    }
    .file-control-actions .file-control-retry {
        background-position-y: -53px;
    }
    .file-control-actions .file-control-remove {
        display: block;
        background-position-y: -34px;
    }
    .file-control-meta  span {
        margin-left: 12px;
    }
</style>
