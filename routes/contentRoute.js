const express = require('express')
const { contentController } = require('../controllers')
const{verifyToken}= require('../middleware/auth')
const router = express.Router()
const upload = require('../middleware/multerContent')

router.post('/add-content', verifyToken, upload.single('file'), contentController.addContent)
router.post('/edit-content/:id', verifyToken, contentController.editContent)
router.post('/delete-content/:id', verifyToken, contentController.deleteContent)
router.get('/fetch-postlist',contentController.fetchPostList)
router.get('/fetch-post', contentController.fetchPost)
router.post('/like-content',  contentController.likePost)
router.post('/upload-comment',verifyToken,contentController.commentPost)



module.exports=router