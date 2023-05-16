const { db, query }  = require('../database')
const  bcrypt  = require('bcrypt')
const jwt = require('jsonwebtoken')
const nodemailer = require('../helpers/nodemailer')

module.exports = {
    register: async (req, res) => {
        let { email, username, password, confPass } = req.body
        username = username.split(' ').join('')
        const isEmailExist = await query(`SELECT * FROM users WHERE email = ${db.escape(email)}`)
        if (isEmailExist.length > 0) {
            return res.status(200).send({message:'E-Mail has been used'})
        }
        const isUserNameExist = await query(`SELECT user_name FROM users WHERE user_name = ${db.escape(username)}`)
        console.log(isUserNameExist);
        if (isUserNameExist.length>0 ) {
            if (isUserNameExist[0].user_name.toLowerCase() === username.toLowerCase()) {
                return res.status(200).send({ message: 'Username already exist' })

            }
            
        }
        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(password, salt)
        const hashConfPass = await bcrypt.hash(confPass, salt)
        
        if (hashPassword != hashConfPass) {
            return res.status(200).send({message:'Password Not Match'})
        }
        const registeredUser = await query(`INSERT INTO users VALUES (null,${db.escape(email)},${db.escape(hashPassword)},${db.escape(username)},null,null,null,false,null)`)
        const payload = { id: registeredUser.insertId }
        const token = jwt.sign(payload, 'rifqi', { expiresIn: '1h' })
        await query(`UPDATE users SET token = ${db.escape(token)} WHERE id_user=${db.escape(registeredUser.insertId)} `)
        
        let mail = {
            from: 'Admin',
            to: `${email}`,
            subject: `Account Verification`,
            text:"Please Verify your Account by clicking the link below",
            html: `<h1>Please Verify your Account by clicking the link below</h1>
            <a href="http://localhost:3000/verification/${token}">http://localhost:3000/verification/${token}</a>`
            // H1 ditaruh didalam html karena Gmail secara default menerima/membaca formatted text bukan plain text, jika ditaruh di dalam "text" maka formatted text akan diubah menajdi plain text oleh nodemailer
        }
        let response = await nodemailer.sendMail(mail)

        return res.status(200).send({ registeredUser, message: 'Register Succes' })
        

    },
    login: async (req, res) => {
        const { email, username, password } = req.body
        console.log(password);
        const userExist = await query(`SELECT * FROM users WHERE ${email ? `email = ${db.escape(email)}` : `user_name = ${db.escape(username)}`} `)
        if (userExist.length === 0) {
            return res.status(200).send({ message:"User didn't exist"})
            
        }
        const isValid = await bcrypt.compare(password, userExist[0].password)
        console.log(isValid);
        if (!isValid) {
            return res.status(200).send({message:'Wrong Password'})
            
        }
        const payload = { id: userExist[0].id_user }
        const token = jwt.sign(payload, 'rifqi', { expiresIn: '1h' })
        await query(`UPDATE users SET token = ${db.escape(token)} WHERE id_user=${db.escape(userExist[0].id_user)} `)
        return res.status(200).send({
            message: 'Login Succes',
            token,
            data: {
                id:userExist[0].id_user,
                username:userExist[0].user_name,
                email:userExist[0].email,
                isVerify:userExist[0].is_verify,
            }
        })

      
        
    },
    verification: async (req, res) => {
    const id = parseInt(req.user.id)
    const userQuery = await query(`SELECT * FROM users WHERE id_user= ${db.escape(id)}`)
    const verified =Boolean (userQuery[0].is_verify)
        if (verified) {
        return res.status(200).send({message:'Already verified'})
        
        }
        else {
            
            
            await query(`UPDATE users SET is_verify = true WHERE id_user= ${db.escape(id)}`)    
            res.status(200).send({message:'Your Account has been Verified'})
    }
    },
    requestNewToken: async (req, res) => {
        const userId = parseInt(req.user.id)
        const payload = { id: userId }
        const token = jwt.sign(payload, 'rifqi', { expiresIn: '1h' })
        await query(`UPDATE users SET token = ${db.escape(token)} WHERE id_user=${db.escape(userId)} `)
        const email = await query(`SELECT users.email FROM users WHERE id_user=${db.escape(userId)}`)
        console.log(email[0].email);
        let mail = {
            from: 'Admin',
            to: `${email[0].email}`,
            subject: `Account Verification`,
            html: `<h1>Please Verify your Account by clicking the link below</h1>
            <a href="http://localhost:3000/verification/${token}">http://localhost:3000/verification/${token}</a>`
        }
        let response = await nodemailer.sendMail(mail)
        console.log(response);
        res.status(200).send({message: 'New Verification Has been Sent to your email'})

    },
    passwordToken: async (req, res) => {
        const  email  = req.body.email
        console.log(req.body);
        const userQuery = await query(`SELECT id_user FROM users WHERE email = ${db.escape(email)}`)
        if (userQuery.length === 0) {
            return res.status(200).send({message:"Email not exist"})
            
        }
        const userId = parseInt(userQuery[0].id_user)
        const payload = { id: userId }
        const token = jwt.sign(payload, 'rifqi', { expiresIn: '1h' })
        await query(`UPDATE users SET token = ${db.escape(token)} WHERE id_user=${db.escape(userId)} `)
        let mail = {
            from: 'Admin',
            to: `${email}`,
            subject: `Reset Password`,
            html: `<h1>To Reset Your Password Please click the link below</h1>
            <a href="http://localhost:3000/reset-password/${token}">http://localhost:3000/reset-password/${token}</a>`
        }
        let response = await nodemailer.sendMail(mail)
        console.log(response);
        res.status(200).send({ message: 'Password Reset Link Has been Sent to your email' })



    },
    resetPassword: async (req, res) => {
        const id = parseInt(req.user.id)
        const { password, confPass } = req.body
        console.log(password);
        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(password, salt)
        const hashConfPass = await bcrypt.hash(confPass, salt)
        if (hashPassword != hashConfPass) {
            return res.status(200).send({message:'Password Not Match'})
        }
        else {
            await query (`UPDATE users SET password = ${db.escape(hashPassword)} WHERE id_user= ${db.escape(id)}`)
            return res.status(200).send({message:'Your New Password Set Succesfully'})
        }


        
    }
}