export const uploaderMixin = {
    inject: ['uploader']
}

export const completerMixin = {
    inject: ['completer']
}


export const supportMixin = {
    data () {
        return {
            support: true
        }
    },
    mounted () {
        //this.support = this.uploader.uploader.support
        this.support = true
    }
}

export const tableMixin = {
    data () {
        return {
            screenHeight: document.body.clientHeight, // 这里是给到了一个默认值 （这个很重要）
            tableHeight: null, // 表格高度 
        }
    },
    watch: {
        //监听屏幕高度改变表格高度
        screenHeight (val) {
            //初始化表格高度
            this.tableHeight = val - (this.$refs.header.offsetHeight + 150) + "px";
        }
    },
    mounted () {
        //监听屏幕高度
        this.support = true;
        window.onresize = () => {
            return (() => {
                window.screenHeight = document.body.clientHeight;
                this.screenHeight = window.screenHeight;
            })();
        };
    }
}
