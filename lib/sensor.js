var Asset = require('./asset');
var util = require('util');

function Sensor(data) {
    Asset.apply(this, arguments);
    this.last_reading_time = null;
    this.last_reading = null;
}

util.inherits(Sensor, Asset);

Sensor.prototype.getLastReadingTime = function () {
    return this.last_reading_time;
};

Sensor.prototype.setLastReadingTime = function (time) {
    this.last_reading_time = time;
};

Sensor.prototype.getLastReading = function () {
    return this.last_reading;
};

Sensor.prototype.setLastReading = function (reading) {
    this.last_reading = reading;
};

module.exports = Sensor;