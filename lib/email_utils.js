var nodemailer = require('nodemailer');
var config = require('../config/default.json');
var smtpTransport = require('nodemailer-smtp-transport');

function email_utility() {
    this.config = config.email;
    this.from = this.config.from;
    this.to = this.config.to;
    this.host = this.config.host;
    this.port = this.config.port;
    this.username = this.config.username;
    this.password = this.config.password;
    this.subject = '';
    this.message = '';
    
}

email_utility.prototype.setSubject = function (subject) {
    this.subject = subject;
}

email_utility.prototype.setMessage = function (message) {
    this.message = message;
}

email_utility.prototype.sendMessage = function () {
    var transporter = nodemailer.createTransport(smtpTransport({
        host: this.host,
        port: this.port,
        auth: {
            user: this.username,
            pass: this.password
        }
    }));
    transporter.sendMail({
        from: this.from,
        to: this.to,
        subject: this.subject,
        text: this.message
    }, function(error, response) {
        if (error) {
            console.log(error);
        } else {
            console.log('Message sent!');
        }
    });
}

module.exports = email_utility;