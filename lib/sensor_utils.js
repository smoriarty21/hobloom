var Promise = require('bluebird');
var mongo = require('./mongo_utils');

var getAllSensors = function () {
    return new Promise(function(resolve, reject) {
        mongo.connect().
            then(getAllSensorsFromDB).
            then(function (sensors) {
                resolve(sensors);
            }).
            catch(function (err) {
                reject(err); 
            });
    });
};

var getAllSensorsFromDB = function (db) {
    return new Promise(function(resolve, reject) {
        var sensors = [];
        var stream = db.collection('sensors').find().stream();
        stream.on('data', function(doc) {
            sensors.push(doc);
        });
        stream.on('error', function(err) {
            db.close();
            reject(err);
        });
        stream.on('end', function() {
            db.close();
            resolve(sensors);
        });
    });
};

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

module.exports = {
  getAllSensors: getAllSensors,
  createSensor: initCreateSensor
};