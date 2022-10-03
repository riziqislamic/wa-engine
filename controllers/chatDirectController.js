import { getSession, isExists, sendMessage, formatPhone } from './../whatsapp.js'
import phoneNumberFormatter from './../helpers/formatter.js'
import fetch from 'node-fetch'

async function sendByText(data) {
    var result = new Array()
    var device_id = data.device_id
    var number = data.number
    var message = data.message

    const session = getSession(device_id)
    const receiver = phoneNumberFormatter(number)

    try {
        if (session != null) {
            const exists = await isExists(session, receiver)
            if (!exists) {
                result = {
                    deviceId: data.device_id,
                    statusCode: 500,
                    remarks: 'The receiver number is not exists.',
                }
                console.log(result)
                return result
            }
            return await sendMessage(session, receiver, { text: message })
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
                    return result
                })
        } else {
            result = {
                deviceId: data.device_id,
                statusCode: 500,
                remarks: 'Failed',
                error: 'Session not found, please scan before',
            }
            console.log(result)
            return result
        }
    } catch (err) {
        result = {
            deviceId: data.device_id,
            statusCode: 500,
            remarks: 'Failed to send the message',
            error: err,
        }
        return result
    }
}

async function sendByDoc(data) {
    var result = new Array()
    var device_id = data.device_id
    var number = data.number
    var message = data.message
    var file = data.file
    if (file != '') {
        const response = await fetch(file, {
            method: 'HEAD',
        })

        if (response.status == 200) {
            const session = getSession(device_id)
            const receiver = phoneNumberFormatter(number)
            if (session != null) {
                try {
                    return await sendMessage(session, receiver, {
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
                    console.log(result)
                    return result
                }
            } else {
                result = {
                    deviceId: data.device_id,
                    statusCode: 500,
                    remarks: 'Failed',
                    error: 'Session not found, please scan before',
                }
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

    if (file != '') {
        const response = await fetch(file, {
            method: 'HEAD',
        })

        if (response.status == 200) {
            const session = getSession(device_id)
            const receiver = phoneNumberFormatter(number)
            if (session != null) {
                try {
                    const exists = await isExists(session, receiver)
                    if (!exists) {
                        result = {
                            deviceId: data.device_id,
                            statusCode: 500,
                            remarks: 'The receiver number is not exists.',
                        }
                        console.log(result)
                        return response(res, 400, false, 'The receiver number is not exists.')
                    }

                    return await sendMessage(session, receiver, {
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
                    return result
                }
            } else {
                result = {
                    deviceId: data.device_id,
                    statusCode: 500,
                    remarks: 'Failed',
                    error: 'Session not found, please scan before',
                }
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
        console.log(result)
        return result
    }
}

const sendDirectText = async (req, res) => {
    try {
        var device_id = req.body.device_id
        var number = phoneNumberFormatter(req.body.number)
        var message = req.body.message
        var data = {
            device_id: device_id,
            number: number,
            message: message,
        }
        var result = await sendByText(data)
        res.status(200).send(result)
    } catch (e) {
        res.status(200).send({ status: false, statusCode: 500, message: e.message })
    }
}

const sendDirectDoc = async (req, res) => {
    try {
        var device_id = req.body.device_id
        var number = phoneNumberFormatter(req.body.number)
        var message = req.body.caption
        var file = req.body.file
        var data = {
            device_id: device_id,
            number: number,
            message: message,
            file: file,
        }
        var result = await sendByDoc(data)
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
        var file = req.body.file
        var data = {
            device_id: device_id,
            number: number,
            message: message,
            file: file,
        }
        var result = await sendByImage(data)
        res.status(200).send(result)
    } catch (e) {
        res.status(200).send({ status: false, statusCode: 500, message: e.message })
    }
}

export { sendDirectText, sendDirectDoc, sendDirectImage }
