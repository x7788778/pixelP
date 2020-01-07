const http = require('http')
const fs = require('fs')
const path = require('path')
const ws = require('ws')
const express = require('express')
const Jimp = require('jimp')

const port = 9095
const app = express()
const server = http.createServer(app)
const wss =  new ws.Server({server})

let height = 256
let width = 256
main()
async function main() {
  let img
  try {
    img = await Jimp.read(path.join(__dirname, './static/pixel.png'))
  } catch(e) {
    img = new Jimp(256, 256, 0xffffffff)
  }
  
  wss.on('connection', (ws, req) => {
    img.getBuffer(Jimp.MIME_JPEG,(err,buf) => {
      if(err){
        console.log('get buffer error', err)
      } else {
        ws.send(buf)
      }
    })//拿到png图片的编码
    wss.clients.forEach(ws => {
      ws.send(JSON.stringify({
        type:'onlineCount',
        count:wss.clients.size,
      }))
    })
    ws.on('close', () => {
      wss.clients.forEach(ws => {
        ws.send(JSON.stringify({
          type:'onlineCount',
          count:wss.clients.size,
        }))
      })
    })
    var lastDraw = 0
    ws.on('message', msg => {
      var now = Date.now()
      msg = JSON.parse(msg)
      lastDraw = now
      if (msg.type === "drawDot") {
        if(now - lastDraw < 1000 
          && msg.x > width 
            && msg.y > height) {
              return
            }
        var hexColor = Jimp.cssColorToHex(msg.color)
        
        img.setPixelColor(hexColor,msg.x,msg.y)
        wss.clients.forEach( client => {
          client.send(JSON.stringify({
            type:"updateDot",
            x:msg.x,
            y:msg.y,
            color:msg.color
          }))
        })
        img.write(path.join(__dirname,'./static/pixel.png'),(()=>{
          console.log(`data saved `)
        }))
      }
    })
  })
  app.use(express.static(path.join(__dirname, './static')))
  server.listen(port, () => {
    console.log(`app is listening on ${port} port`)
  })

}