
<style>
    .file-upload {
        float: left;
        width: 74px;
        height: 30px;
        position: relative;
        overflow: hidden;
        border-radius: 4px;
        font-size: 12px;
        text-align: center;
        line-height: 30px;
        border: 1px solid #dedede;
    }
    .file-upload-input {
        background-color: transparent;
        position: absolute;
        width: 999px;
        height: 999px;
        top: -10px;
        right: -10px;
        cursor: pointer;
    }
    .file-upload:hover {
        color: #fff;
        background-color: #3589ff;
        border-color: #3589ff;
    }
    .icon-self-upload {
        width: 0.6em;
        height: 0.6em;
        font-size: 2.5em;
        vertical-align: -0.16em;
        fill: currentColor;
        overflow: hidden;
    }
</style>

<template>
    <div class="file-upload">
        <div class="file-upload-text">
            <svg class="icon-self-upload" aria-hidden="true" >
                <use xlink:href="#icons-upload"></use>
            </svg>
            <span>上传</span>
        </div>
        <input @change="addFile" class="file-upload-input" type="file" multiple>
    </div>
</template>

<script>
    const COMPONENT_NAME = 'uploader-btn'
    export default {
        name: COMPONENT_NAME,
        mounted () {

        },
        methods: {
            addFile (e) {
                console.log('选择文件按钮组件-----------------------', e, e.target.files);
                let Files = [];
                Array.from(e.target.files).forEach((item, index) => {
                    let obj = {
                        name: item.name,
                        path: item.path,
                        size: item.size,
                        type: item.type,
                        extension: item.name.substring(item.name.lastIndexOf('.'))
                    }
                    Files.push(obj)
                })
                this.$emit('addFileBtn', Files);
            }
        }
    }
</script>

