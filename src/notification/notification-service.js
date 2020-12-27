const log = require('../logger/logger')
const Execution = require('../execution/execution-model')
const Monitoring = require('../monitoring/monitoring-model')
const Notification = require('./notification-model')
const Log = require('../logger/log-model')

const { validate } = require('./notification-validator')
const { cleanTemporaryData } = require('./notification-cleaner')

const senderEmail = require('../integration/email')
const senderTelegram = require('../integration/telegram')
const senderWebhook = require('../integration/webhook')
const senderWebsocket = require('../integration/websocket')


const startNotification = async (data) => {
    log.info(data, 'Starting notification')
    data.startTime = new Date()

    let vo = { data }

    vo = await Promise.resolve(vo)
        .then(fetchDatabaseInformations)    
        .then(createNotificationDataAndFunction)
        .then(validate)
        .then(sendNotifications)
        .catch(err => log.info(data, '** Notification not sent **', err))

    cleanTemporaryData(vo)
}

const fetchDatabaseInformations = async (vo) => {

    const { id, uuid, monitoringId } = vo.data

    log.info(vo.data, 'Fetching database informations')
    const execution = await Execution.findByIdLean(id)
    const monitoring = await Monitoring.findByIdLean(monitoringId)
    const executions = await Execution.many(Model => Model.find({ uuid }).sort({ createdAt: 1 }).lean())
    const logs = await Log.find({ uuid }).lean()
    log.info(vo.data, 'Database informations fetched')

    return {...vo, execution, monitoring, executions, logs}
}

const createNotificationDataAndFunction = async (vo) => {
    const notificationData = { 
        uuid: vo.data.uuid,
        monitoringId: vo.data.monitoringId, 
        executionId: vo.data.id, 
        startTime: vo.data.startTime
    }

    const saveNotification = (vo, notificationData) => {
        log.info(vo.data, 'Saving notification')

        const notification = Notification.get(notificationData)
        notification.endTime = new Date()

        notification.save()
            .then(() => log.info(vo.data, `Notification [${notification.type}] saved`))
            .catch((err) => log.info(vo.data, `Error saving notification [${notification.type}]`, err))

        return notification.toJSON()
    }

    return { ...vo, notificationData, saveNotification }
}

const sendNotifications = (vo) => {
    vo.monitoring.notifications.map(sendNotification(vo))
    return vo
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