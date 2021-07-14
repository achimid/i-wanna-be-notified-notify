const queue = require("../utils/queue")
const service = require('../notification/notification-service')

module.exports = async () => {
    console.info('Starging execution consumer')
    
    queue.consumeFromQueue("EXECUTION_COMPLETED", (message) => {
        service.startNotification(JSON.parse(message.content.toString()))
    })

}
