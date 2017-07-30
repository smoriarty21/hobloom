var Appliance = require('./appliance');
var util = require('util');

function Light(data) {
    Appliance.apply(this, arguments);
    this.on_time = null;
    this.off_time = null;
}

util.inherits(Light, Appliance);

module.exports = Light;
