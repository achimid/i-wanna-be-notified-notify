const TelegramBot = require('node-telegram-bot-api')
const TelegramUserModel = require('./telegram-user-model')
const { templateFormat } = require('../utils/template-engine')

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true })

const telegramInit = () => {
    console.info('Iniciando eventos do telegram...')  
    
    bot.onText(/\/notify_all_start/, (msg) => {
        new TelegramUserModel(msg.chat).save()
            .then(() => console.log('Telegram-Chat cadastrado com sucesso'))
            .catch(() => console.info('Telegram-Chat já existe'))
    })

    bot.onText(/\/notify_all_stop/, (msg) => {
        TelegramUserModel.deleteOne({id: msg.chat.id})
            .then(() => console.log('Telegram-Chat removido com sucesso'))
            .catch(() => console.log('Erro ao remover Telegram-Chat'))
    })

    bot.onText(/\/(help|start)/, ({chat}) => {
        const comands = `
               /notify_all_start - Receber notificações sobre todos os lançamentos
            \n /notify_all_stop  - Parar de receber notificações sobre todos os lançamentos
        `.trim()
        bot.sendMessage(chat.id, comands)
    })

    // bot.onText(/^\/associate/, async (msg) => {
    //     const email = msg.text.replace('/associate', '').trim()
    //     const tUser = await TelegramChatModel.findOne({id: msg.chat.id})
    //     const isSuccess = await UserService.associateTelegramUser(email, tUser)
        
    //     if (isSuccess) {
    //         bot.sendMessage(msg.chat.id, "Telegram vinculado a sua conta de usuário com sucesso!")
    //     } else {
    //         bot.sendMessage(msg.chat.id, "Email não encontrado!")
    //     }
    // })
    
}

const notify = (chat, message) => {
    bot.sendMessage(chat.id, message, {parse_mode: "HTML", disable_web_page_preview: true})
}


const notifyAll = (message) => TelegramUserModel.find().lean().then(chats => chats.map(chat => notify(chat, message)))


const send = (vo) => {
    const { execution, monitoring, notification } = vo
    const { template } = notification  
  
    const message = templateFormat(template, {execution, monitoring})

    notifyAll(message)
}

module.exports = {
    send,
    telegramInit
}