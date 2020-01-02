
const app = new Vue({
  el:"#root",
  data() {
    return {
      pixelData:[],
      time:11111
    }
  },
  method() {

  },
  mounted() {
    var ws = new WebSocket("ws://localhost:9095")
    this.ws = ws
    ws.onmessage = function(obj) {//监听后端的消息事件
     console.log(obj,"后端数据")
     this.pixelData = JSON.stringify(obj.data.pixelData)
    

    }
  }
})