process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const log = require('../../logger/logger')
const fetch = require('node-fetch');

const call = (endpoints, execution, vo) => endpoints
    .map(edp => fetchApi(edp, execution)
        .then((data) => log.info(vo, 'Webhook sent with success', data))
        .catch((err) => log.info(vo, 'Error to send Webhook', err)))

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
    call(notification.webhook, execution, data)
}


module.exports = {
    send
}
