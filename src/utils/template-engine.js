const format = require('pupa')

const convertObject = (obj) => {
    for (var k in obj) {
        if (Array.isArray(obj[k])) 
            obj[k] = Object.assign({}, obj[k])
        else if (typeof obj[k] == "object" && obj[k] !== null)
            convertObject(obj[k]);
    }
}

const templateFormat = (templateMessage, map) => {
    const valueMap = {...map}
    convertObject(valueMap)
    return format(templateMessage, valueMap)
}

module.exports = {
    templateFormat
}

