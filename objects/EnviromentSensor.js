var Sensor = require('../lib/sensor');
var dht = require('beaglebone-dht');
var util = require('util');

function EnviromentSensor(data) {
    Sensor.apply(this, arguments);
}

util.inherits(EnviromentSensor, Sensor);

EnviromentSensor.prototype.read = function () {
    var dht_data = null;
    var tries = 0;
    var max_tries = 6;
    while (dht_data == null && tries <= max_tries) {
        dht_data = dht.read(this.pin);
        if (typeof dht_data !== 'undefined') {
            dht_data.humidity = Math.floor(dht_data.humidity);
            dht_data.temp = Math.floor(dht_data.fahrenheit);
            return dht_data;
        } else {
            tries++;
        }
    }
};

module.exports = EnviromentSensor;