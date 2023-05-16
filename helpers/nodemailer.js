const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'rifqirafialdy@gmail.com',
        pass:"madbyqmvoiowbsit"
    },
    tls: {
        rejectUnauthorized: false
    }
})
module.exports=transporter