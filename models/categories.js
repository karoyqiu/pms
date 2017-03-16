'use strict';

var db = require('../lib/db');
var ObjectID = require('mongodb').ObjectID;


var CategoriesModel = function () {
  this.db = db.db();
  this.page = 'products';
  this.subPage = 'categories';
};


CategoriesModel.prototype.__getCollection = function (callback) {
  this.db.collection('categories', callback);
};


CategoriesModel.prototype.findAll = function (callback) {
  this.__getCollection(function (err, col) {
    if (err) {
      callback(err);
    } else {
      col.find().toArray(callback);
    }
  });
};


CategoriesModel.prototype.findById = function (id, callback) {
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


CategoriesModel.prototype.find = function(cond, callback) {
  this.__getCollection(function(err, col) {
    if (err) {
      callback(err);
    } else {
      col.find(cond).toArray(callback);
    }
  });
};


CategoriesModel.prototype.findFromCode = function(s, callback) {
  this.findAll(function (err, all) {
    if (err) {
      callback(err);
    } else {
      var splitted = s.split('-', 2);

      for (var idx in all) {
        var c = all[idx];

        if (c.code === splitted[0]) {
          callback(null, { id: c._id, primary: c.code, sub: splitted[1] });
          return;
        }
      }

      callback(null, null);
    }
  });
};


CategoriesModel.prototype.categoryToName = function(cat, callback) {
  this.findById(cat.id, function (err, c) {
    if (err) {
      callback(err);
    } else if (!c) {
      callback(null, null);
    } else {
      var s = c.name + ' - ';

      for (var idx in c.subCategories) {
        var sub = c.subCategories[idx];

        if (sub.scode === cat.sub) {
          s += sub.sname;
          callback(null, s);
          return;
        }
      }

      callback(null, null);
    }
  });
};


CategoriesModel.prototype.save = function (cat, callback) {
  this.__getCollection(function (err, col) {
    if (err) {
      callback(err);
    } else {
      if (typeof(cat.length) === 'undefined') {
        cat = [ cat ];
      }

      console.dir(cat);

      col.insert(cat, function () {
        callback(null, cat);
      });
    }
  });
};


CategoriesModel.prototype.updateById = function(id, cat, callback) {
  this.__getCollection(function (err, col) {
    if (err) {
      callback(err);
    } else {
      var where = { _id: id };

      if (typeof(id) === 'string') {
        where._id = ObjectID.createFromHexString(id);
      }

      col.update(where, cat, callback);
    }
  });
};


CategoriesModel.prototype.updateNextNum = function(code, scode, nextNum, callback) {
  var that = this;
  this.__getCollection(function (err, col) {
    if (err) {
      callback(err);
    } else {
      col.find().toArray(function (err, all) {
        for (var idx in all) {
          var c = all[idx];
          if (c.code === code) {
            for (var i = 0; i < c.subCategories.length; i++) {
              var s = c.subCategories[i];
              if (s.scode === scode) {
                if (s.nextNum < nextNum) {
                  s.nextNum = nextNum;
                  that.updateById(c._id, c, callback);
                }

                callback(null, null);
                return;
              }
            };
          }
        }

        callback(null, null);
      });
    }
  });
};


module.exports = CategoriesModel;
