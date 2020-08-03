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
    data.startTime = new Date()

    log.info(data, 'Fetching database informations')
    const execution = await Execution.findById(data.id).lean()
    const monitoring = await Monitoring.findById(data.monitoringId).lean()
    const executions = await Execution.find({ uuid: data.uuid }).sort({ createdAt: 1 }).lean()    
    log.info(data, 'Database informations fetched')

    const notificationData = { 
        uuid: data.uuid,
        executionId: data.id, 
        monitoringId: data.monitoringId, 
        startTime: new Date()
    }

    const vo = { execution, executions, monitoring, data, notificationData, saveNotification }

    try {
        validate(vo)
        sendNotifications(vo)

        log.info(data, 'Notification sent')
    } catch (err) {
        log.info(data, 'Notification not sent: ', err)
    }

}

const saveNotification = (vo, notificationData) => {
    log.info(vo.data, 'Saving notification')

    const notification = new Notification(notificationData)
    notification.endTime = new Date()
    notification.save()
        .then(() => log.info(vo.data, `Notification [${notification.type}] saved`))
        .catch((err) => log.info(vo.data, `Error saving notification [${notification.type}]`, err))

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
    let sendFilterMatch = false
    let msg

    if (vo.monitoring.filter && vo.monitoring.filter.length > 0  && !vo.execution.filterMatch) {
        throw 'Notification not send, filterMatch=false'
    } else {
        sendFilterMatch = true
    }

    if (!vo.monitoring.options.notifyChange) {
        msg = 'Notification validation ignored, notifyChange=false'
        sendChanged = true
    } else if (!vo.execution.hashTargetChanged) {
        throw 'Notification not send, notifyChange=true and hashTargetnot changed'
    } else {
        sendChanged = true
    }
    
    if (!vo.monitoring.options.notifyUniqueChange) {
        msg = 'Notification validation ignored, notifyUniqueChange=false'
        sendUnique = true
    } else if (!vo.execution.hashTargetUnique) {
        throw 'Notification not send, notifyUniqueChange=true and hashTarget not unique'
    } else {
        sendUnique = true
    }

    log.info(vo.data, 'Validation message: ' + msg)
    if ((!sendChanged && !sendUnique) || !sendFilterMatch) {
        throw msg    
    }
}

const sendNotifications = (vo) => {
    if (vo.monitoring.notifications.length == 0) {
        log.info(vo.data, 'Notifications not found')
    }
    (vo.monitoring.notifications || []).map(sendNotification(vo))
}


const sendNotification = (vo) => (notification) => {

    const sender = getSenderStrategy(vo, notification)

    if (notification.level != undefined && notification.level !== vo.execution.level) {
        const msg = `Notification ignored because of level selection. level=[${vo.execution.level}]`
        log.info(vo.data, msg)
        
        const { notificationData } = vo  
        notificationData.errorOnSendLevel = msg
        notificationData.isSuccess = false
        saveNotification(vo, notificationData)

        return vo
    }

    sender.send({ ...vo, notification })
}

const getSenderStrategy = (vo, notification) => {
    let sender
    
    if (notification.email && notification.email.length > 0) {
        vo.notificationData.type = 'email'
        sender = senderEmail
        log.info(vo.data, 'Notification type identified [email]')
    } else if (notification.telegram && notification.telegram.length > 0) {
        vo.notificationData.type = 'telegram'
        sender = senderTelegram
        log.info(vo.data, 'Notification type identified [telegram]')
    } else if (notification.webhook && notification.webhook.length > 0) {
        vo.notificationData.type = 'webhook'
        sender = senderWebhook
        log.info(vo.data, 'Notification type identified [webhook]')
    } else if (notification.websocket) {
        vo.notificationData.type = 'websocket'
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