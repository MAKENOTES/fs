<template>
  <uploader :options="options" class="uploader-fragmentFile">
    <uploader-unsupport></uploader-unsupport>
    <uploader-drop>
      <p>拖拽区域</p>
      <uploader-btn>选择文件</uploader-btn>
<!--       <uploader-btn :attrs="attrs">select images</uploader-btn>
      <uploader-btn :directory="true">select folder</uploader-btn> -->
    </uploader-drop>
    <uploader-list></uploader-list>
  </uploader>
</template>

<script>
  export default {
    data () {
      return {
        options: {
          // 可通过 https://github.com/simple-uploader/Uploader/tree/develop/samples/Node.js 示例启动服务
          target: apis.getUrl('test'),
          headers: {'Authorization': fns.token('jwt'), 'VueAuthorization': fns.token('vue_jwt')},
          query: {'cm_bucket_id': 47, 'cm_folder_pid': 0, 'type': 'SourceFile'},
          singleFile: false,
          testChunks: false,
          withCredentials: true,
          chunkSize: 9*1024*1024,
          forceChunkSize: true,
          simultaneousUploads: 1 //同时上传的数(块数)
        },
        attrs: {
          //accept: 'image/*'
        }
      }
    },
    methods: {
    	uploadObject(){

    	}
    }
  }
</script>

<style>
  .uploader-fragmentFile {
    width: 880px;
    padding: 15px;
    margin: 40px auto 0;
    font-size: 12px;
    box-shadow: 0 0 10px rgba(0, 0, 0, .4);
  }
  .uploader-fragmentFile .uploader-btn {
    margin-right: 4px;
  }
  .uploader-fragmentFile .uploader-list {
    max-height: 440px;
    overflow: auto;
    overflow-x: hidden;
    overflow-y: auto;
  }
</style>