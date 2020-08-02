const queue = require("../utils/queue")
const service = require('../notification/notification-service')

module.exports = async () => {
    console.info('Starging execution consumer')
    
    queue.consumeFromQueue("EXECUTION_COMPLETED", (message) => {
        const data = JSON.parse(message.content.toString())
        service.startNotification(data)        
    })

}
