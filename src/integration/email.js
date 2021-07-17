const log = require('../utils/logger')
const nodemailer = require('nodemailer')
const { templateFormat } = require('../utils/template-engine')

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_LOGIN,
    pass: process.env.EMAIL_PASSWORD
  }
})


const getOptions = (emails, message) => ({
  from: 'notification@iwannabenotified.com',
  to: emails,
  subject: 'IWannaBeNotified - Notification',
  text: message
})


const mailLogger = (vo) => (error) => {
  const { notificationData, saveNotification } = vo
  
  if (error) {
    notificationData.errorOnSendEmail = error
    notificationData.isSuccess = false
    log.info(vo.data, 'Error sending e-mail', error)
  } else {
    notificationData.isSuccess = true
    log.info(vo.data, 'Email sent with success')
  }

  saveNotification(vo, notificationData)
}


const sendMail = async (vo, emailsDest, message) => {
  log.info(vo.data, 'Sending email')
  transporter.sendMail(getOptions(emailsDest, message), mailLogger(vo))
}

const send = (vo) => {
  const { execution, executions, monitoring, notification } = vo
  const { template, email } = notification  

  const message = templateFormat(template, { execution, monitoring, executions })  
  log.info(vo.data, 'Template message formatted', message)

  sendMail(vo, email, message)
}

module.exports = {
  send
}
