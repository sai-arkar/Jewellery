const sgMail = require('@sendgrid/mail')
sgMail.setApiKey("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")

const msg = {
  to: 'iamsaiarkar@gmail.com', // Change to your recipient
  from: 'saiscript.digit@gmail.com', // Change to your verified sender
  subject: 'Sending with SendGrid is Fun',
  text: 'and easy to do anywhere, even with Node.js',
  html: '<strong>and easy to do anywhere, even with Node.js</strong>',
}

sgMail
  .send(msg)
  .then((response) => {
    console.log(response[0].statusCode)
    console.log(response[0].headers)
  })
  .catch((error) => {
    console.error(error)
  })



