const nodemailer = require('nodemailer')
const { templateFormat } = require('../../utils/template-engine')

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


const mailLogger = (error, info) => {
  if (error) {
    console.error('Error sending e-mail', error);
  } else {
    console.log('Email sent: ' + info.response);
  }
}


const sendMail = async (emailsDest, message) => {
  const mailOptions = getOptions(emailsDest, message)
  transporter.sendMail(mailOptions, mailLogger)
}

const send = (vo) => {
  const { execution, monitoring, notification } = vo
  const { template, email } = notification  

  const message = templateFormat(template, {execution, monitoring})

  sendMail(email, message)
}

module.exports = {
  send
}
