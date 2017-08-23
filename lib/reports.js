var Promise = require('bluebird');
var db = require('./db');
var _ = require('underscore');
var time = require('time');

function getEnviromentReport() {
    return new Promise(function(resolve, reject) {
        db.connect().
        then(getData).
        then(sortEnviromentData).
        then(function (data) {
            resolve(data);
        }).
        catch(function (err) {
            db.close();
            reject(err);
        });
    });
}

function getData(db) {
    return new Promise(function(resolve, reject) {
        db.all("select * from temp_log ORDER BY timestamp DESC LIMIT 10;", function(err, rows) {
            if (err) {
                reject(err);
            }
            db.close();
            resolve(rows);
        });
    });
}

function sortEnviromentData(data) {
    return new Promise(function(resolve, reject) {
        if (typeof data == 'undefined' || !data.length) {
            reject('Undefined enviroment data passed to sortEnviromentData method');
        }
        var result = {
            humidity: [],
            temp: []
        };
        data.forEach(function (doc) {
            result.humidity.push(doc.humidity);
            result.temp.push(doc.temperature);
        });
        resolve(result);
    });
}

function timeConverter(UNIX_timestamp){
    var a = new time.Date(UNIX_timestamp * 1000);
    // TODO: Move to config
    a.setTimezone('America/New_York');
    return(a.toString());
}

function getFullStatusReport(appliances) {
    return new Promise(function(resolve, reject) {
        db.connect().
        then(function (db) {
            db.all('SELECT tl.*, al.asset_id, al.running from temp_log tl LEFT JOIN appliance_log al ON al.temp_log_id = tl.id ORDER BY timestamp DESC LIMIT ' + (appliances.length * 30)  + ';', function (err, rows) {
                db.close();
                var reducedData = {};
                if (typeof rows === 'undefined' || !rows.length) {
                    resolve({});
                    return;
                }
                for (var i = 0; i < rows.length; i++) {
                    if (!(rows[i].id in reducedData)) {
                        reducedData[rows[i].id] = {
                            'temperature': rows[i].temperature,
                            'humidity': rows[i].humidity,
                            'timestamp': timeConverter(rows[i].timestamp),
                            'appliances_on': [],
                            'appliances_off': []
                        };
                    }
                    var appliance = findAppliance(rows[i].asset_id, appliances);
                    if (appliance) {
                        if (rows[i].running == true) {
                            reducedData[rows[i].id]['appliances_on'].push(appliance.name);
                        } else {
                            reducedData[rows[i].id]['appliances_off'].push(appliance.name);
                        }
                    }
                }

                var dataArray = [];
                for (var key in reducedData) {
                    reducedData[key]['id'] = key;
                    reducedData[key]['appliances_on'] = reducedData[key]['appliances_on'].join();
                    reducedData[key]['appliances_off'] = reducedData[key]['appliances_off'].join();
                    dataArray.push(reducedData[key]);
                }
                resolve(dataArray);
            });
        }).
        catch(function (err) {
            reject(err);
        });
    });
}

function findAppliance(id, appliances) {
    return _.find(appliances, function (appliance) {
        return appliance.getId() === id;
    });
}

module.exports = {
    getEnviromentReport: getEnviromentReport,
    getFullStatusReport: getFullStatusReport
};