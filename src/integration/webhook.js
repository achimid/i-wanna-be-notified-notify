process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

const log = require('../logger/logger')
const fetch = require('node-fetch')

const call = (vo, endpoints, data) => endpoints.map(edp => {
    log.info(vo.data, 'Sending webhook request to => ', edp)
    fetchApi(edp, data)
        .then(onSucess(vo))
        .catch(onError(vo))
})

const onSucess = (vo) => () => {
    log.info(vo.data, 'Webhook sent with success')

    const { notificationData, saveNotification } = vo
  
    notificationData.isSuccess = true  
    notificationData.type = 'webhook'
  
    saveNotification(vo, notificationData)
}

const onError = (vo) => (error) => {
    log.info(vo.data, 'Error to send Webhook', error)

    const { notificationData, saveNotification } = vo
    
    notificationData.errorOnSendWebhook = error
    notificationData.isSuccess = false

    saveNotification(vo, notificationData)
}

const fetchApi = (edp, data) => {
    // TODO: Melhorar
    if (edp.method.toUpperCase() != 'GET' && edp.method.toUpperCase() != 'HEAD') {
        return fetch(edp.url, {
            method: edp.method.toUpperCase(),
            body: JSON.stringify(data),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
    } else {
        var url = new URL(edp.url)
        Object.keys(data).forEach(key => url.searchParams.append(key, data[key]))
        return fetch(url)
    }
}


const send = (vo) => {
    const { notification, execution, logs, monitoring } = vo
    call(vo, notification.webhook, { execution, monitoring, logs })
}


module.exports = {
    send
}
