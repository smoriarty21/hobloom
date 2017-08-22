var Promise = require('bluebird');
var Sensor = require('./sensor');
var Appliance = require('./appliance');
var db = require('./db');

function getAllAssets() {
    return new Promise(function(resolve, reject) {
        fetchAssetsFromDB().
        then(function (assets) {
            resolve(assets);
        }).
        catch(function (e) {
            reject(e);
        });
    });
}

function fetchAssetsFromDB() {
    return new Promise(function(resolve, reject) {
        db.connect().
        then(sortAssets).
        then(function (assets) {
            resolve(assets);
        }).
        catch(function(err) {
            reject(err);
        });
    });
}

function getAsset(id) {
    return new Promise(function(resolve, reject) {
        db.connect().
        then(function (db) {
            resolve(fetchAsset(db, id));
        }).
        then(function(data) {
            resolve(data);
        }).
        catch(function (err) {
            reject(err);
        });
    });
}

function runUpdateAsset(db, id, type, pin, name) {
    return new Promise(function(resolve, reject) {
        var query = "UPDATE assets SET type = ?, pin = ?, name = ? WHERE id = ? AND deleted = 0";
        var params = [ type, pin, name, id ];
        db.run(query, params, function (err) {
            if (err) {
                reject(err);
            }
            resolve(getAllAssets());
        });
    });
}

function updateAsset(id, type, pin, name) {
    return new Promise(function(resolve, reject) {
        db.connect().
        then(function (db) {
            runUpdateAsset(db, id, type, pin, name).
            then(function (assets) {
                resolve(assets);
            });
        }).
        catch(function(err) {
            reject(err);
        });
    });
}

function fetchAsset(db, id) {
    return new Promise(function(resolve, reject) {
        db.serialize(function() {
            db.all("SELECT id, name, type, pin FROM assets WHERE id=? AND deleted = 0 LIMIT 1", [ id ], function(err, rows) {
                if (err) {
                    reject(err);
                }
                db.close();
                resolve(rows[0]);
            });
        });
    });
}

function sortAssets(db) {
    return new Promise(function(resolve, reject) {
        var sensors = [];
        var appliances = [];
        db.serialize(function() {
            db.all("SELECT id, name, type, pin FROM assets WHERE deleted = 0;", function(err, rows) {
                if (err !== null) {
                    reject(err);
                }
                if (typeof rows == 'undefined') {
                    resolve({sensors: [], appliances: []});
                }
                rows.forEach(function (row) {
                    switch (row.type) {
                        case 'dht11':
                            var sensor = new Sensor(row);
                            sensors.push(sensor);
                            break;
                        case 'dht22':
                            var sensor = new Sensor(row);
                            sensors.push(sensor);
                            break;
                        case 'fire':
                            var sensor = new Sensor(row);
                            sensors.push(sensor);
                            break;
                        case 'soilmoisture':
                            var sensor = new Sensor(row);
                            sensors.push(sensor);
                        default:
                            // Appliance
                            var apl = new Appliance(row);
                            appliances.push(apl);
                    }
                });
                db.close();
                resolve({sensors: sensors, appliances: appliances});
            });
        });
    });
}

function deleteAsset(id) {
    return new Promise(function(resolve, reject) {
        db.connect().
        then(function (db) {
            db.serialize(function() {
                db.run("UPDATE assets SET deleted = 1 WHERE id = ?", [ id ], function(err) {
                    if (err) {
                        reject(err);
                    }
                    db.close();
                });
            });
        }).
        then(function() {
            resolve(getAllAssets());
        }).
        catch(function (err) {
            reject(err);
        });
    });
}

function createAsset(name, type, pin) {
    return new Promise(function(resolve, reject) {
        db.connect().
        then(function (db) {
            db.serialize(function() {
                db.run("INSERT INTO assets (name, type, pin) VALUES (?,?,?)", [ name, type, pin ], function(err) {
                    if (err) {
                        reject(err);
                    }
                    db.close();
                });
            });
        }).
        then(function() {
            resolve(getAllAssets());
        }).
        catch(function (err) {
            reject(err);
        });
    });
}

module.exports = {
    getAllAssets: getAllAssets,
    getAsset: getAsset,
    updateAsset: updateAsset,
    deleteAsset: deleteAsset,
    createAsset: createAsset
};