import { Router } from 'express'
import * as controller from '../controllers/checkController.js'

const router = Router()

router.get('/restart', controller.restart)
router.get('/connected', controller.connected)

export default router
