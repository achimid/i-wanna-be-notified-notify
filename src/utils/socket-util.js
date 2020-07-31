const http = require('http')
// const createSocket = require('socket.io')

let socket = null

const socketInit = (app) => {

    const server = http.createServer(app)
    socket = require('socket.io')(server)    

    console.info('Iniciando sockets...')
    
    socket.on('connection', (client) => {
        console.log('Client conectado...', client.id)        
        client.on('disconnect', () => console.log('Client desconectado...'))
    })

    return server
}

const getSocket = () => { return socket }


module.exports = {
    getSocket,
    socketInit
}