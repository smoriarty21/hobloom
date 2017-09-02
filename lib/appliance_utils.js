var _ = require('underscore');
var bs = require('bonescript');
var Promise = require('bluebird');

var all_appliances = [];

function getHumidifier() {
    return _.find(all_appliances, function (appliance) {
        return appliance.getType() === 'humidifier';
    });
}

function getDehumidifier() {
    return _.find(all_appliances, function (appliance) {
        return appliance.getType() === 'dehumidifier';
    });
}

function getExhaust() {
    return _.find(all_appliances, function (appliance) {
        return appliance.getType() === 'exhaust';
    });
}

function getAC() {
    return _.find(all_appliances, function (sensor) {
        return sensor.getType() === 'ac';
    });
}

function getHeater() {
    return _.find(all_appliances, function (sensor) {
        return sensor.getType() === 'heater';
    });
}

function setAppliances(appliances) {
    all_appliances = appliances;
}

function initAppliances() {
    all_appliances.forEach(function (appliance) {
        bs.pinMode(appliance.getPin(), bs.OUTPUT);
        if (appliance.type === 'light') {
            appliance.turnOn();
            return;
        }
        appliance.turnOff();
    });
}

function getAll() {
    return all_appliances;
}

function getFarRedLights() {
    var far_reds = [];
    for (var i = 0; i < all_appliances.length; i++) {
        if (all_appliances[i].getType() == 'far_red_light') {
            far_reds.push(all_appliances[i]);
        }
    }
    return far_reds;
}

function getAppliancesByType(type) {
    var found_appliances = [];
    for (var i = 0; i < all_appliances.length; i++) {
        if (all_appliances[i].getType() == type) {
            found_appliances.push(all_appliances[i]);
        }
    }
    return found_appliances;
}

module.exports = {
    getAll: getAll,
    initAppliances: initAppliances,
    setAppliances: setAppliances,
    getHumidifier: getHumidifier,
    getDehumidifier: getDehumidifier,
    getExhaust: getExhaust,
    getAC: getAC,
    getHeater: getHeater,
    getFarRedLights: getFarRedLights,
    getAppliancesByType: getAppliancesByType
};