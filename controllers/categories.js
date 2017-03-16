'use strict';

var CategoriesModel = require('../models/categories');
var checkPermissions = require('../lib/check-permissions');


function __bodyToCategory (body) {
  var category = {
    name: body.name,
    code: body.code,
    subCategories: []
  };

  var sub = JSON.parse(body.sub);
  console.dir(sub);

  for (var prop in sub) {
    if (sub.hasOwnProperty(prop)) {
      category.subCategories.push({
        scode: prop,
        sname: sub[prop]
      });
    }
  }

  return category;
}


module.exports = function (app) {
  var model = new CategoriesModel();

  app.get('/categories', checkPermissions('products', 'categories', {c_q_name: true}), function (req, res) {
    model.findAll(function (err, cats) {
      model.categories = cats;
      res.render('products/categories', model);
    });
  });


  app.get('/categories/add', checkPermissions('products', 'categories', {c_a_name: true}), function (req, res) {
    model.action = 'add';
    delete model.error;
    delete model.category;
    res.render('products/category', model);
  });


  app.post('/categories/add', checkPermissions('products', 'categories', {c_a_name: true}), function (req, res) {
    var cat = __bodyToCategory(req.body);

    model.find({code: cat.code}, function(err, cats) {
      if (cats.length === 0) {
        model.save(__bodyToCategory(req.body), function (err, cat) {
          res.redirect('/categories');
        });
      } else {
        model.error = 'alreadyExists';
        model.category = cats[0];
        res.render('products/category', model);
      }
    });
  });


  app.get('/category/:id', checkPermissions('products', 'categories', {c_e_name: true}), function (req, res) {
    model.findById(req.params.id, function (err, cat) {
      if (cat === null) {
        res.status(404);
        res.render('errors/404', model);
      } else {
        model.action = 'modify';
        model.category = cat;
        delete model.error;
        res.render('products/category', model);
      }
    });
  });


  app.post('/categories/modify', checkPermissions('products', 'categories', {c_e_name: true}), function (req, res) {
    model.updateById(req.body.id, __bodyToCategory(req.body), function (err, cats) {
      res.redirect('/categories');
    });
  });
};
