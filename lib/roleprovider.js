'use strict';

var db = require('./db');
var ObjectID = require('mongodb').ObjectID;


var RoleProvider = function () {
  this.db = db.db();
};


RoleProvider.prototype.__getCollection = function (callback) {
  this.db.collection('roles', callback);
};


RoleProvider.prototype.findAll = function (callback) {
  this.__getCollection(function (err, col) {
    if (err) {
      callback(err);
    } else {
      col.find().toArray(callback);
    }
  });
};


RoleProvider.prototype.findById = function (id, callback) {
  this.__getCollection(function (err, col) {
    if (err) {
      callback(err);
    } else {
      var where = { _id: id };

      if (typeof(id) === 'string') {
        where._id = ObjectID.createFromHexString(id);
      }

      col.findOne(where, callback);
    }
  });
};


RoleProvider.prototype.findByName = function (username, callback) {
  this.__getCollection(function (err, col) {
    if (err) {
      callback(err);
    } else {
      col.findOne({ name: username }, callback);
    }
  });
};


RoleProvider.prototype.save = function (roles, callback) {
  this.__getCollection(function (err, col) {
    if (err) {
      callback(err);
    } else {
      if (typeof(roles.length) === 'undefined') {
        roles = [ roles ];
      }

      col.insert(roles, function () {
        callback(null, roles);
      });
    }
  });
};


RoleProvider.prototype.updateById = function(id, role, callback) {
  this.__getCollection(function (err, col) {
    if (err) {
      callback(err);
    } else {
      var where = { _id: id };

      if (typeof(id) === 'string') {
        where._id = ObjectID.createFromHexString(id);
      }

      col.update(where, role, callback);
    }
  });
};


module.exports = RoleProvider;
