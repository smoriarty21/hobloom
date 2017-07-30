var Promise = require('bluebird');
var db = Promise.promisifyAll(require("./db"));

var temp_log_data = [];

function logSensorData(temp, humidity, appliances) {
    return new Promise(function(resolve, reject) {
        db.connect().
        then(function (db) {
            addDataToArray(temp, humidity);
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

function addDataToArray(temp, humidity) {
    temp_log_data.push({
        temp: temp,
        humidity: humidity
    });
}

function writeData(db) {
    if (temp_log_data.length % 500 > 0) {
        return;
    }
    var stmt = db.prepare("INSERT INTO temp_log (temperature, humidity, timestamp) VALUES (?,?,strftime('%s', 'now'))");
    for (var i = 0; i < temp_log_data.length; i++) {
        stmt.run([ temp_log_data[i].temp, temp_log_data[i].humidity ]);
    }
    stmt.finalize();
    db.close();
    temp_log_data = [];
}

module.exports = {
    logSensorData: logSensorData
};