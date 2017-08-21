var Promise = require('bluebird');
var sqlite3 = require("sqlite3").verbose();
var config = require('../config/default.json');

function connect() {
    return new Promise(function(resolve, reject) {
        var dbFile = config.database;
        resolve(new sqlite3.Database(dbFile));
    });
};

module.exports = {
    connect: connect
};