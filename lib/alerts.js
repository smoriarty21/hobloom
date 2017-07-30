var email = require('./email_utils');
var sms = require('./sms_utils');

function sendFireAlert(type) {
    switch (type) {
        case "email":
            var mail = new email();
            mail.setSubject('Fire Alert!');
            mail.setMessage('A fire has been detected in your grow room! Check home immediately!');
            mail.sendMessage();
            break;
        case "sms":
            var phone = new sms();
            phone.setMessage('A fire has been detected in your grow room! Check home immediately!');
            phone.sendMessage();
            break;
    }
}
module.exports = {
    sendFireAlert: sendFireAlert
};