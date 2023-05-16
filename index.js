const express = require('express')
const port = 8001
const cors = require('cors')
const app = express()
const {authRoute,userRoute,contentRoute}= require('./routes')

app.use(express.json())
app.use(cors())
app.use(express.static('public'))
app.use('/auth', authRoute)
app.use('/user', userRoute)
app.use('/content',contentRoute)

app.listen(port, () => {
    console.log("Server is Running on Port : " + port);
})