var config = require('../config/default.json');
var twilio = require('twilio');

function sms_utility() {
    this.config = config.twilio;
    this.sid = this.config.sid;
    this.token = this.config.token;
    this.from = this.config.from;
    this.to = this.config.to;
    this.message = '';
}

sms_utility.prototype.setMessage = function (message) {
    this.message = message;
}

sms_utility.prototype.sendMessage = function () {
    var accountSid = this.sid;
    var authToken = this.token;

    var client = new twilio.RestClient(accountSid, authToken);

    client.messages.create({
        body: this.message,
        to: this.to,
        from: this.from
    }, function(err, message) {
        if (err) {
            console.log('error');
            console.log(err);
            return;
        }
        console.log('Message sent');
        console.log(message.sid);
    });
}

module.exports = sms_utility;