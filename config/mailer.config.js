const nodemailer = require('nodemailer');
const env = require('./environment');

const transporter = nodemailer.createTransport({
    host: env.mailerHost,
    port: env.mailerPort,
    auth: {
        user: env.mailerUser,
        pass: env.mailerPassword
    }
});

/**
   {
        from: '', // sender address
        to: "", // list of receivers
        subject: "Hello ✔", // Subject line
        text: "Hello world?", // plain text body
        html: "<b>Hello world?</b>" // html body
    } mail 
 */

const sendMail = function(mail){
    return new Promise((resolve, reject) => {
        transporter
            .sendMail(mail)
            .then(info => resolve(info))
            .catch(err => reject(err));
    });
};
    
module.exports = { sendMail };