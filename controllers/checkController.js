const connected = async (req, res) => {
    try {
        res.status(200).send({ status: true, statusCode: 200, message: 'connected' })
    } catch (e) {
        res.status(200).send({ status: false, statusCode: 500, message: e.message })
    }
}

const restart = async (req, res) => {
    try {
        process.exit()
    } catch (e) {
        res.status(200).send({ status: false, statusCode: 500, message: e.message })
    }
}

export { restart, connected }
