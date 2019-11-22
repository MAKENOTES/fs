<template>
<!--     <div id="transmit" class="transmit">
        <CountDown :second="80"></CountDown>
    </div>
 -->
 <div><input type="text" v-model="num" ><span @click="run_task()">{{num}}测试</span></div>
 
</template>
<script type="text/javascript">
    import CountDown from '../components/CountDown';
    const sleep = async time => new Promise(r => setTimeout(r, time))

    let transmit = {
        name:'transmit',
        components: {
            CountDown
        },
        data() {
            return{
                disabled: false,
                worker: null,
                num:1,
            }
        },
        created() {
            this.worker = this.$worker.create([
                {
                    message: 'pull-data',
                    func(data) {
                        data.forEach(function(ele, index){
                            data[index] = ele + 3
                            console.log('pull-data---ele=======', ele)
                        })
                        console.log('单独的线程中，无法调用当前页面的变量this.num', this.num);
                        // for (var i = 0; i < 19999; i++) {
                        //   this.num = i
                        //   console.log('xxxxxxxxxxxxxx=======', i)
                        // }
                        
                        // let i = 0;
                        // while (i < 10) {
                        //     console.log('sleep===========:', 'aaa'+i)
                        //     await sleep(1000)
                        //     i++
                        // } 
                        return data
                    },
                },
                {
                    message: 'run-task',
                    func(id) {
                        console.log('run-task---id=======', id)
                    },
                }
            ])
        },
        mounted() {
            // let data = [1, 3, 5, 7, 9, 11]
            // this.worker.postMessage('pull-data', [data])
            // .then(res => console.log('then==========', res))
        },
        methods:{
            run_task:function(){
                let data = [1, 3, 5, 7, 9, 11]
                this.worker.postMessage('pull-data', [data])
                .then(res => this.num = res[0])
            }
        },
        destroyed() {
            console.log('destroyed============', this.worker);
            this.worker = null
        },
    };
    export default transmit
</script>