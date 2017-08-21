var Promise = require('bluebird');
var config = require('../config/default.json');
var db = Promise.promisifyAll(require("./db"));

var temp_log_data = [];
var appliance_logs = [];

function logSensorData(temp, humidity, appliances) {
    return new Promise(function(resolve, reject) {
        db.connect().
        then(function (db) {
            addDataToArray(temp, humidity, appliances);
            return db;
        }).
        then(function (db) {
            writeData(db);
            resolve();
        }).
        catch(function (err) {
            reject(err);
        });
    });
}

function addDataToArray(temp, humidity, appliances) {
    temp_log_data.push({
        temp: temp,
        humidity: humidity,
        time: Date.now()
    });

    for (var i = 0; i < appliances.length; i++) {
        appliance_logs.push({
            appliance_id: appliances[i].getId(),
            running: appliances[i].isRunning(),
            time: Date.now()
        });
    }
}

function writeData(db) {
    if (temp_log_data.length % config.database_batch_size > 0) {
        return;
    }
    var stmt = db.prepare("INSERT INTO temp_log (temperature, humidity, timestamp) VALUES (?,?,?)");
    for (var i = 0; i < temp_log_data.length; i++) {
        stmt.run([ temp_log_data[i].temp, temp_log_data[i].humidity, temp_log_data[i].time ]);
    }
    stmt.finalize();

    var stmtAppliance = db.prepare("INSERT INTO appliance_log (appliance_id, running, time) VALUES (?,?,?)");
    for (var i = 0; i < appliance_logs.length; i++) {
        stmtAppliance.run([ appliance_logs[i].appliance_id, appliance_logs[i].running, appliance_logs[i].time ]);
    }
    stmtAppliance.finalize();

    db.close();
    temp_log_data = [];
    appliance_logs = [];
}

module.exports = {
    logSensorData: logSensorData
};