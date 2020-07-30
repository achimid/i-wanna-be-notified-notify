const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_LOGIN,
    pass: process.env.EMAIL_PASSWORD
  }
});


const getOptions = (emails, message) => ({
  from: 'notifyme@gmail.com',
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
  const { monitoring } = vo
  const { template, email } = monitoring
  
  sendMail(email, template)
}

module.exports = {
  send
}
