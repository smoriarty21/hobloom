var bs = require('bonescript');
var Asset = require('./asset');
var util = require('util');

function Appliance(data) {
    Asset.apply(this, arguments);
    this.running = false;
}

util.inherits(Appliance, Asset);

Appliance.prototype.turnOn = function () {
    this.running = true;
    bs.digitalWrite(this.pin, bs.LOW);
};

Appliance.prototype.turnOff = function () {
    this.running = false;
    bs.digitalWrite(this.pin, bs.HIGH);
};

Appliance.prototype.isRunning = function () {
    return this.running === true;
};

module.exports = Appliance;