const config = require('../config/database-config')
const mongoose = require('../config/mongoose-multi-db')

const schema = mongoose.Schema({
    id: { 
        type: Number, 
        required: true,
        unique: true
    },
    first_name: { 
        type: String, 
        required: true
    },
    last_name: { 
        type: String
    },
    username: { 
        type: String
    },
    is_bot: { 
        type: Boolean
    }
}, { versionKey: false, timestamps: true })

module.exports = mongoose.model('telegram-users', schema, config)