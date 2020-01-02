const http = require('http')
const fs = require('fs')
const path = require('path')
const ws = require('ws')
const express = require('express')


const port = 9095
const app = express()
const server = http.createServer(app)
const wss =  new ws.Server({server})

let pixelData
let height = 30
let width = 30
try {
  pixelData = require('./static/pixel.json')
} catch(e) {
  pixelData = new Array(height).fill(1).map(it => {
    return new Array(width).fill('white')
  })
}


wss.on('connection', (ws, req) => {
  ws.send(JSON.stringify({
    type: "init",
    pixelData: pixelData,
  }))
  
  var lastDraw = 0
  ws.on('message', msg => {
    var now = Date.now()
    msg = JSON.parse(msg)
    console.log(msg,'msgggg')
    lastDraw = now
    if (msg.type === "drawDot") {
      if(now - lastDraw < 1000 
          && msg.x > width 
          && msg.y > height) {
        return
      }
      
      pixelData[msg.y][msg.x] = msg.color

      fs.writeFile(path.join(__dirname,'./static/pixel.json'), JSON.stringify(pixelData),(err)=>{
        console.log(`data saved at (${msg.x},${msg.y}) is changed for ${msg.color}`)
      })
      
      wss.clients.forEach( client => {
        client.send(JSON.stringify({
          type:"updateDot",
          x:msg.x,
          y:msg.y,
          color:msg.color
        }))
      })

      
    }
  })
})

app.use(express.static(path.join(__dirname, './static')))

server.listen(port, () => {
  console.log(`app is listening on ${port} port`)
})