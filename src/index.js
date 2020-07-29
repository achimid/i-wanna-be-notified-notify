require('dotenv').config()

const cors = require('cors')
const express = require('express')

const databaseInit = require('./config/database')
const healthcheck = require('./config/healthcheck')
const consumerInit = require('./notification/execution-consumer')

const app = express()


app.use(cors())
app.use(express.json())
app.disable('x-powered-by')
app.use('/api/v1', healthcheck)

// Initializations
databaseInit()
consumerInit()


app.listen(process.env.PORT)


