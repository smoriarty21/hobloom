var Promise = require('bluebird');
var _ = require('underscore');
var FireSensor = require('../objects/FireSensor');
var EnviromentSensor = require('../objects/EnviromentSensor');

var all_sensors = [];

var initCreateSensor = function (params) {
    return new Promise(function(resolve, reject) {
        mongo.connect().
            then(function(db) {
                checkSensorPIN(params.pin, db).then(function (db) {
                    createSensor(params, db).
                        then(function (id) {
                            resolve(id); 
                        }).
                        catch(function (err) {
                            reject(err); 
                        });
               }).
               catch(function (err) {
                    reject(err); 
                });
            });
    });
}

var createSensor = function (params, db) {
    return new Promise(function(resolve, reject) {
        db.collection('sensors').insertOne(params, function(err, result) {
            if (err) { 
                reject(err); 
            }
            if (result.result.ok != 1) {
                reject('Data not inserted!');
            }
            resolve(result.insertedId);
        });
    });
};

var checkSensorPIN = function (pin, db) {
    return new Promise(function(resolve, reject) {
        var stream = db.collection('sensors').find({ pin: pin }).stream();
        stream.on('data', function(doc) {
            db.close();
            reject('PIN in use');
        });
        stream.on('error', function(err) {
            db.close();
            reject(err);
        });
        stream.on('end', function() {
            resolve(db);
        });
    });
}

function setupSensors(sensors) {
    all_sensors = sensors;
}

function updateEnviromentSensorInArray(sensor) {
    var index = -1;
    for (var i = 0; i < all_sensors.length; i++) {
        if (all_sensors[i].getId() == sensor.getId()) {
            index = i;
            break;
        }
    }

    if (index !== -1) {
        all_sensors[index] = sensor;
    }
}

function getFireSensor() {
    sensor = _.find(all_sensors, function (sensor) {
        return sensor.getType() === 'fire';
    });

    if (typeof sensor != 'undefined') {
        return new FireSensor(sensor);
    }
    return 'undefined';
}

function getDHT() {
    var all_dht = [];
    for (var i = 0; i < all_sensors.length; i++) {
        if (all_sensors[i].getType() === 'dht11' || all_sensors[i].getType() === 'dht22') {
            all_dht.push(new EnviromentSensor(all_sensors[i]));
        }
    }
    return all_dht;
}

function hasFireSensor() {
    return getFireSensor() != 'undefined';
}

function getAll() {
    return all_sensors;
}

module.exports = {
    getAllSensors: getAll,
    createSensor: initCreateSensor,
    setupSensors: setupSensors,
    getTempHumiditySensor: getDHT,
    hasFireSensor: hasFireSensor,
    getFireSensor: getFireSensor,
    updateEnviromentSensorInArray: updateEnviromentSensorInArray
};