const express = require('express')
const {userController } = require('../controllers')
const{verifyToken}= require('../middleware/auth')
const router = express.Router()
const upload = require('../middleware/multer')


router.post('/fetch-user', verifyToken, userController.fetchUser)
router.post('/edit-user',verifyToken,upload.single('file'),userController.editUser)

module.exports=router