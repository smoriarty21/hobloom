var bs = require('bonescript');
var Promise = require('bluebird');
var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
var dht = require('beaglebone-dht');
var sensor_utils = require('./lib/sensor_utils');
var dl = require('./lib/data_logger');
var asset_utils = require('./lib/asset_utils');
var reports = require('./lib/reports.js');
var _ = require('underscore');
var alerts = require('./lib/alerts');
var sms = require('./lib/sms_utils');
var db = require('./lib/db');
var time = require('time');
var settings = require('./lib/settings');

// TODO: Move to asset utils
var sensors = [];
var appliances = [];

// TODO: Move to config
// TODO: Seriously why the fuck is this still here
var MIN_HUMIDITY = 0;
var MAX_HUMIDITY = 0;
var MIN_HEAT = 0;
var MAX_HEAT = 0;
var CONTROL_HUMIDITY = false;
var CONTROL_HEAT = false;

var currentCycle = null;
var DAY_START = "7:00:00";
var DAY_END = "24:00:00";

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// Assets
app.get('/asset', function (req, res) {
    if (!assetsExist()) {
        res.send({ status: 404, error: 'No Assets' });
        return;
    }
    res.send({ status: 200, data: { sensors: sensors, appliances: appliances }});
});

app.get('/asset/:assetId', function (req, res) {
    asset_utils.getAsset(req.params.assetId).
    then(function (asset) {
        if (typeof asset != 'undefined') {
            res.send({ status: 200, data: asset });
            return;
        }
        res.send({ status: 404, data: 'Asset Not Found' });
    }).
    catch(function (err) {
        console.log(err);
    });
});

app.post('/asset', function (req, res) {
    var pin = req.body.pin;
    var type = req.body.type;
    var name = req.body.name;
    asset_utils.createAsset(name, type, pin).
    then(updateAssets).
    then(function (data) {
        res.send({ status: 201, data: data});
    }).
    catch(function (err) {
        res.send({ status: 404, data: err});
        // TODO: Add me
        //res.send({ status: 409, data: "Conflict"});
    });
});

app.put('/asset/:assetId', function (req, res) {
    var pin = req.body.pin;
    var type = req.body.type;
    var name = req.body.name;
    asset_utils.updateAsset(req.params.assetId, type, pin, name).
    then(updateAssets).
    then(function (data) {
        res.send({ status: 200, data: data });
    }).
    catch(function (err) {
        console.log(err);
        res.send({ status: 404, data: 'Asset Not Found' });
    });
});

app.delete('/asset/:assetId', function (req, res) {
    asset_utils.deleteAsset(req.params.assetId).
    then(updateAssets).
    then(function (data) {
        res.send({ status: 200, data: data });
    }).
    catch(function (err) {
        console.log(err);
        res.send({ status: 500, data: err });
    });
});

// Sensors
app.post('/sensor', function (req, res) {
    var params = {
        'type': req.body.type,
        'pin': req.body.pin
    };

    sensor_utils.createSensor(params).
    then(function (data) {
        res.send({ status: 201, data: { id: data }});
    }).
    catch(function (err) {
        res.send({ status: 409, error: err });
    });
});

app.get('/sensor', function (req, res) {
    if (!sensors.length) {
        res.send({ status: 404, error: 'No Sensors' });
        return;
    }
    res.send({ status: 200, data: sensors });
});

// Appliances
app.get('/appliance', function (req, res) {
    if (!appliances.length) {
        res.send({ status: 404, error: 'No Appliances' });
        return;
    }
    res.send({ status: 200, data: appliances });
});

// Reports
app.get('/report', function (req, res) {
    reports.getFullStatusReport(appliances).
    then(function (data) {
        if (data === {}) {
            res.send({ status: 404, data: 'Data Not Found' });
        }
        res.send({ status: 200, data: data });
    }).
    catch(function (err) {
        console.log(err);
        res.send({ status: 500, data: err });
    });
});

app.get('/report/enviroment', function (req, res) {
    reports.getEnviromentReport().
    then(function (data) {
        res.send({ status: 200, data: data });
    });
});

// Settings
app.get('/settings', function (req, res) {
    settings.getSettings().
    then(function (settingsData) {
        if (typeof settingsData === 'undefined' || !settingsData.length) {
            res.send({ status: 404, data: 'Settings Not Found' });
            return;
        }
        res.send({ status: 200, data: settingsData });
    }).
    catch(function (err) {
        console.log(err);
    });
});

app.post('/settings', function (req, res) {
    var settingsObj = req.body.settings;
    db.connect().
    then(function (db) {
        settings.createSettings(db, settingsObj);
    }).
    then(function () {
        res.send({ status: 200, data: [] });
    }).
    catch(function (err) {
        res.send({ status: 500, data: [] });
        console.log(err);
    });
});

app.put('/settings', function (req, res) {
    var settingsObj = req.body.settings;
    db.connect().
    then(function (db) {
        settings.updateSettings(db, settingsObj);
    }).
    then(settings.getSettings).
    then(function (data) {
        updateSettingsVariables(data);
        res.send({ status: 200, data: data });
    }).
    catch(function (err) {
        res.send({ status: 500, data: [] });
        console.log(err);
    });
});

// Cycle
app.get('/cycle', function (req, res) {
    if (typeof currentCycle === 'undefined' || currentCycle === null) {
        res.send({ status: 404, data: 'Settings Not Found' });
        return;
    }
    res.send({ status: 200, data: { current_cycle: currentCycle } });
});

// TODO: move to asset utils
function assetsExist() {
    return sensors.length > 0 && appliances.length > 0;
}

function init() {
    return new Promise(function(resolve, reject) {
        asset_utils.getAllAssets().
        then(initAssets).
        then(settings.getSettings).
        then(updateSettingsVariables).
        then(function () {
            currentCycle = checkCycleTimes();
        }).
        then(Promise.resolve()).
        catch(function (e) {
            reject(e);
        });
    });
}

function initAssets(assets) {
    if (typeof assets == 'undefined') {
        return;
    }
    sensors = assets.sensors;
    assets.sensors.forEach(function (asset) {
        if (asset.getType() === 'dht11' || asset.getType() === 'dht22') {
            dht.sensor(asset.getType().toUpperCase());
            return;
        }
        if (asset.getType() == 'fire') {
            bs.pinMode(asset.getPin(), bs.INPUT);
        }
    });

    appliances = assets.appliances;
    assets.appliances.forEach(function (asset) {
        bs.pinMode(asset.getPin(), bs.OUTPUT);
        if (asset.type === 'light') {
            asset.turnOn();
            return;
        }
        asset.turnOff();
    });
}

function updateAssets(assets) {
    return new Promise(function(resolve, reject) {
        if (!assets) {
            reject('No Assets!');
            return;
        }
        sensors = assets.sensors;
        appliances = assets.appliances;
        resolve(assets);
    });
}

function startServer() {
    return new Promise(function(resolve, reject) {
        var server = app.listen(1337, function () {
            var host = server.address().address
            var port = server.address().port

            console.log("Server listening at http://%s:%s", host, port)
            resolve();
        });
    });
}

function updateLightsForCycle(cycle) {
    if (typeof appliances === 'undefined' || !appliances.length) {
        return;
    }
    for (var i = 0; i < appliances.length; i++) {
        if (appliances[i].type !== 'light') {
            continue;
        }
        switch (cycle) {
            case 'Day':
                if (!appliances[i].isRunning()) {
                    appliances[i].turnOn();
                }
                break;
            case 'Night':
                if (appliances[i].isRunning()) {
                    appliances[i].turnOff();
                }
                break;
        }
    }
}

function mainLoop() {
    currentCycle = checkCycleTimes();
    updateLightsForCycle(currentCycle);

    // TODO: should build out an interface for sensor that has a read method I can override based on the sensor type, this way here I can just loop through sensors and call the read method
    // Read temp
    var dht11 = getDHT();
    if (typeof dht11 == 'undefined' || dht11 == null) {
        return;
    }
    var dht_data = null;
    var tries = 0;
    var max_tries = 6;
    while (dht_data == null && tries <= max_tries) {
        dht_data = dht.read(dht11.getPin());
        if (typeof dht_data !== 'undefined') {
            dht_data.humidity = Math.floor(dht_data.humidity);
            dht11.setLastReading(dht_data);
            dht11.setLastReadingTime(new Date());
            var temp = Math.floor(dht_data.fahrenheit);
            dl.logSensorData(temp, Math.floor(dht_data.humidity), appliances).then(function () {
                checkEnviroment(dht_data.humidity, temp);
            });
            break;
        } else {
            tries++;
        }
    }
}

function checkCycleTimes() {
    var now = new time.Date();
    now.setTimezone("America/New_York");
    var timeNow = now.toLocaleTimeString();
    var timeAry = timeNow.split(':');
    var starAry = DAY_START.split(':');
    var endAry = DAY_END.split(':');

    if (parseInt(timeAry[0]) >= parseInt(starAry[0]) && parseInt(timeAry[0]) < parseInt(endAry[0])) {
        return 'Day'
    }
    return 'Night';
}

function fireSensorCheck() {
    // Read fire sensor
    var fireSensor = getFireSensor();

    var read = bs.digitalRead(fireSensor.getPin());
    if (read === 0) {
        //alerts.sendFireAlert('sms');
    }
}

function checkEnviroment(humidity, temp) {
    handleHumidityCheck(checkHumidity(humidity));
    handleHeatCheck(checkHeat(temp));
}

function checkHumidity(humidity) {
    /*
        0 = Humidity in range
        1 = Humidity too low
        2 = Humidity too high
    */
    if (humidity > MAX_HUMIDITY) {
        return 2;
    }
    if (humidity < getHumidifierOnTemp()) {
        return 1;
    }
    return 0;
}

function checkHeat(heat) {
    /*
     0 = Heat in range
     1 = Heat too low
     2 = Heat too high
     */
    if (heat > MAX_HEAT) {
        return 2;
    }
    if (heat < getHeaterOnTemp()) {
        return 1;
    }
    return 0;
}

function getHumidifierOnTemp() {
    return Math.ceil(MIN_HUMIDITY + ((MAX_HUMIDITY - MIN_HUMIDITY) / 5));
}

function getHeaterOnTemp() {
    return Math.ceil(MIN_HEAT + ((MAX_HEAT - MIN_HEAT) / 5));
}


function handleHeatCheck(temp_return) {
    if (!CONTROL_HEAT) {
        return;
    }
    switch (temp_return) {
        case 0:
            if (typeof getHeater() != 'undefined' && getHeater().isRunning()) {
                getHeater().turnOff();
            }
            if (typeof getAC() != 'undefined' && getAC().isRunning()) {
                getAC().turnOff();
            }
            break;
        case 1:
            if (typeof getHeater() != 'undefined' && !getHeater().isRunning()) {
                getHeater().turnOn();
            }
            if (typeof getAC() != 'undefined' && getAC().isRunning()) {
                getAC().turnOff();
            }
            break;
        case 2:
            if (typeof getHeater() != 'undefined' && getHeater().isRunning()) {
                getHeater().turnOff();
            }
            if (typeof getAC() != 'undefined' && !getAC().isRunning()) {
                getAC().turnOn();
            }
            break;
    }
}

function handleHumidityCheck(humidity_return) {
    if (!CONTROL_HUMIDITY) {
        return;
    }
    switch (humidity_return) {
        case 0:
            if (typeof getHumidifier() != 'undefined' && getHumidifier().isRunning()) {
                getHumidifier().turnOff();
            }
            if (typeof getExhaust() != 'undefined' && getExhaust().isRunning()) {
                getExhaust().turnOff();
            }
            if (typeof getDehumidifier() != 'undefined' && getDehumidifier().isRunning()) {
                getDehumidifier().turnOff();
            }
            break;
        case 1:
            if (typeof getHumidifier() != 'undefined' && !getHumidifier().isRunning()) {
                getHumidifier().turnOn();
            }
            if (typeof getExhaust() != 'undefined' && getExhaust().isRunning()) {
                getExhaust().turnOff();
            }
            break;
        case 2:
            if (typeof getHumidifier() != 'undefined' && getHumidifier().isRunning()) {
                getHumidifier().turnOff();
            }
            if (typeof getDehumidifier() != 'undefined' && !getDehumidifier().isRunning()) {
                getDehumidifier().turnOn();
            }
            if (typeof getExhaust() != 'undefined' && !getExhaust().isRunning()) {
                getExhaust().turnOn();
            }
            break;
    }
}


function getHumidifier() {
    return _.find(appliances, function (appliance) {
        return appliance.getType() === 'humidifier';
    });
}

function getDehumidifier() {
    return _.find(appliances, function (appliance) {
        return appliance.getType() === 'dehumidifier';
    });
}

function getExhaust() {
    return _.find(appliances, function (appliance) {
        return appliance.getType() === 'exhaust';
    });
}

function getIntake() {
    return _.find(appliances, function (appliance) {
        return appliance.getType() === 'intake';
    });
}

function getDHT() {
    return _.find(sensors, function (sensor) {
        return sensor.getType() === 'dht11' || sensor.getType() === 'dht22';
    });
}

function getFireSensor() {
    return _.find(sensors, function (sensor) {
        return sensor.getType() === 'fire';
    });
}

function getAC() {
    return _.find(appliances, function (sensor) {
        return sensor.getType() === 'ac';
    });
}

function getHeater() {
    return _.find(appliances, function (sensor) {
        return sensor.getType() === 'heater';
    });
}

function updateSettingsVariables(settings) {
    if (settings) {
        for (var i = 0; i < settings.length; i++) {
            if (settings[i].key === 'MAX_HUMIDITY') {
                MAX_HUMIDITY = parseInt(settings[i].value);
                continue;
            }
            if (settings[i].key === 'MIN_HUMIDITY') {
                MIN_HUMIDITY = parseInt(settings[i].value);
                continue;
            }
            if (settings[i].key === 'MAX_HEAT') {
                MAX_HEAT = parseInt(settings[i].value);
                continue;
            }
            if (settings[i].key === 'MIN_HEAT') {
                MIN_HEAT = parseInt(settings[i].value);
                continue;
            }
            if (settings[i].key === 'CONTROL_HUMIDITY') {
                CONTROL_HUMIDITY = settings[i].value;
                continue;
            }
            if (settings[i].key === 'CONTROL_HEAT') {
                CONTROL_HEAT = settings[i].value;
                continue;
            }

            if (settings[i].key === 'START_DAY') {
                DAY_START = translateTimeSetting(parseInt(settings[i].value));
                continue;
            }
            if (settings[i].key === 'END_DAY') {
                DAY_END = translateTimeSetting(parseInt(settings[i].value));
                continue;
            }
        }
    }
}

function translateTimeSetting(time) {
    if (time < 10) {
        time = "0" + time;
    }
    return time + ":00:00"
}

function logError(err) {
    console.log(err);
}

setInterval(function () { mainLoop(); }, 15*1000);
//setInterval(function () { fireSensorCheck(); }, 10*1000);

var initPromise = init();
var startServerPromise = startServer();

initPromise.
then(startServerPromise).
then(mainLoop).
catch(logError);