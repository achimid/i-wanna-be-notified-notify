process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const log = require('../logger/logger')
const fetch = require('node-fetch');

const call = (vo, endpoints, execution) => endpoints.map(edp => {
    log.info(vo.data, 'Sending webhook request to => ', edp)
    fetchApi(edp, execution)
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
    // log.info(vo.data, 'Error to send Webhook', error)
    log.info(vo.data, 'Error to send Webhook')

    const { notificationData, saveNotification } = vo
    
    notificationData.errorOnSendWebhook = error
    notificationData.isSuccess = false
    notificationData.type = 'webhook'

    saveNotification(vo, notificationData)
}

const fetchApi = (edp, execution) => {
    // TODO: Melhorar
    if (edp.method.toUpperCase() != 'GET' && edp.method.toUpperCase() != 'HEAD') {
        return fetch(edp.url, {
            method: edp.method.toUpperCase(),
            body: JSON.stringify(execution),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
    } else {
        var url = new URL(edp.url)
        Object.keys(execution).forEach(key => url.searchParams.append(key, execution[key]))
        return fetch(url)
    }
}


const send = (vo) => {
    const { notification, execution, data } = vo
    call(vo, notification.webhook, execution)
}


module.exports = {
    send
}
