const log = require('../logger/logger')
const TelegramBot = require('node-telegram-bot-api')
const TelegramChat = require('./telegram-user-model')
const Monitoring = require('../monitoring/monitoring-model')
const { templateFormat } = require('../utils/template-engine')

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true })

const telegramInit = () => {
    console.info('Iniciando eventos do telegram...')  
    
    bot.onText(/\/notify_all_start/, (msg) => {
        new TelegramChat(msg.chat).save()
            .then(() => console.log('Telegram-Chat cadastrado com sucesso'))
            .catch(() => console.info('Telegram-Chat já existe'))
    })

    bot.onText(/\/notify_all_stop/, (msg) => {
        TelegramChat.deleteOne({id: msg.chat.id})
            .then(() => console.log('Telegram-Chat removido com sucesso'))
            .catch(() => console.log('Erro ao remover Telegram-Chat'))
    })

    bot.onText(/\/(help|start)/, ({chat}) => {
        bot.sendMessage(chat.id, "🤤 Bem vindo ao canal de notificações IWannaBeNotified Bot 🤓")
        setTimeout(() => bot.sendMessage(chat.id, "Neste canal você será o primeiro a saber quando os sites foram atualizados com novos lançamentos"), 2400)
        setTimeout(() => {
            Monitoring
                .find({disabled: {$ne: true}})
                .sort({name: 1})
                .lean()
                .then((list) => {
                    bot.sendMessage(chat.id, 
                        "Veja a lista de sites: \n" + list
                        .map(v => `<a href=\"${v.url}\"><b>-> ${v.name}</b></a>`)
                        .join('\n')
                    , {parse_mode: "HTML", disable_web_page_preview: true})
                })
            
        }, 7500)
        
        new TelegramChat(chat).save()
            .then(() => console.log('Telegram-Chat cadastrado com sucesso'))
            .catch(() => console.info('Telegram-Chat já existe'))

    })    
}

const notify = (chat, message) => {
    bot.sendMessage(chat.id, message, {parse_mode: "HTML", disable_web_page_preview: true})
}


const notifyAll = (message) => TelegramChat.find().lean().then(chats => chats.map(chat => notify(chat, message)))


const send = (vo) => {
    const { execution, executions, monitoring, notification } = vo
    const { notificationData, saveNotification } = vo
    const { template } = notification  
  
    const message = templateFormat(template, {execution, monitoring, executions})
    log.info(vo.data, 'Template message formatted', message)

    try {
        notifyAll(message)

        log.info(vo.data, 'Telegram sent with success')
    } catch (error) {
        notificationData.errorOnSendTelegram = error
        notificationData.isSuccess = false
        log.info(vo.data, 'Error sending telegram', error)
    }  
   
    notificationData.isSuccess = true
    saveNotification(vo, notificationData)
}

module.exports = {
    send,
    telegramInit
}