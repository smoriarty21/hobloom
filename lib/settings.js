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
            if (err) {
                db.close();
                reject(err);
            }
            if (typeof rows === 'undefined' || !rows.length) {
                db.close();
                reject();
            }
            db.close();
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
        var stmt = db.prepare('UPDATE settings SET value = ? WHERE key = ?');
        for (var i = 0; i < settings.length; i++) {
            stmt.run([ String(settings[i].value), settings[i].key ]);
        }
        stmt.finalize();
        db.close();
        resolve();
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