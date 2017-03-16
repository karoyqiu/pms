'use strict';


var db = require('../lib/db');
var ObjectID = require('mongodb').ObjectID;


var ProductsModel = function () {
  this.db = db.db();
  this.page = 'products';
  this.subPage = 'list';
};


ProductsModel.prototype.__getCollection = function (callback) {
  this.db.collection('products', callback);
};


ProductsModel.prototype.count = function (query, callback) {
  this.__getCollection(function (err, col) {
    if (err) {
      callback(err);
    } else {
      if (typeof(query.deleted) === 'undefined') {
        query.deleted = false;
      };
      col.count(query, callback);
    }
  });
};


ProductsModel.prototype.findAll = function (query, skip, limit, sort, callback) {
  this.__getCollection(function (err, col) {
    if (err) {
      callback(err);
    } else {
      var options = {
        'skip': skip,
        'limit': limit,
        'sort': sort || [['addedAt', 'desc']]
      };

      if (typeof(query.deleted) === 'undefined') {
        query.deleted = false;
      }

      if (typeof(query.updatedAt) !== 'undefined' && !sort) {
        options.sort = [['updatedAt', 'desc'], ['addedAt', 'desc']];
      }

      col.find(query, options).toArray(callback);
    }
  });
};


ProductsModel.prototype.findById = function (id, callback) {
  this.__getCollection(function (err, col) {
    if (err) {
      callback(err);
    } else {
      var where = { _id: id, deleted: false };

      if (typeof(id) === 'string') {
        where._id = ObjectID.createFromHexString(id);
      }

      col.findOne(where, callback);
    }
  });
};


ProductsModel.prototype.find = function(cond, callback) {
  this.__getCollection(function (err, col) {
    if (err) {
      callback(err);
    } else {
      if (typeof(cond.deleted) === 'undefined') {
        cond.deleted = false;
      };

      col.find(cond).toArray(callback);
    }
  });
};


ProductsModel.prototype.nextProductNumber = function(cat, callback) {
  this.__getCollection(function (err, col) {
    if (err) {
      callback(err);
    } else {
      col.count({ category: cat }, callback);
    }
  });
};


ProductsModel.prototype.save = function (products, callback) {
  this.__getCollection(function (err, col) {
    if (err) {
      callback(err);
    } else {
      if (typeof(products.length) === 'undefined') {
        products = [ products ];
      }

      col.insert(products, { safe: true }, callback);
    }
  });
};


ProductsModel.prototype.updateById = function(id, product, callback) {
  this.__getCollection(function (err, col) {
    if (err) {
      callback(err);
    } else {
      var where = { _id: id };

      if (typeof(id) === 'string') {
        where._id = ObjectID.createFromHexString(id);
      }

      console.dir(product);
      col.update(where, product, callback);
    }
  });
};


ProductsModel.prototype.removeLogs = function(id, indexes, callback) {
  var that = this;
  indexes.sort(function (a, b) { return b - a;});

  this.__getCollection(function (err, col) {
    if (err) {
      callback(err);
    } else {
      that.findById(id, function (err, product) {
        for (var i = 0; i < indexes.length; i++) {
          product.logs.splice(indexes[i], 1);
        };

        that.updateById(id, { $set: { logs: product.logs } }, callback);
      });
    }
  });
};


ProductsModel.prototype.deleteById = function(id, callback) {
  this.updateById(id, { deleted: true }, callback);
};


module.exports = ProductsModel;
