'use strict';

var db = require('./db');
var ObjectID = require('mongodb').ObjectID;


var UserProvider = function () {
  this.db = db.db();
};


UserProvider.prototype.__getCollection = function (callback) {
  this.db.collection('users', callback);
};


UserProvider.prototype.findAll = function (callback) {
  this.__getCollection(function (err, col) {
    if (err) {
      callback(err);
    } else {
      col.find().toArray(callback);
    }
  });
};


UserProvider.prototype.findById = function (id, callback) {
  this.__getCollection(function (err, col) {
    if (err) {
      callback(err);
    } else {
      try {
        col.findOne({ _id: ObjectID.createFromHexString(id) }, callback);
      } catch (err) {
        callback(err);
      }
    }
  });
};


UserProvider.prototype.findByName = function (username, callback) {
  this.__getCollection(function (err, col) {
    if (err) {
      callback(err);
    } else {
      try {
        col.findOne({ name: username }, callback);
      } catch (err) {
        callback(err);
      }
    }
  });
};


UserProvider.prototype.save = function (users, callback) {
  this.__getCollection(function (err, col) {
    if (err) {
      callback(err);
    } else {
      if (typeof(users.length) === 'undefined') {
        users = [ users ];
      }

      users.forEach(function (u) {
        console.log(u.roles.length);
        for (var r in u.roles) {
          u.roles[r] = ObjectID.createFromHexString(u.roles[r]);
        }
      });

      console.dir(users);

      col.insert(users, function () {
        callback(null, users);
      });
    }
  });
};


UserProvider.prototype.updateById = function(id, user, callback) {
  this.__getCollection(function (err, col) {
    if (err) {
      callback(err);
    } else {
      for (var r in user.roles) {
        user.roles[r] = ObjectID.createFromHexString(user.roles[r]);
      }
      col.update({ _id: ObjectID.createFromHexString(id) }, user, callback);
    }
  });
};


module.exports = UserProvider;
