const { db, query } = require('../database')
const jwt = require('jsonwebtoken')

module.exports = {
    addContent: async (req, res) => {
        const userId= req.user.id
        const {caption,} = req.body
        const date = new Date()

        const dateTime =
        date.getFullYear() + "/" +
        ("00" + (date.getMonth() + 1)).slice(-2) + "/" +
        ("00" + date.getDate()).slice(-2) + " " +
        ("00" + date.getHours()).slice(-2) + ":" +
        ("00" + date.getMinutes()).slice(-2) + ":" +
        ("00" + date.getSeconds()).slice(-2);
        console.log(dateTime);
        let filename = null;
        filename = '/' + req.file.filename;
        await query(`INSERT INTO content VALUES (null,${db.escape(caption)},${db.escape(filename)},${db.escape(dateTime)},0,${db.escape(userId)})  `)
        res.status(201).send({message:'Content Created'})
        
    },
    editContent: async (req, res) => {
        const contId = parseInt(req.params.id)
        const userId = parseInt(req.user.id)
        const caption = req.body.caption
        await query(`UPDATE  content SET caption=${db.escape(caption)} WHERE id_content=${db.escape(contId)} AND id_user=${db.escape(userId)}`)
        res.status(200).send('Update succes')
    },
    deleteContent: async (req, res) => {
        const contId = parseInt(req.params.id)
        const userId = parseInt(req.user.id)
        await query(`DELETE FROM content  WHERE id_content=${db.escape(contId)} AND id_user=${db.escape(userId)}`)
        res.status(200).send('Delete succes')
    },
    fetchPostList: async (req, res) => {
        const offset = parseInt(req.query.offset)
        console.log(offset);
        const postQuery = await query(`SELECT content.*,users.user_name FROM content INNER JOIN users ON
        content.id_user = users.id_user
        ORDER BY content.created_at DESC
        LIMIT 5
        OFFSET ${db.escape(offset)}`)
        return res.status(200).send(postQuery)
        
    },
    fetchPost: async (req, res) => {
        const contentId = parseInt(req.query.contId)
        let postQuery = await query (`SELECT comment.comment, cu.user_name AS comment_user,content.*,co.user_name AS post_owner FROM comment 
        INNER JOIN content ON comment.id_content = content.id_content
        INNER JOIN users cu ON comment.id_user = cu.id_user
        INNER JOIN users co ON content.id_user = co.id_user
        WHERE comment.id_content=${contentId}
        ORDER BY comment.id_comment DESC
        LIMIT 5`)
         if (postQuery.length == 0) {
            postQuery = await query(` SELECT content.*,users.user_name FROM content INNER JOIN users ON
            content.id_user = users.id_user WHERE content.id_content=${db.escape(contentId)} `)
         }
        res.status(200).send(postQuery)
    },
    likePost: async (req, res) => {
        const contentId = parseInt(req.query.contId)
       
            await query (`UPDATE content SET likes=(likes+1) WHERE id_content=${contentId}`)
            return res.status(201).send({message:'liked'})
        
    },
    commentPost: async (req, res) => {
        const userId = parseInt(req.user.id)
        const contentId = parseInt(req.query.contId)
        const comment = req.body.comment
        await query(`INSERT INTO comment VALUES (null,${db.escape(contentId)},${db.escape(userId)},${db.escape(comment)})`)
        res.status(200).send({message:"Comment Uploaded"})
    }


}