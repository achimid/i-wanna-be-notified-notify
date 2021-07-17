const log = require('../utils/logger')
const { getSocket } = require('../utils/socket-util')

const notifyWebSocket = (vo, monitoring, execution) => {
    const data = { monitoring, execution }
    const { notificationData, saveNotification } = vo     
    
    try {
        const socket = getSocket()
        socket.emit(`i-wanna-be-notified-event`, data)
        socket.emit(`i-wanna-be-notified-event-${execution.monitoringId}`, data)    

        notificationData.isSuccess = true    

        log.info(vo.data, 'Notification posted to websocket event')
    } catch (error) {
        notificationData.errorOnSendWebsocket = error
        notificationData.isSuccess = false
    }
    
    saveNotification(vo, notificationData)
}

const send = (vo) => {
    const { monitoring, execution } = vo
    
    log.info(vo.data, 'Posting notification to websocket event')
    notifyWebSocket(vo, monitoring, execution)
}

module.exports = {
    send
}