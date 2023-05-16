const jwt = require('jsonwebtoken')
const { db, query }  = require('../database')


const verifyToken = async (req, res, next) => {
    let token = req.headers.authorization
    if (!token) {
        return res.status(401).send('Access Denied')
    }
    
    token = token.split(' ')[1]
    const userQuery = await query(`SELECT * FROM users WHERE token = ${db.escape(token)}`)
    console.log(userQuery);
    if (token == 'null' || !token) {
        return res.status(401).send('Access Denied')
    }
    if (userQuery.length === 0) {
        return res.status(200).send('Acces Invalid you already request another Link')
        
    }
    
    let verifiedUser = jwt.verify(token, 'rifqi')
    if (!verifiedUser) {
        return res.status(401).send('Access Denied')
    }

    req.user = verifiedUser
    console.log(verifiedUser);
    next()

}

module.exports = { verifyToken}