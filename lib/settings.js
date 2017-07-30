var db = require('./db');

function getSettings() {
    return new Promise(function(resolve, reject) {
        db.connect().
        then(queryAllSettings).
        then(function (rows) {
            resolve(rows);
        }).
        catch(function (err) {
            reject(err);
        });
    });
}

function queryAllSettings(db) {
    return new Promise(function(resolve, reject) {
        db.all('SELECT key, value FROM settings', function (err, rows) {
            /*db.close();*/
            if (err) {
                reject(err);
            }
            if (typeof rows === 'undefined' || !rows.length) {
                reject();
            }
            resolve(rows);
        });
    });
}

function createSettings(db, settings) {
    return new Promise(function(resolve, reject) {
        for (var i = 0; i < settings.length; i++) {
            createSetting(db, settings[i].key, settings[i].value).
            catch(function (err) {
                reject(err);
            });
        }
        resolve();
    });
}

function createSetting(db, key, value) {
    return new Promise(function(resolve, reject) {
        db.run('INSERT INTO settings (value, key) VALUES (?, ?);', [ value, key ], function (err) {
            if (err)  {
                reject(err);
            }
            this.getSettings().
            then(function (data) {
                resolve(data);
            });
        });
    });
}

function updateSettings(db, settings) {
    return new Promise(function(resolve, reject) {
        for (var i = 0; i < settings.length; i++) {
            updateSetting(db, settings[i].key, settings[i].value).
            catch(function (err) {
                reject(err);
            });
        }
        resolve();
    });
}

function updateSetting(db, key, value) {
    return new Promise(function(resolve, reject) {
        db.run('UPDATE settings SET value = ? WHERE key = ?', [ value, key ], function (err) {
            if (err)  {
                console.log('ERROR: ' + err);
                reject(err);
            }
            resolve();
        });
    });
}

function deleteSettings(db, settings) {

}

module.exports = {
    getSettings: getSettings,
    createSettings: createSettings,
    deleteSettings: deleteSettings,
    updateSettings: updateSettings
};