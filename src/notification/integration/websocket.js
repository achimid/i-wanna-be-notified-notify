const { getSocket } = require('../../utils/socket-util')

const notifyWebSocket = (monitoring, execution) => {
    const data = { monitoring, execution }
    
    const socket = getSocket()
    socket.emit(`i-wanna-be-notified-event`, data)
    socket.emit(`i-wanna-be-notified-event-${execution.monitoringId}`, data)
}

const send = (vo) => {
    const { monitoring, execution  } = vo
    notifyWebSocket(monitoring, execution)
}

module.exports = {
    send
}