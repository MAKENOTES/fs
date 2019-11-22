<template>
    <div class="completer">
        <ul>
            <li v-for="file in fileList" :key="file.id">
                <file-control
                    :file="file" 
                    :list="true"
                    @remove="remove"
                    @openFile="openFile"
                    @openFolder="openFolder"
                ></file-control>
            </li>
        </ul>
    </div>
</template>

<script>
    import FileControl from './common/file-control.vue'

    export default {
        name: 'completer',
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
            remove (FileId) {
                this.$emit('remove', FileId);
            },
            openFile (downloadPath) {
                this.$emit('openFile', downloadPath);
            },
            openFolder (downloads) {
                this.$emit('openFolder', downloads);
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
    .completer {
        position: relative;
    }
    .completer > ul {
        list-style: none;
        margin: 0;
        padding: 0
    }
</style>
