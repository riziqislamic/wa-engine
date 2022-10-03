import { Router } from 'express'
import sessionRoutes from './routes/sessionRoutes.js'
import checkRoutes from './routes/checkRoutes.js'
// import chatRoutes from './routes/chatRoutes.js'
import chatDirectRoutes from './routes/chatDirectRoutes.js'
// import groupRoutes from './routes/groupRoutes.js'
import response from './response.js'

const router = Router()

router.use('/session', sessionRoutes)
// router.use('', chatRoutes)
router.use('', chatDirectRoutes)
router.use('', checkRoutes)
// router.use('/group', groupRoutes)

router.all('*', (req, res) => {
    response(res, 404, false, 'The requested url cannot be found.')
})

export default router
