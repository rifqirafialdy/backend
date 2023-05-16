const express = require('express')
const { authController } = require('../controllers')
const{verifyToken}= require('../middleware/auth')
const router = express.Router()

router.post('/register', authController.register)
router.post('/login', authController.login)
router.post('/verification', verifyToken, authController.verification)
router.post('/request-token',verifyToken, authController.requestNewToken)
router.post('/request-reset', authController.passwordToken)
router.post('/reset-password',verifyToken,authController.resetPassword)


module.exports= router