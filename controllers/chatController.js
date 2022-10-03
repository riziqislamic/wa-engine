import { getSession, getChatList, isExists, sendMessage, formatPhone } from './../whatsapp.js'
import response from './../response.js'
import phoneNumberFormatter from './../helpers/formatter.js'
import db from './../models/index.js'
import dateFormat from 'dateformat'
import fetch from 'node-fetch'

const Message = db.message
const Device = db.device
const MessageStatus = db.message_status
const Op = db.Sequelize.Op
const sequelize = db.sequelize
var dateNow = dateFormat(new Date(), 'yyyy-mm-dd hh:MM:ss')
var jid_phone = ''

async function sendByText(data) {
    var result = new Array()
    var idMessage = data.id
    var device_id = data.device_id
    var number = data.number
    var message = data.message
    var file = data.file
    var type = data.type

    const session = getSession(device_id)
    const receiver = phoneNumberFormatter(number)

    try {
        const exists = await isExists(session, receiver)
        if (!exists) {
            updateAfterSendMessage(
                idMessage,
                device_id,
                jid_phone,
                '',
                number,
                message,
                file,
                7,
                type,
                'The receiver number is not exists.'
            )
            result = {
                deviceId: data.device_id,
                statusCode: 500,
                remarks: 'The receiver number is not exists.',
            }
            console.log(result)
            return response(res, 400, false, 'The receiver number is not exists.')
        }
        await sendMessage(session, receiver, { text: message })
            .then(async (response) => {
                var messageId = response.key.id
                var messageStatus = response.status
                result = {
                    deviceId: data.device_id,
                    statusCode: 200,
                    remarks: 'Sent Message Successfully',
                    data: {
                        messageId: messageId,
                        messageStatus: messageStatus,
                    },
                }
                console.log(result)
                updateAfterSendMessage(
                    idMessage,
                    device_id,
                    jid_phone,
                    messageId,
                    number,
                    message,
                    file,
                    messageStatus,
                    type,
                    ''
                )
                return result
            })
            .catch((err) => {
                result = {
                    deviceId: data.device_id,
                    statusCode: 500,
                    remarks: 'Failed',
                    error: err.toString(),
                }
                updateAfterSendMessage(
                    idMessage,
                    device_id,
                    jid_phone,
                    '',
                    number,
                    message,
                    file,
                    7,
                    type,
                    err.toString()
                )
                console.log(result)
                return result
            })
    } catch (err) {
        result = {
            deviceId: data.device_id,
            statusCode: 500,
            remarks: 'Failed',
            error: 'Failed to send the message',
        }
        console.log(result)
        await updateStatus(idMessage, '7', err.toString())
        return result
    }
}

async function sendByDoc(data) {
    var result = new Array()
    var idMessage = data.id
    var device_id = data.device_id
    var number = data.number
    var message = data.message
    var file = data.file
    var type = data.type
    if (file != '') {
        const response = await fetch(file, {
            method: 'HEAD',
        })

        if (response.status == 200) {
            const session = getSession(device_id)
            const receiver = phoneNumberFormatter(number)

            try {
                const exists = await isExists(session, receiver)
                // if (!exists) {
                //   // const jid_phone = session.user.id;
                //   updateAfterSendMessage(
                //     idMessage,
                //     device_id,
                //     jid_phone,
                //     "",
                //     number,
                //     message,
                //     file,
                //     7,
                //     type,
                //     "The receiver number is not exists."
                //   );
                //   return response(res, 400, false, "The receiver number is not exists.");
                // }
                await sendMessage(session, receiver, {
                    document: { url: file },
                    fileName: message,
                    mimetype: 'application/pdf',
                })
                    .then(async (response) => {
                        var messageId = response.key.id
                        var messageStatus = response.status
                        result = {
                            deviceId: data.device_id,
                            statusCode: 200,
                            remarks: 'Sent Message Successfully',
                            data: {
                                messageId: messageId,
                                messageStatus: messageStatus,
                            },
                        }
                        updateAfterSendMessage(
                            idMessage,
                            device_id,
                            jid_phone,
                            messageId,
                            number,
                            message,
                            file,
                            messageStatus,
                            type,
                            ''
                        )
                        console.log(result)
                        return result
                    })
                    .catch((err) => {
                        result = {
                            deviceId: data.device_id,
                            statusCode: 500,
                            remarks: 'Failed',
                            error: err == null ? 'null' : err.toString(),
                        }
                        updateAfterSendMessage(
                            idMessage,
                            device_id,
                            jid_phone,
                            '',
                            number,
                            message,
                            file,
                            7,
                            type,
                            err == null ? 'null' : err.toString()
                        )
                        console.log(result)
                        return result
                    })
            } catch (err) {
                result = {
                    deviceId: data.device_id,
                    statusCode: 500,
                    remarks: 'Failed',
                    error: err == null ? 'null' : err.toString(),
                }
                await updateStatus(idMessage, '7', err == null ? 'null' : err.toString())
                console.log(result)
                return result
            }
        } else {
            result = {
                deviceId: data.device_id,
                statusCode: 500,
                remarks: 'Failed',
                error: 'URL file tidak ditemukan',
            }
            updateAfterSendMessage(
                idMessage,
                device_id,
                jid_phone,
                '',
                number,
                message,
                file,
                7,
                type,
                'URL file tidak ditemukan'
            )
            console.log(result)
            return result
        }
    } else {
        result = {
            deviceId: data.device_id,
            statusCode: 500,
            remarks: 'Failed',
            error: 'URL file tidak ditemukan',
        }
        updateAfterSendMessage(
            idMessage,
            device_id,
            jid_phone,
            '',
            number,
            message,
            file,
            7,
            type,
            'URL file tidak ditemukan'
        )
        console.log(result)
        return result
    }
}

async function sendByImage(data) {
    var result = new Array()
    var idMessage = data.id
    var device_id = data.device_id
    var number = data.number
    var message = data.message
    var file = data.file
    var type = data.type

    if (file != '') {
        const response = await fetch(file, {
            method: 'HEAD',
        })

        if (response.status == 200) {
            const session = getSession(device_id)
            const receiver = phoneNumberFormatter(number)

            try {
                const exists = await isExists(session, receiver)
                if (!exists) {
                    updateAfterSendMessage(
                        idMessage,
                        device_id,
                        jid_phone,
                        '',
                        number,
                        message,
                        file,
                        7,
                        type,
                        'The receiver number is not exists.'
                    )
                    result = {
                        deviceId: data.device_id,
                        statusCode: 500,
                        remarks: 'The receiver number is not exists.',
                    }
                    console.log(result)
                    return response(res, 400, false, 'The receiver number is not exists.')
                }

                await sendMessage(session, receiver, {
                    image: { url: file },
                    caption: message,
                    mimetype: 'image/jpeg',
                })
                    .then(async (response) => {
                        var messageId = response.key.id
                        var messageStatus = response.status
                        result = {
                            deviceId: data.device_id,
                            statusCode: 200,
                            remarks: 'Sent Message Successfully',
                            data: {
                                messageId: messageId,
                                messageStatus: messageStatus,
                            },
                        }
                        console.log(result)
                        updateAfterSendMessage(
                            idMessage,
                            device_id,
                            jid_phone,
                            messageId,
                            number,
                            message,
                            file,
                            messageStatus,
                            type,
                            ''
                        )
                        return result
                    })
                    .catch((err) => {
                        result = {
                            deviceId: data.device_id,
                            statusCode: 500,
                            remarks: 'Failed',
                            error: err.toString(),
                        }
                        console.log(result)
                        updateAfterSendMessage(
                            idMessage,
                            device_id,
                            jid_phone,
                            '',
                            number,
                            message,
                            file,
                            7,
                            type,
                            err.toString()
                        )
                        return result
                    })
            } catch (err) {
                result = {
                    deviceId: data.device_id,
                    statusCode: 500,
                    remarks: 'Failed',
                    error: 'Failed to send the message',
                }
                console.log(result)
                await updateStatus(idMessage, '7', err.toString())
                return result
            }
        } else {
            result = {
                deviceId: data.device_id,
                statusCode: 500,
                remarks: 'Failed',
                error: 'URL file tidak ditemukan',
            }
            console.log(result)
            updateAfterSendMessage(
                idMessage,
                device_id,
                jid_phone,
                '',
                number,
                message,
                file,
                7,
                type,
                'URL file tidak ditemukan'
            )
            return result
        }
    } else {
        result = {
            deviceId: data.device_id,
            statusCode: 500,
            remarks: 'Failed',
            error: 'URL file tidak ditemukan',
        }
        console.log(result)
        updateAfterSendMessage(
            idMessage,
            device_id,
            jid_phone,
            '',
            number,
            message,
            file,
            7,
            type,
            'URL file tidak ditemukan'
        )
        return result
    }
}

const sendText = async (req, res) => {
    try {
        var device_id = req.body.device_id
        var number = phoneNumberFormatter(req.body.number)
        var realNumber = req.body.number
        var message = req.body.message
        var file = ''
        var type = 'text'
        if (req.body.number.length > 6) {
            var idMessage = await storeMessage(device_id, realNumber, message, file, type)
            var result = {
                status: true,
                message: 'Successfully',
                message_id: idMessage,
                status: 'Sending',
            }
            if (!idMessage) {
                result = {
                    status: false,
                    message: 'Failed store message to database',
                    message_id: null,
                }
            }
        } else {
            var result = {
                status: true,
                message: 'Nomor HP tidak valid',
                message_id: req.body.number.length,
                status: 'Sending',
            }
        }
        res.status(200).send(result)
    } catch (e) {
        res.status(200).send({ status: false, statusCode: 500, message: e.message })
    }
}

const sendDoc = async (req, res) => {
    try {
        var device_id = req.body.device_id
        var number = phoneNumberFormatter(req.body.number)
        var realNumber = req.body.number
        var message = req.body.caption
        var file = req.body.file
        var type = 'document'
        if (req.body.number.length > 6) {
            var idMessage = await storeMessage(device_id, realNumber, message, file, type)
            var result = {
                status: true,
                message: 'Successfully',
                message_id: idMessage,
                status: 'Sending',
            }
            if (!idMessage) {
                result = {
                    status: false,
                    message: 'Failed store message to database',
                    message_id: null,
                }
            }
        } else {
            var result = {
                status: true,
                message: 'Nomor HP tidak valid',
                message_id: null,
                status: 'Sending',
            }
        }
        res.status(200).send(result)
    } catch (e) {
        res.status(200).send({ status: false, statusCode: 500, message: e.message })
    }
}

const sendImage = async (req, res) => {
    try {
        var device_id = req.body.device_id
        var number = phoneNumberFormatter(req.body.number)
        var realNumber = req.body.number
        var message = req.body.caption
        var file = req.body.image
        var type = 'image'
        if (req.body.number.length > 6) {
            var idMessage = await storeMessage(device_id, realNumber, message, file, type)
            var result = {
                status: true,
                message: 'Successfully',
                message_id: idMessage,
                status: 'Sending',
            }
            if (!idMessage) {
                result = {
                    status: false,
                    message: 'Failed store message to database',
                    message_id: null,
                }
            }
        } else {
            var result = {
                status: true,
                message: 'Nomor HP tidak valid',
                message_id: null,
                status: 'Sending',
            }
        }
        res.status(200).send(result)
    } catch (e) {
        res.status(200).send({ status: false, statusCode: 500, message: e.message })
    }
}

const sendDirectText = async (req, res) => {
    try {
        var device_id = req.body.device_id
        var number = phoneNumberFormatter(req.body.number)
        var realNumber = req.body.number
        var message = req.body.message
        var file = ''
        var type = 'text'
        var idMessage = await storeMessage(device_id, realNumber, message, file, type)
        var result = {
            status: true,
            message: 'Successfully',
            message_id: idMessage,
            status: 'Sending',
        }
        if (!idMessage) {
            result = {
                status: false,
                message: 'Failed store message to database',
                message_id: null,
            }
        } else {
            await sendDirectMessage(idMessage)
        }
        res.status(200).send(result)
    } catch (e) {
        res.status(200).send({ status: false, statusCode: 500, message: e.message })
    }
}

const sendDirectDoc = async (req, res) => {
    try {
        var device_id = req.body.device_id
        var number = phoneNumberFormatter(req.body.number)
        var realNumber = req.body.number
        var message = req.body.caption
        var file = req.body.file
        var type = 'document'

        var idMessage = await storeMessage(device_id, realNumber, message, file, type)
        var result = {
            status: true,
            message: 'Successfully',
            message_id: idMessage,
            status: 'Sending',
        }
        if (!idMessage) {
            result = {
                status: false,
                message: 'Failed store message to database',
                message_id: null,
            }
        } else {
            await sendDirectMessage(idMessage)
        }
        res.status(200).send(result)
    } catch (e) {
        res.status(200).send({ status: false, statusCode: 500, message: e.message })
    }
}

const sendDirectImage = async (req, res) => {
    try {
        var device_id = req.body.device_id
        var number = phoneNumberFormatter(req.body.number)
        var realNumber = req.body.number
        var message = req.body.caption
        var file = req.body.image
        var type = 'image'

        var idMessage = await storeMessage(device_id, realNumber, message, file, type)
        var result = {
            status: true,
            message: 'Successfully',
            message_id: idMessage,
            status: 'Sending',
        }
        if (!idMessage) {
            result = {
                status: false,
                message: 'Failed store message to database',
                message_id: null,
            }
        } else {
            await sendDirectMessage(idMessage)
        }
        res.status(200).send(result)
    } catch (e) {
        res.status(200).send({ status: false, statusCode: 500, message: e.message })
    }
}

//CHAT LIST
const getChats = async (req, res) => {
    try {
        var device_id = req.body.device_id
        var data = getChatList(device_id, false)
        res.status(200).send(data)
    } catch (e) {
        res.status(200).send({ status: false, statusCode: 500, message: e.message })
    }
}

async function sendDirectMessage(id) {
    console.log('===============SENDING MESSAGE DEVICE ID' + id + '=====================')
    var result = new Array()
    var data = await Message.findOne({
        where: { id: id, status_message: 0 },
    }).then((res) => {
        if (res) {
            return res
        } else {
            return null
        }
    })

    if (data != null) {
        var type = data.type
        var idMessage = data.id

        if (type == 'text') {
            await updateStatus(idMessage, '10', 'Sending')
            result = await sendByText(data)
        } else if (type == 'document') {
            await updateStatus(idMessage, '10', 'Sending')
            result = await sendByDoc(data)
        } else if (type == 'image') {
            await updateStatus(idMessage, '10', 'Sending')
            result = await sendByImage(data)
        } else {
            var idMessage = data.id
            var device_id = data.device_id
            var number = data.number
            var message = data.message
            var file = data.file
            var type = data.type
            result = {
                statusCode: 500,
                remarks: 'Message: Unknown type',
            }
            updateAfterSendMessage(
                idMessage,
                device_id,
                '',
                '',
                number,
                message,
                file,
                7,
                type,
                'Message: Unknown type'
            )
        }
    } else {
        result = {
            statusCode: 200,
            remarks: 'Message: Empty Queue',
        }
        // console.log("===============Empty Queue DEVICE ID" + id + "=====================");
    }

    return result
}

async function sendMessageQueue(id) {
    console.log('===============SENDING MESSAGE DEVICE ID : ' + id + '=====================')
    var result = new Array()
    var data = await Message.findOne({
        where: { device_id: id, status_message: 0 },
    }).then((res) => {
        if (res) {
            return res
        } else {
            return null
        }
    })

    if (data != null) {
        var type = data.type
        var idMessage = data.id

        if (type == 'text') {
            await updateStatus(idMessage, '10', 'Sending')
            result = await sendByText(data)
        } else if (type == 'document') {
            await updateStatus(idMessage, '10', 'Sending')
            result = await sendByDoc(data)
        } else if (type == 'image') {
            await updateStatus(idMessage, '10', 'Sending')
            result = await sendByImage(data)
        } else {
            var idMessage = data.id
            var device_id = data.device_id
            var number = data.number
            var message = data.message
            var file = data.file
            var type = data.type
            result = {
                statusCode: 500,
                remarks: 'Message: Unknown type',
            }
            updateAfterSendMessage(
                idMessage,
                device_id,
                '',
                '',
                number,
                message,
                file,
                7,
                type,
                'Message: Unknown type'
            )
        }
    } else {
        result = {
            statusCode: 200,
            remarks: 'Message: Empty Queue',
        }
        // console.log("===============Empty Queue DEVICE ID" + id + "=====================");
    }

    return result
}

async function storeMessage(device_id, number, message, url, type) {
    console.log('STORE MESSAGE TIME ' + dateNow)
    let value = {
        device_id: device_id,
        number: number,
        message: message,
        file: url,
        type: type,
        status_message: 0,
    }
    var id = await Message.create(value)
        .then((result) => {
            return result.id
        })
        .catch((err) => {
            console.log(err)
        })
    // console.log(id)
    return id
}

function updateAfterSendMessage(
    idMessage,
    device_id,
    jid_phone,
    message_id,
    number,
    message,
    url,
    status_message,
    type,
    remarks
) {
    // console.log("UPDATE AFTER SENDING " + idMessage);
    // console.log(message_id);

    Message.findOne({
        where: { id: idMessage },
    }).then((res) => {
        if (res) {
            let value = {
                jid_phone: jid_phone,
                message_id: message_id,
                status_message: status_message,
                remarks: remarks,
            }
            Message.update(value, { where: { id: idMessage } })
        } else {
            let value = {
                device_id: device_id,
                jid_phone: jid_phone,
                message_id: message_id,
                number: number,
                message: message,
                file: url,
                status_message: status_message,
                type: type,
                remarks: remarks,
            }
            Message.create(value)
        }
    })
}

async function updateStatus(idMessage, status_message, remarks) {
    let value = {
        status_message: status_message,
        remarks: remarks,
    }
    return Message.update(value, { where: { id: idMessage } })
}

export { sendText, sendDoc, sendImage, sendDirectText, sendDirectDoc, sendDirectImage, sendMessageQueue, getChats }
