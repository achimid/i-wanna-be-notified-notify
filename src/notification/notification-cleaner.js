const log = require('../utils/logger')
const Execution = require('../execution/execution-model')
const Monitoring = require('../monitoring/monitoring-model')
const Notification = require('./notification-model')
const Log = require('../log/log-client')

const defaultTimeoutCleaningSeconds =  parseInt(process.env.DEFAULT_TIMEOUT_DATA_CLEANING_SECONDS) * 1000 * 60
const timeoutPoll = {}

const cleanTemporaryData = (vo) => {

    if (!vo || !vo.monitoring) return;
    
    const { monitoring, data } = vo
    const monitoringId = monitoring._id.toString()

    if (monitoring.options.temporary && vo.execution && vo.execution.isLast) {
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
        Log.removeByUuid(uuidMatch.uuid).catch(console.error)

        Monitoring.deleteOne({ _id: monitoringId })

    } catch (error) {
        log.info(data, 'Error on clean temporary data', error)
    }
}

const fetchAllTemporaryData = () => {

    const todayMinusDaysTemporaryData =  new Date()
    todayMinusDaysTemporaryData.setDate(todayMinusDaysTemporaryData.getDate() - 1) // 1 dias para dados temporários

    const todayMinusDays =  new Date()
    todayMinusDays.setDate(todayMinusDays.getDate() - 7) // 7 dias para dados normais

    const query = { $or: [
            { options: { temporary: true }, updatedAt: { $lte: todayMinusDaysTemporaryData }},
            { updatedAt: { $lte: todayMinusDays }}
        ]}
    

    Execution.find(query).then(exeuctionsTmps => exeuctionsTmps.map(removeByUuid))
}

const jobToRemoveTemporaryData = () => {
    fetchAllTemporaryData()
    setInterval(fetchAllTemporaryData, 3 * 100 * 60 ) // 3 minutos 
}

jobToRemoveTemporaryData()

module.exports = {
    cleanTemporaryData
}