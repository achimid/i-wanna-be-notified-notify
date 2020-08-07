require('dotenv').config()

const cors = require('cors')
const express = require('express')

const { databaseInit } = require('./config/database')
const healthcheck = require('./config/healthcheck')
const executionConsumerInit = require('./execution/execution-consumer')
const { socketInit } = require('./utils/socket-util') 
const { telegramInit } = require('./integration/telegram')

const app = express()

app.use(cors())
app.use(express.json())
app.disable('x-powered-by')
app.use('/api/v1', healthcheck)


// Initializations
databaseInit()
telegramInit()
executionConsumerInit()


const server = socketInit(app)
server.listen(process.env.PORT)


