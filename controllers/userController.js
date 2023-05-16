const { db, query } = require('../database')
const jwt = require('jsonwebtoken')


module.exports = {
    fetchUser: async (req, res) => {
        const userId = parseInt(req.user.id)
        const payload = { id: userId }
        const token = jwt.sign(payload, 'rifqi', { expiresIn: '1h' })
        await query(`UPDATE users SET token = ${db.escape(token)} WHERE id_user=${db.escape(userId)} `)

        const userQuery = await query(`SELECT * FROM users WHERE id_user=${db.escape(userId)}`)
        const userData = {
            userId: userQuery[0].id_user,
            email: userQuery[0].email,
            username: userQuery[0].user_name,
            fullname: userQuery[0].full_name,
            bio: userQuery[0].bio,
            pic: userQuery[0].profile_pic,
            isVerify :userQuery[0].is_verify
        }
        console.log(userData);
        res.status(200).send({ userData,token })
    },
    editUser: async (req, res) => {
        const { username, fullname, bio } = req.body
        const userId = parseInt(req.user.id)
        if (username) {
            const isUserNameExist = await query(`SELECT user_name FROM users WHERE user_name = ${db.escape(username)}`)
            if (isUserNameExist.length>0 ) {
                if (isUserNameExist[0].user_name.toLowerCase()===username.toLowerCase()) {
                    return res.status(200).send({ message: 'Username already exist' })
    
                }
                
            } else {
                await query(`UPDATE users SET user_name = ${db.escape(username)} WHERE id_user=${db.escape(userId)}`)
            }
                
        }
        if (fullname) {
            await query(`UPDATE users SET full_name = ${db.escape(fullname)} WHERE id_user=${db.escape(userId)} `)
        }
        if (bio) {
            await query(`UPDATE users SET bio = ${db.escape(bio)} WHERE id_user=${db.escape(userId)}`)

        }
        if (req.file) {
            let filename = '/' + req.file.filename;

            await query(`UPDATE users SET profile_pic = ${db.escape(filename)} WHERE id_user=${db.escape(userId)}`) 
            
        }
        res.status(200).send({message:'Update Succes'})
    }
}