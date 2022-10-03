import 'dotenv/config'
import express from 'express'
import nodeCleanup from 'node-cleanup'
import routes from './routes.js'
import { init, cleanup } from './whatsapp.js'
import cors from 'cors'
import { Server } from 'socket.io'
import fs from 'fs'
import https from 'https'
import http from 'http'
import bodyParser from 'body-parser'
import cron from 'node-cron'
// import * as queue from './controllers/chatController.js'
// import db from './models/index.js'
import dateFormat from 'dateformat'

// const Device = db.device
const app = express()
const host = process.env.HOST ?? '127.0.0.1'
const port = parseInt(process.env.PORT ?? 8000)
process.env.TZ = 'Asia/Jakarta'
var dateNow = dateFormat(new Date(), 'yyyymmddhhMMss')
var cronStorage = {}

var corsOptions = {
    origin: '*',
}

app.all('*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Credentials', true)
    res.header('Access-Control-Allow-Headers', 'X-Requested-With')
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS')
    res.header('Access-Control-Allow-Headers', 'Content-Type')
    next()
})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use('/', routes)

// var privateKey = fs.readFileSync('/etc/letsencrypt/live/eazynotif.id/privkey.pem', 'utf8')
// var certificate = fs.readFileSync('/etc/letsencrypt/live/eazynotif.id/cert.pem', 'utf8')
// var credentials = { key: privateKey, cert: certificate }
// var httpsServer = https.createServer(credentials, app)

var httpServer = http.createServer(app)
const io = new Server(httpServer, {
    cors: {
        origin: [process.env.ORIGIN, '*'],
        methods: ['GET', 'POST'],
        credentials: true,
    },
    allowEIO3: true,
})
global.io = io
io.on('connection', function (socket) {
    console.log('Made socket connection')
})

async function stopLastCron() {
    console.log('STOP CRON')
    // console.log(cronStorage);
    // cronStorage[dateNow].destroy();
    // console.log("END STOP CRON");
    // await createNewCron()
}

async function createNewCron() {
    var task = cron.schedule('*/30 * * * * *', () => {
        console.log('========RUNNING CRON============')
        var wait = getWaiting() * 1000
        console.log(wait)
        setTimeout(function () {
            // sendMessage()
        }, wait)
    })
    cronStorage[dateNow] = task
    console.log(cronStorage)
}

// async function sendMessage() {
//     var data = await Device.findAll({
//         where: { status: 'true' },
//     }).then(async (res) => {
//         for (let index = 0; index < res.length; index++) {
//             const element = res[index]
//             var sessionId = element.device_id
//             queue.sendMessageQueue(sessionId)
//         }
//     })
// }

function getWaiting() {
    return Math.floor(Math.random() * 5) + 1
}

httpServer.setTimeout(30000)
httpServer.listen(port, () => {
    console.log(`Server is running on `)
})

stopLastCron()
nodeCleanup(cleanup)

export default app
