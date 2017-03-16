'use strict';


var MongoClient = require('mongodb').MongoClient;
var db = null;


exports.connect = function (callback) {
  if (db === null) {
    MongoClient.connect('mongodb://localhost:27017/pms', function (err, database) {
      if (!err) {
        db = database;
        callback();
      }
    });
  }
};


exports.db = function () {
  return db;
};
