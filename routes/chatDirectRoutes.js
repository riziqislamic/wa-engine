import { Router } from 'express'
import * as controller from '../controllers/chatDirectController.js'

const router = Router()

router.post('/send-direct-text', controller.sendDirectText)
router.post('/send-direct-document', controller.sendDirectDoc)
router.post('/send-direct-image', controller.sendDirectImage)

export default router
