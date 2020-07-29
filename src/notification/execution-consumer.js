const queue = require("../utils/queue")
const service = require('./notification-service')

module.exports = async () => {
    console.info('Starging execution consumer')
    
    queue.consumeFromQueue("EXECUTION_COMPLETED", (message, ack) => {
        const data = JSON.parse(message.content.toString())
        service.startNotification(data)
    })

}
