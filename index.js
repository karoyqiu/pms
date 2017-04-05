'use strict';


var kraken = require('kraken-js'),
    app = {};
var flash = require('connect-flash');
var auth = require('./lib/auth');
var i18n = require('./lib/i18n');
var db = require('./lib/db');
var express = require('express');


app.configure = function configure(nconf, next) {
  // Async method run on startup.
  next(null);
};


app.requestStart = function requestStart(server) {
  // Run before most express middleware has been registered.
  server.locals.pretty = true;
  server.use(express.static('public'));
  server.use(flash());
};


app.requestBeforeRoute = function requestBeforeRoute(server) {
  // Run before any routes have been added.
  server.use(auth());
  server.use(i18n());
};


app.requestAfterRoute = function requestAfterRoute(server) {
  // Run after all routes have been added.
};


function startup () {
  if (require.main === module) {
    kraken.create(app).listen(function (err) {
      if (err) {
        console.error(err);
      }
    });
  }
}

module.exports = app;
db.connect(startup);
