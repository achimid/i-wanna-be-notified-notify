const log = require('../logger/logger')
const Execution = require('./execution-model')
const Monitoring = require('./monitoring-model')

const startNotification = async (data) => {
    log.info(data, 'Starging notification', data)

    const execution = await Execution.findById(data.id).lean()
    const monitoring = await Monitoring.findById(data.monitoringId).lean()

    sendNotification({ execution, monitoring })

    log.info(data, 'Notification sent')
}

const sendNotification = (vo) => {

}


module.exports = {
    startNotification
}