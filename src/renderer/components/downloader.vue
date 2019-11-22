<template>
    <div class="downloader">
        <ul>
            <li v-for="file in fileList" :key="file.id">
                <file-control
                    :file="file" 
                    :list="true"
                    @pause="pause"
                    @resume="resume"
                    @remove="remove"
                    @retry="retry"
                ></file-control>
            </li>
        </ul>
    </div>
</template>

<script>
    import FileControl from './common/file-control.vue'

    export default {
        name: 'downloader',
        props: {
            fileListData: {
                type: Array,
                default: []
            }
        },
        data () {
            return {
                fileList: this.fileListData
            }
        },
        methods: {
            pause (FileId) {
                this.$emit('pause', FileId);
            },
            resume (FileId) {
                this.$emit('resume', FileId);
            },
            remove (FileId) {
                this.$emit('remove', FileId);
            },
            retry (FileId) {
                this.$emit('retry', FileId);
            }
        },
        created () {
        },
        destroyed () {

        },
        components: {
            FileControl
        }
    }
</script>

<style>
    .downloader {
        position: relative;
    }
    .downloader > ul {
        list-style: none;
        margin: 0;
        padding: 0
    }
</style>
