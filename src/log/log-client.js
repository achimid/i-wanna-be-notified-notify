const fetch = require('node-fetch')

const baseUrl = process.env.LOG_API_URL

const findByFilter = (filter) => {
    var url = new URL(`${baseUrl}/log`)
    Object.keys(filter).forEach(key => url.searchParams.append(key, filter[key]))
    return fetch(url).then(res => res.json())
}

const removeByUuid = (uuid) => fetch(`${baseUrl}/log/uuid/${uuid}`, { method: 'DELETE' })

module.exports = {
    findByFilter,
    removeByUuid
}