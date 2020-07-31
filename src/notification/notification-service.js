const log = require('../logger/logger')
const Execution = require('./execution-model')
const Monitoring = require('./monitoring-model')

const senderEmail = require('./integration/email')
const senderTelegram = require('./integration/telegram')
const senderWebhook = require('./integration/webhook')
const senderWebsocket = require('./integration/websocket')

const startNotification = async (data) => {
    log.info(data, 'Starging notification')

    const execution = await Execution.findById(data.id).lean()
    const monitoring = await Monitoring.findById(data.monitoringId).lean()

    const vo = { execution, monitoring, data }

    try {
        validate(vo)
        sendNotifications(vo)
        log.info(data, 'Notification sent')
    } catch (err) {
        log.info(data, 'Notification not sent', err)
    }

    log.info(data, 'Ending notification')
    
}

const validate = (vo) => {
    if (!vo.execution) {
        log.info(vo.data, 'Execution not found')
        throw ''
    }if (!vo.monitoring) {
        log.info(vo.data, 'Monitoring not found')
        throw ''
    }


    if (!vo.execution.isSuccess) {
        log.info(vo.data, 'Notification not send, execution not success')
        throw ''
    }

    let sendChanged = false
    let sendUnique = false

    if (!vo.monitoring.options.notifyChange) {
        log.info(vo.data, 'Notification not send, notifyChange=false')
    } else if (!vo.execution.hashTargetChanged) {
        log.info(vo.data, 'Notification not send, notifyChange=true and hashTargetnot changed')
    } else {
        sendChanged = true
    }
    
    if (!vo.monitoring.options.notifyUniqueChange) {
        log.info(vo.data, 'Notification not send, notifyUniqueChange=false')
    } else if (!vo.execution.hashTargetUnique) {
        log.info(vo.data, 'Notification not send, notifyUniqueChange=true and hashTarget not unique')
    } else {
        sendUnique = true
    }

    if (!sendChanged && !sendUnique) throw ''    
}

const sendNotifications = (vo) => {
    if (vo.monitoring.notifications.length == 0) {
        log.info(vo.data, 'Notifications not found')
    }
    (vo.monitoring.notifications || []).map(sendNotification(vo))
}


const sendNotification = (vo) => (notification) => getSenderStrategy(vo, notification).send({ ...vo, notification })

const getSenderStrategy = (vo, notification) => {
    let sender
    
    if (notification.email) {
        sender = senderEmail
        log.info(vo.data, 'Notification type identified [email]')
    } else if (notification.telegram) {
        sender = senderTelegram
        log.info(vo.data, 'Notification type identified [telegram]')
    } else if (notification.webhook) {
        sender = senderWebhook
        log.info(vo.data, 'Notification type identified [webhook]')
    } else if (notification.websocket) {
        sender = senderWebsocket
        log.info(vo.data, 'Notification type identified [websocket]')
    } else {
        const msg = 'Notification type not found'
        log.info(vo.data, msg)
        throw msg
    }

    return sender
}

module.exports = {
    startNotification
}