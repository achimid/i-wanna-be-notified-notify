const log = require('../logger/logger')
const Execution = require('../execution/execution-model')
const Monitoring = require('../monitoring/monitoring-model')
const Notification = require('./notification-model')
const Log = require('../logger/log-model')

const defaultTimeoutCleaningSeconds =  parseInt(process.env.DEFAULT_TIMEOUT_DATA_CLEANING_SECONDS) * 1000 * 60
const timeoutPoll = {}

const cleanTemporaryData = (vo) => {
    const { monitoring, data } = vo
    const { monitoringId } = data

    if (monitoring.options.temporary && vo.execution.isLast) {
        log.info(data, 'Cleaning data from temporary execution')

        if (timeoutPoll[monitoringId]) clearTimeout(timeoutPoll[monitoringId])
        timeoutPoll[monitoringId] = setTimeout(() => removeByUuid(data), defaultTimeoutCleaningSeconds)
    }
}

const removeByUuid = (data) => {
    log.info(data, 'Removing temporary uuid')
    try {
        const uuidMatch = { uuid: data.uuid }
        const { monitoringId } = data

        Execution.deleteMany(uuidMatch)
        Notification.deleteMany(uuidMatch)  
        Log.deleteMany(uuidMatch).catch(console.error)

        Monitoring.deleteOne({ _id: monitoringId })

    } catch (error) {
        log.info(data, 'Error on clean temporary data', error)
    }
}

module.exports = {
    cleanTemporaryData
}