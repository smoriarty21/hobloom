var Promise = require('bluebird');

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
  createSensor: initCreateSensor
};