<template>
  <div id="CountDown" >
      <i-Button  @click="run()" :disabled="disabled" :second="60" >{{ text }}</i-Button>
  </div>
</template>
<script type="text/javascript">

  let CountDown = {
    name : 'CountDown',
    template: '#CountDown',
    props: {
      second: {
        type: Number,
        'default': 60 
      },
      disabled: {
        type: Boolean,
        'default': false
      }
    },
    // 初始化时间
    data: function() {
      return {
        time: 0
      };
    },
    methods: {
      run: function() {
        console.log('run=========', this.second);
        this.time = this.second;
        this.timer();
      },
      timer: function() {
        console.log('timer=========', this.time);
        if (this.time > 0) {
          this.time--;
          setTimeout(this.timer, 1000);
        }
      }
    },
    computed: {
      text: function() {
        return this.time > 0 ? this.time + 's再获取' : '倒计时';
      }
    }
  }; 
  export default CountDown
</script>