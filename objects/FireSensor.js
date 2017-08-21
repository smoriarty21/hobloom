var bs = require('bonescript');

function FireSensor(data) {
    this.id = data.id;
    this.type = 'fire';
    this.pin = data.pin;
    this.name = data.name;
}

FireSensor.prototype.getId = function () {
    return this.id;
};

FireSensor.prototype.setId = function (id) {
    this.id = id;
};

FireSensor.prototype.getType = function () {
    return this.type;
};

FireSensor.prototype.getPin = function () {
    return this.pin;
};

FireSensor.prototype.setPin = function (pin) {
    this.pin = pin;
};
FireSensor.prototype.getName = function () {
    return this.name;
};

FireSensor.prototype.setName = function (name) {
    this.pin = name;
};

FireSensor.prototype.read = function () {
    if (bs.digitalRead(this.pin) === 0) {
        return true;
    }
    return false;
};

module.exports = FireSensor;