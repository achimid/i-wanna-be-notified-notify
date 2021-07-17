const log = require('../utils/logger')

const validate = (vo) => {
    log.info(vo.data, 'Validating notification')

    if (!vo.execution) {
        throw 'Execution not found'
    }if (!vo.monitoring) {
        throw 'Monitoring not found'
    }

    if (!vo.monitoring.notifications || vo.monitoring.notifications.length == 0) {
        throw 'Notifications not found'
    }

    // if (!vo.execution.isSuccess) {
    //     throw 'Notification not send, execution not success'
    // }

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
        throw 'Notification not send, notifyChange=true and hashTarget not changed'
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

    return vo
}

module.exports = {
    validate
}