import { Router } from 'express'
import { body, query } from 'express-validator'
import requestValidator from './../middlewares/requestValidator.js'
import sessionValidator from './../middlewares/sessionValidator.js'
// import * as controller from "./../controllers/chatController.js";
import getMessages from './../controllers/getMessages.js'

const router = Router()

// router.post("/send-text", controller.sendText);
// router.post("/send-document", controller.sendDoc);
// router.post("/send-image", controller.sendImage);
// router.post("/get-chats", controller.getChats);

// router.post("/direct/send-text", controller.sendDirectText);
// router.post("/direct/send-document", controller.sendDirectDoc);
// router.post("/direct/send-image", controller.sendDirectImage);

export default router
