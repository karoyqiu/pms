'use strict';


var IndexModel = require('../models/index');
var UserProvider = require('../lib/userprovider');
var userProvider = new UserProvider();


module.exports = function (app) {
  app.get('/', function (req, res) {
    if (res.locals.user) {
      res.redirect('/products');
    } else {
      var model = new IndexModel();
      model.error = req.flash('error');
      res.render('index', model);
    }
  });


  app.get('/signout', function (req, res) {
    res.clearCookie('su');
    delete req.session.user;
    res.redirect('/');
  });


  app.post('/signin', function (req, res) {
    if (req.body.u && req.body.p) {
      userProvider.findByName(req.body.u, function (err, u) {
        console.error(err, u);
        if (err || u === null || u.password !== req.body.p) {
          req.flash('error', 'failed');
          res.redirect('/');
        } else if (u.password !== req.body.p) {
          console.error('Invalid password.');
          res.redirect('/');
        } else {
          var cookieOptions = {
            httpOnly: true,
            signed: true
          };

          if (req.body.r) {
            cookieOptions.maxAge = 2592000000;
          }

          var model = new IndexModel();
          model.redirect = '/products';

          res.cookie('su', u._id, cookieOptions);
          res.redirect('/products');
        }
      });
    } else {
      res.redirect('/');
    }
  });
};
