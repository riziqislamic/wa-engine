import { existsSync, unlinkSync, readdir } from 'fs'
import { join } from 'path'
import makeWASocket, {
    makeWALegacySocket,
    useSingleFileAuthState,
    useSingleFileLegacyAuthState,
    makeInMemoryStore,
    Browsers,
    DisconnectReason,
    delay,
} from '@adiwajshing/baileys'
import { toDataURL } from 'qrcode'
import __dirname from './dirname.js'
import response from './response.js'
// import db from './models/index.js'
// import * as queue from './controllers/chatController.js'
// import cron from 'node-cron'
import dateFormat from 'dateformat'
var dateNow = dateFormat(new Date(), 'yyyy-mm-dd hh:MM:ss')

// const Message = db.message
// const Device = db.device
// const MessageStatus = db.message_status

const sessions = new Map()
const retries = new Map()

const sessionsDir = (sessionId = '') => {
    return join(__dirname, 'sessions', sessionId ? `${sessionId}.json` : '')
}

const isSessionExists = (sessionId) => {
    return sessions.has(sessionId)
}

const isSessionFileExists = (name) => {
    return existsSync(sessionsDir(name))
}

const shouldReconnect = (sessionId) => {
    let maxRetries = parseInt(process.env.MAX_RETRIES ?? 0)
    let attempts = retries.get(sessionId) ?? 0

    maxRetries = maxRetries < 1 ? 1 : maxRetries

    if (attempts < maxRetries) {
        ++attempts

        console.log('Reconnecting...', { attempts, sessionId })
        retries.set(sessionId, attempts)

        return true
    }

    return false
}

const createSession = async (sessionId, isLegacy = false, res = null) => {
    const sessionFile = (isLegacy ? 'legacy_' : 'md_') + sessionId
    console.log(sessionId)
    const store = makeInMemoryStore({})
    const { state, saveState } = isLegacy
        ? useSingleFileLegacyAuthState(sessionsDir(sessionFile))
        : useSingleFileAuthState(sessionsDir(sessionFile))

    /**
     * @type {(import('@adiwajshing/baileys').LegacySocketConfig|import('@adiwajshing/baileys').SocketConfig)}
     */
    const waConfig = {
        auth: state,
        printQRInTerminal: true,
        // browser: Browsers.ubuntu("Chrome"),
        browser: ['Wa Sender', 'MacOS', '3.0'],
    }

    /**
     * @type {import('@adiwajshing/baileys').AnyWASocket}
     */
    const wa = isLegacy ? makeWALegacySocket(waConfig) : makeWASocket.default(waConfig)

    if (!isLegacy) {
        store.readFromFile(sessionsDir(`${sessionId}_store`))
        store.bind(wa.ev)
    }

    sessions.set(sessionId, { ...wa, store, isLegacy })

    wa.ev.on('creds.update', saveState)

    // wa.ev.on('chats.update', m => console.log(m))
    wa.ev.on('messages.update', async (chat) => {
        if (chat.length > 0) {
            const msg = chat[0]
            if (msg.key.fromMe) {
                var message_id = msg.key.id
                var status_message = msg.update.status
                // updateStatusChat(message_id, status_message)
            }
        }
    })

    wa.ev.on('chats.set', ({ chats }) => {
        if (isLegacy) {
            store.chats.insertIfAbsent(...chats)
        }
    })

    wa.ev.on('connection.update', async (update) => {
        console.log('UPDATE CONNECTION : ' + sessionId)
        // console.log(update);
        if (update.receivedPendingNotifications) {
            // updateDisconected(sessionId, true)

            var newcon = `con${sessionId}`

            // newcon = cron.schedule("*/30 * * * * *", () => {
            //   console.log("RUNNING CRON : " + sessionId);
            //   queue.sendMessageQueue(sessionId);
            // });
            // upsertData(wa, isLegacy);
        }
        const { connection, lastDisconnect } = update
        const statusCode = lastDisconnect?.error?.output?.statusCode

        if (connection === 'open') {
            retries.delete(sessionId)
        }

        if (connection === 'close') {
            if (statusCode === DisconnectReason.loggedOut || !shouldReconnect(sessionId)) {
                if (res && !res.headersSent) {
                    response(res, 500, false, 'Unable to create session.')
                }

                return deleteSession(sessionId, isLegacy)
            }
            if (statusCode !== DisconnectReason.loggedOut) {
                createSession(sessionId, isLegacy, res)
            }

            // setTimeout(
            //   () => {
            //     createSession(sessionId, isLegacy, res);
            //   },
            //   statusCode === DisconnectReason.restartRequired
            //     ? 0
            //     : parseInt(process.env.RECONNECT_INTERVAL ?? 0)
            // );
            //"level":40,"time":"2022-05-10T03:13:35.617Z","pid":36063,"hostname":"server.eazynotif.id","class":"baileys","msg":"If your process stalls here, make sure to implement the reconnect logic as shown in https://github.com/adiwajshing/Baileys/blob/master/Example/example.ts#:~:text=reconnect"}
        }

        if (update.qr) {
            if (res && !res.headersSent) {
                try {
                    const qr = await toDataURL(update.qr)

                    response(res, 200, true, 'QR code received, please scan the QR code.', { qr })
                } catch {
                    response(res, 500, false, 'Unable to create QR code.')
                }

                return
            }

            try {
                await wa.logout()
            } catch {
            } finally {
                deleteSession(sessionId, isLegacy)
            }
        }
    })
}

const upsertData = (wa, isLegacy) => {
    wa.ev.on('messages.upsert', async (m) => {
        const message = m.messages[0]

        if (!message.key.fromMe && m.type === 'notify') {
            await delay(1000)

            if (isLegacy) {
                await wa.chatRead(message.key, 1)
            } else {
                await wa.sendReadReceipt(message.key.remoteJid, message.key.participant, [message.key.id])
            }
        }
    })
}

/**
 * @returns {(import('@adiwajshing/baileys').AnyWASocket|null)}
 */
const getSession = (sessionId) => {
    return sessions.get(sessionId) ?? null
}

const deleteSession = (sessionId, isLegacy = false) => {
    console.log('deleteSession : ' + sessionId)
    const sessionFile = (isLegacy ? 'legacy_' : 'md_') + sessionId
    const storeFile = `${sessionId}_store`

    if (isSessionFileExists(sessionFile)) {
        unlinkSync(sessionsDir(sessionFile))
    }

    if (isSessionFileExists(storeFile)) {
        unlinkSync(sessionsDir(storeFile))
    }

    sessions.delete(sessionId)
    retries.delete(sessionId)
    // updateDisconected(sessionId, false)
}

const getChatList = (sessionId, isGroup = false) => {
    const filter = isGroup ? '@g.us' : '@s.whatsapp.net'

    return getSession(sessionId).store.chats
}

/**
 * @param {import('@adiwajshing/baileys').AnyWASocket} session
 */
const isExists = async (session, jid, isGroup = false) => {
    try {
        let result

        if (isGroup) {
            result = await session.groupMetadata(jid)

            return Boolean(result.id)
        }

        if (session.isLegacy) {
            result = await session.onWhatsApp(jid)
        } else {
            ;[result] = await session.onWhatsApp(jid)
        }

        return result.exists
    } catch {
        return false
    }
}

/**
 * @param {import('@adiwajshing/baileys').AnyWASocket} session
 */
const sendMessage = async (session, receiver, message) => {
    try {
        await delay(1000)

        return session.sendMessage(receiver, message)
    } catch {
        return Promise.reject(null) // eslint-disable-line prefer-promise-reject-errors
    }
}

const formatPhone = (phone) => {
    if (phone.endsWith('@s.whatsapp.net')) {
        return phone
    }

    let formatted = phone.replace(/\D/g, '')

    return (formatted += '@s.whatsapp.net')
}

const formatGroup = (group) => {
    if (group.endsWith('@g.us')) {
        return group
    }

    let formatted = group.replace(/[^\d-]/g, '')

    return (formatted += '@g.us')
}

const cleanup = () => {
    console.log('Running cleanup before exit.')

    sessions.forEach((session, sessionId) => {
        if (!session.isLegacy) {
            session.store.writeToFile(sessionsDir(`${sessionId}_store`))
        }
    })
}

const init = () => {
    readdir(sessionsDir(), (err, files) => {
        if (err) {
            throw err
        }

        for (const file of files) {
            if (
                !file.endsWith('.json') ||
                (!file.startsWith('md_') && !file.startsWith('legacy_')) ||
                file.includes('_store')
            ) {
                continue
            }

            const filename = file.replace('.json', '')
            const isLegacy = filename.split('_', 1)[0] !== 'md'
            const sessionId = filename.substring(isLegacy ? 7 : 3)

            createSession(sessionId, isLegacy)

            // var newcon = `con${sessionId}`;
            // newcon = cron.schedule('*/10 * * * * *', () => {
            //     console.log('RUNNING CRON : ' + sessionId);
            //     queue.sendMessageQueue(sessionId);
            // });
        }
    })
}

init()

// function updateDisconected(device_id, status) {
//     let values = {
//         status: status ? 'true' : 'false',
//         last_status_update: dateNow,
//     }
//     Device.update(values, { where: { device_id: device_id } })
// }

// function updateStatusChat(message_id, status_message) {
//     let values = { status_message: status_message }
//     Message.update(values, { where: { message_id: message_id } })
//     MessageStatus.findOne({
//         where: { message_id: message_id, status: status_message },
//     }).then((res) => {
//         if (!res) {
//             MessageStatus.create({ message_id: message_id, status: status_message })
//         }
//     })
// }

export {
    isSessionExists,
    createSession,
    getSession,
    deleteSession,
    getChatList,
    isExists,
    sendMessage,
    formatPhone,
    formatGroup,
    cleanup,
    init,
}