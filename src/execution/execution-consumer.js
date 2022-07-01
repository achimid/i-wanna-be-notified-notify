const { consumeFromQueue } = require("../utils/queue")
const service = require('../notification/notification-service')

module.exports = async () => {
    console.info('Starging execution consumer')

    consumeFromQueue("EXECUTION_COMPLETED", service.startNotification , 1, true)    
}
