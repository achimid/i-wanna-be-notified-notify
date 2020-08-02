const log = require('../logger/logger')
const Execution = require('../execution/execution-model')
const Monitoring = require('../monitoring/monitoring-model')
const Notification = require('./notification-model')

const senderEmail = require('../integration/email')
const senderTelegram = require('../integration/telegram')
const senderWebhook = require('../integration/webhook')
const senderWebsocket = require('../integration/websocket')

const startNotification = async (data) => {
    log.info(data, 'Starging notification')

    const execution = await Execution.findById(data.id).lean()
    const monitoring = await Monitoring.findById(data.monitoringId).lean()


    const notificationData = { 
        uuid: data.uuid,
        executionId: data.id, 
        monitoringId: data.monitoringId, 
        startTime: new Date()
    }

    const vo = { execution, monitoring, data, notificationData, saveNotification }

    try {
        // validate(vo)
        sendNotifications(vo)

        log.info(data, 'Notification sent')
    } catch (err) {
        log.info(data, 'Notification not sent', err)
    }

}

const saveNotification = (vo, notificationData) => {
    log.info(vo.data, 'Saving notification')

    const notification = new Notification(notificationData)
    notification.endTime = new Date()
    notification.save()

    log.info(vo.data, 'Notification saved')

    return notification.toJSON()
}

const validate = (vo) => {
    log.info(vo.data, 'Validating notification')

    if (!vo.execution) {
        throw 'Execution not found'
    }if (!vo.monitoring) {
        throw 'Monitoring not found'
    }


    if (!vo.execution.isSuccess) {
        throw 'Notification not send, execution not success'
    }

    let sendChanged = false
    let sendUnique = false
    let msg

    if (!vo.monitoring.options.notifyChange) {
        msg = 'Notification not send, notifyChange=false'
    } else if (!vo.execution.hashTargetChanged) {
        msg = 'Notification not send, notifyChange=true and hashTargetnot changed'
    } else {
        sendChanged = true
    }
    
    if (!vo.monitoring.options.notifyUniqueChange) {
        msg = 'Notification not send, notifyUniqueChange=false'
    } else if (!vo.execution.hashTargetUnique) {
        msg = 'Notification not send, notifyUniqueChange=true and hashTarget not unique'
    } else {
        sendUnique = true
    }

    if (!sendChanged && !sendUnique) {
        throw msg    
    }
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