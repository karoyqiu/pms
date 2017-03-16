'use strict';

var db = require('./db');
var ObjectID = require('mongodb').ObjectID;


var PermissionProvider = function () {
  this.db = db.db();
};
