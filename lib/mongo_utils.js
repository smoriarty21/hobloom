var Promise = require('bluebird');
var mongo = Promise.promisifyAll(require("mongodb").MongoClient);

var dbUrl = 'mongodb://localhost:27017/hobloom';

function connect() {
    return new Promise(function(resolve, reject) {
        mongo.connect(dbUrl).
        then(function (db) {
            resolve(db);
        }).
        catch(function (e) {
            reject(e);
        });
    });
};

function fetchAllFromCollection(collectionName) {
    return new Promise(function(resolve, reject) {
        mongo.connect(dbUrl).
        then(function (db) {
            db.collection(collectionName, function(err, collection) {
                var docs = [];
                var stream = collection.find({}).stream();
                stream.on('data', function(doc) {
                    docs.push(doc);
                });
                stream.on('error', function(err) {
                    reject(err);
                });
                stream.on('end', function() {
                    db.close();
                    resolve(docs);
                });
            });
        }).
        catch(function (err) {
            reject(err);
        });

    });
}

function fetchFromCollection(collectionName, query, sort) {
    return new Promise(function(resolve, reject) {
        mongo.connect(dbUrl).
        then(function (db) {
            db.collection(collectionName, function(err, collection) {
                var docs = [];
                var stream = collection.find(query).sort(sort).limit(30).stream();
                stream.on('data', function(doc) {
                    docs.push(doc);
                });
                stream.on('error', function(err) {
                    reject(err);
                });
                stream.on('end', function() {
                    db.close();
                    resolve(docs);
                });
            });
        }).
        catch(function (err) {
            console.log(err);
            reject(err);
        });

    });
}

module.exports = {
    connect: connect,
    fetchAllFromCollection: fetchAllFromCollection,
    fetchFromCollection: fetchFromCollection
};