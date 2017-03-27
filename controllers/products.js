'use strict';

var async = require('async');
var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var moment = require('moment');
var querystring = require('querystring');
var ProductsModel = require('../models/products');
var CategoriesModel = require('../models/categories');
var checkPermissions = require('../lib/check-permissions');
var UserProvider = require('../lib/userprovider');

var userProvider = new UserProvider();


function __bodyToProduct (body) {
  var p = {
    status: parseInt(body.status, 10),
    pno: body.pno || undefined,
    locname: body.locname,
    engname: body.engname,
    cat: body.cat,
    keywords: body.keywords,
    provider: body.provider,
    cost: body.cost,
    color: body.color,
    weight: body.weight,
    size: body.size,
    actualWeight: body.actualWeight,
    actualSize: body.actualSize,
    notice: body.notice,
    //pictures: [],
    prices: JSON.parse(body.prices),
    providers: JSON.parse(body.providers),
    othersRefs: JSON.parse(body.ors),
    attribs: [],
    locattribs: [],
    locdesc: body.locdesc,
    engdesc: body.engdesc,
    comment: body.comment,
    deleted: false
  };

  var attribs = JSON.parse(body.attribs);

  for (var prop in attribs) {
    if (attribs.hasOwnProperty(prop)) {
      p.attribs.push({
        pkey: prop,
        pvalue: attribs[prop].loc,
        pengvalue: attribs[prop].eng
      });
    }
  }

  var locattribs = JSON.parse(body.locattribs);

  for (prop in locattribs) {
    if (locattribs.hasOwnProperty(prop)) {
      p.locattribs.push({
        pkey: prop,
        pvalue: locattribs[prop]
      });
    }
  }

  return p;
}


function __pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}


module.exports = function (app) {
  function __humanlizeCategory (product, callback) {
    var categoriesModel = new CategoriesModel();
    categoriesModel.categoryToName(product.category, function (err, s) {
      if (err) {
        callback(err);
      } else {
        product.category = s;
        callback();
      }
    });
  }


  function __humanlizeAddedBy (product, callback) {
    async.series([
      function (callback) {
        userProvider.findById(product.addedBy, function (err, u) {
          if (err) {
            callback(err);
          } else {
            product.addedBy = u;
            callback();
          }
        });
      },
      function (callback) {
        if (product.modifiedBy) {
          if (product.modifiedBy.length === 12 || product.modifiedBy.length === 24) {
            userProvider.findById(product.modifiedBy, function (err, u) {
              if (err) {
                callback(err);
              } else {
                product.modifiedBy = u;
                callback();
              }
            });
          } else {
            product.modifiedBy = product.addedBy;
            callback();
          }
        } else {
          callback(null);
        }
      },
      function (callback) {
        if (product.updatedBy) {
          userProvider.findById(product.updatedBy, function (err, u) {
            if (err) {
              callback(err);
            } else {
              product.updatedBy = u;
              callback();
            }
          });
        } else {
          callback(null);
        }
      },
      function (callback) {
        if (product.logs) {
          async.each(product.logs, function (l, c) {
            userProvider.findById(l.user, function (err, u) {
              if (err) {
                c(err);
              } else {
                l.user = u;
                c();
              }
            });
          }, callback);
        } else {
          callback(null);
        }
      }
    ], callback);
  }


  function __calcNextCatNumber (cat, callback) {
    async.each(cat.subCategories, function (subCat, subCallback) {
      if (typeof(subCat.nextNum) === 'undefined') {
        var model = new ProductsModel();
        model.nextProductNumber({ id: cat._id, sub: subCat.scode }, function (err, pno) {
          subCat.nextNum = pno;
          subCallback();
        });
      } else {
        subCallback();
      }
    }, function (err) {
      var categoriesModel = new CategoriesModel();
      categoriesModel.updateById(cat._id, cat, function (err, c) {
        callback();
      });
    });
  }


  function handleProductList (req, res) {
    var model = new ProductsModel();
    var categoriesModel = new CategoriesModel();
    var query = {};

    if (req.query.n) {
      query.locname = new RegExp('.*' + req.query.n + '.*', 'i');
    };

    if (req.query.c) {
      query.cat = req.query.c;
    };

    if (req.query.p) {
      query.pno = new RegExp('.*' + req.query.p + '.*', 'i');
    };

    if (req.query.t) {
      query.status = parseInt(req.query.t, 10);
    };

    if (req.query.b) {
      query.addedBy = req.query.b;
    };

    if (req.query.af || req.query.at) {
      var q = {};

      if (req.query.af) {
        var d = new Date;
        d.setTime(Date.parse(req.query.af));
        q['$gte'] = d;
      }

      if (req.query.at) {
        var d = new Date;
        d.setTime(Date.parse(req.query.at));
        d.setDate(d.getDate() + 1);
        q['$lt'] = d;
      }

      query.addedAt = q;
    }

    if (req.query._update) {
      model.subPage = 'recentnews';
      query.updatedAt = { $exists: true };
    } else {
      model.subPage = 'list';
    };

    var limit = req.query.l || 10;
    limit = parseInt(limit, 10);
    var skip = (req.query.s || 0) * limit;
    var sort = null;

    if (req.query.sort) {
      sort = [ req.query.sort.split(',') ];
    }

    model.count(query, function (err, count) {
      model.findAll(query, skip, limit, sort, function (err, products) {
        async.each(products, __humanlizeCategory, function (err) {
          async.each(products, __humanlizeAddedBy, function (err) {
            async.series({
                cats: categoriesModel.findAll.bind(categoriesModel),
                users: userProvider.findAll.bind(userProvider)
              }, function (err, results) {
                async.each(results.cats, __calcNextCatNumber, function(err) {
                  for (var i = 0; i < products.length; i++) {
                    if (products[i].addedAt) {
                      products[i].addedAt = moment(products[i].addedAt).lang(req.acceptedLanguages[0]).format('LL');
                    }
                  };

                  model.products = products;
                  model.categories = results.cats;
                  model.users = results.users;
                  model.pageCount = Math.floor((count + limit - 1) / limit) - 1;
                  model.currentPage = skip / limit;
                  model.totalPages = new Array(model.pageCount + 1);
                  model.limit = limit;
                  model.query = req.query;
                  model.sort = req.query.sort;
                  delete req.query.s;
                  delete req.query.l;
                  delete req.query.sort;
                  model.querystring = querystring.stringify(req.query);
                  res.render('products/products', model);
                });
              });
          });
        });
      });
    });
  }


  app.get('/products', function (req, res) {
    req.query._update = true;
    handleProductList(req, res);
  });


  app.get('/products/list', checkPermissions('products', 'list', {p_q_locname: true}), handleProductList);


  app.get('/products/add', checkPermissions('products', 'list', {p_a_locname: true}), function (req, res) {
    var model = new ProductsModel();
    var categoriesModel = new CategoriesModel();
    categoriesModel.findAll(function (err, cats) {
      model.action = 'add';
      model.categories = cats;
      model.product = {
        addedBy: req.session.user,
        addedAt: moment().lang(req.acceptedLanguages[0]).format('LLL')
      };
      delete model.error;
      res.render('products/product', model);
    });
  });


  function __renameImage (pic, callback) {
    if (pic && pic.size > 0) {
      var tempPath = pic.path;
      var ext = path.extname(pic.name);
      var newPath = __dirname + '/../public/images/';

      crypto.pseudoRandomBytes(16, function (err, pseudo) {
        var newName = pseudo.toString('hex');
        newPath += newName + ext;
        newPath = path.normalize(newPath);

        fs.rename(tempPath, newPath, function (err) {
          if (err) {
            console.dir(err);
            callback(err);
          } else {
            pic.newName = newName + ext;
            callback(null);
          }
        });
      });
    } else {
      pic.newName = null;
      callback();
    }
  }


  function __saveProduct (req, res, product) {
    var model = new ProductsModel();
    var categoriesModel = new CategoriesModel();
    categoriesModel.findFromCode(req.body.cat, function (err, cat) {
      var pno = product.pno.slice(-3);
      categoriesModel.updateNextNum(cat.primary, cat.sub, parseInt(pno, 10) + 1, function (err, c) {
        product.addedBy = req.session.user._id;
        product.modifiedAt = new Date();
        product.modifiedBy = product.addedBy;
        product.category = cat;

        model.save(product, function (err, p) {
          if (!res.sent) {
            res.redirect('/products/list');
            res.sent = true;
          }
        });
      });
    });
  }

  app.post('/products/add', checkPermissions('products', 'list', {p_a_locname: true}), function (req, res) {
    var model = new ProductsModel();
    var categoriesModel = new CategoriesModel();
    var product = __bodyToProduct(req.body);
    var primaryPic = req.files['primary-pic'];
    var keywordList = req.files['keyword-list'];
    var detailed = req.files['detailed-pic'];
    var packs = req.files['pic-packs'];

    if (typeof(detailed.length) === 'undefined') {
      detailed = [ detailed ];
    }

    if (typeof(keywordList.length) === 'undefined') {
      keywordList = [ keywordList ];
    }

    if (typeof(packs.length) === 'undefined') {
      packs = [ packs ];
    }

    var allFiles = [ primaryPic ];
    var klFrom = -1;
    var dFrom = -1;
    var pFrom = -1;

    if (keywordList && keywordList.length > 0) {
      klFrom = allFiles.length;
      allFiles = allFiles.concat(keywordList);
    };

    if (detailed && detailed.length > 0) {
      dFrom = allFiles.length;
      allFiles = allFiles.concat(detailed);
    };

    if (packs && packs.length > 0) {
      pFrom = allFiles.length;
      allFiles = allFiles.concat(packs);
    };

    async.eachSeries(allFiles, __renameImage, function (err) {
      if (err) {
        console.dir(err);
        res.redirect('/products/list');
      } else {
        product['primary-pic'] = allFiles[0].newName;
        product['keyword-list'] = [];

        product.addedAt = new Date();
        product.pictures = [];
        product.packs = [];

        if (klFrom >= 0) {
          for (var i = 0; i < keywordList.length; i++) {
            if (keywordList[i].name && keywordList[i].newName) {
              product['keyword-list'][i] = {
                displayName: keywordList[i].name,
                fileName: keywordList[i].newName
              };
            }
          };
        };

        if (dFrom >= 0) {
          for (var i = 0; i < detailed.length; i++) {
            if (detailed[i].name && detailed[i].newName) {
              product.pictures[i] = detailed[i].newName;
            }
          }
        }

        if (pFrom >= 0) {
          for (var i = 0; i < packs.length; i++) {
            if (packs[i].name && packs[i].newName) {
              product.packs[i] = {
                displayName: packs[i].name,
                fileName: packs[i].newName
              };
            }
          }
        }

        __saveProduct(req, res, product);
      }
    });
  });


  function __updateProduct (req, res, id, product, newLog) {
    var model = new ProductsModel();
    var categoriesModel = new CategoriesModel();
    categoriesModel.findFromCode(req.body.cat, function (err, cat) {
      product.category = cat;
      product.modifiedAt = new Date();
      product.modifiedBy = req.session.user._id;

      if (req.body._update && parseInt(req.body._update, 10) === 1) {
        product.updatedAt = product.modifiedAt;
        product.updatedBy = product.modifiedBy;
      }

      var p = { $set: product };

      if (newLog) {
        p.$push = newLog;
      };

      model.updateById(id, p, function (err, p) {
        var pno = product.pno.slice(-3);
        categoriesModel.updateNextNum(cat.primary, cat.sub, parseInt(pno, 10) + 1, function (err, c) {
          res.redirect('/products/list');
        });
      });
    });
  }

  app.get('/product/:id', checkPermissions('products', 'list', {p_q_locname: true}), function (req, res) {
    var model = new ProductsModel();
    var categoriesModel = new CategoriesModel();
    categoriesModel.findAll(function (err, cats) {
      model.findById(req.params.id, function (err, pro) {
        if (pro === null) {
          res.status(404);
          res.render('errors/404', model);
        } else {
          __humanlizeAddedBy(pro, function(err) {
            if (pro.addedAt) {
              pro.addedAt = moment(pro.addedAt).lang(req.acceptedLanguages[0]).format('LLL');
            }

            if (pro.modifiedAt) {
              pro.modifiedAt = moment(pro.modifiedAt).lang(req.acceptedLanguages[0]).format('LLL');
            }

            if (pro.updatedAt) {
              pro.updatedAt = moment(pro.updatedAt).lang(req.acceptedLanguages[0]).format('LLL');
            }

            if (pro.logs && pro.logs.length) {
              for (var i = 0; i < pro.logs.length; i++) {
                pro.logs[i].time = moment(pro.logs[i].time).lang(req.acceptedLanguages[0]).format('lll');
              }
            }

            model.action = 'modify';
            model.categories = cats;
            model.product = pro;
            model.user = req.session.user;

            delete model.error;
            res.render('products/product', model);
          });
        }
      });
    });
  });


  app.post('/products/modify', checkPermissions('products', 'list', {p_e_locname: true}), function (req, res) {
    var model = new ProductsModel();
    var categoriesModel = new CategoriesModel();
    var product = __bodyToProduct(req.body);
    var allFiles = [ req.files['primary-pic'] ];
    // var keywordList = req.files['keyword-list'];

    // if (typeof(keywordList.length) === 'undefined') {
    //   keywordList = [ keywordList ];
    // }

    // allFiles = allFiles.concat(keywordList);

    async.eachSeries(allFiles, __renameImage, function (err) {
      if (err) {
        console.dir(err);
        res.redirect('/products/list');
      } else {
        if (allFiles[0].newName) {
          product['primary-pic'] = allFiles[0].newName;
        }

        var newLog;

        if (req.body.log) {
          newLog = { logs: {
            time: new Date,
            user: req.session.user._id,
            log: req.body.log
          }};
        };

        req.body.removedLogs = JSON.parse(req.body.removedLogs);

        if (req.body.removedLogs.length > 0) {
          model.removeLogs(req.body.id, req.body.removedLogs, function() {
            __updateProduct(req, res, req.body.id, product, newLog);
          });
        } else {
          __updateProduct(req, res, req.body.id, product, newLog);
        }
      }
    });
  });


  app.get('/product/pictures/:id', checkPermissions('products', 'list', {p_q_locname: true}), function (req, res) {
    var model = new ProductsModel();
    model.findById(req.params.id, function (err, pro) {
      if (pro === null) {
        res.status(404);
        res.render('errors/404', model);
      } else {
        model.product = pro;
        delete model.action;
        delete model.categories;
        delete model.error;
        res.render('products/pictures', model);
      }
    });
  });


  app.post('/product/pic-packs/upload', checkPermissions('products', 'list', {p_e_locname: true}), function (req, res) {
    var model = new ProductsModel();
    var categoriesModel = new CategoriesModel();
    var pid = req.body.id;
    var pic = req.files['pic-packs'];

    if (typeof(pic.length) === 'undefined') {
      pic = [ pic ];
    }

    if (pic.length > 0) {
      async.eachSeries(pic, __renameImage, function (err) {
        if (err) {
          console.dir(err);
          res.redirect('/products/list');
        } else {
          model.findById(pid, function (err, pro) {
            if (pro === null) {
              res.status(404);
              res.render('errors/404', model);
            } else {
              var product = { packs: [] };

              if (pro.packs && pro.packs.length && pro.packs.length > 0) {
                product.packs = pro.packs;
              }

              for (var i = 0; i < pic.length; i++) {
                product.packs.push({
                  displayName: pic[i].name,
                  fileName: pic[i].newName
                });
              };

              model.updateById(req.body.id, {$set: product}, function(err, pro) {
                res.send(200);
              });
            }
          });
        }
      });
    } else {
      console.dir(pic);
      res.send(500);
    }
  });


  app.post('/product/keyword-list/upload', checkPermissions('products', 'list', {p_e_locname: true}), function (req, res) {
    var model = new ProductsModel();
    var categoriesModel = new CategoriesModel();
    var pid = req.body.id;
    var keywordList = req.files['keyword-list'];

    if (typeof(keywordList.length) === 'undefined') {
      keywordList = [ keywordList ];
    }

    if (keywordList.length > 0) {
      async.eachSeries(keywordList, __renameImage, function (err) {
        if (err) {
          console.dir(err);
          res.redirect('/products/list');
        } else {
          model.findById(pid, function (err, pro) {
            if (pro === null) {
              res.status(404);
              res.render('errors/404', model);
            } else {
              var product = { 'keyword-list': [] };

              if (pro['keyword-list'] && pro['keyword-list'].length && pro['keyword-list'].length > 0) {
                product['keyword-list'] = pro['keyword-list'];
              }

              for (var i = 0; i < keywordList.length; i++) {
                product['keyword-list'].push({
                  displayName: keywordList[i].name,
                  fileName: keywordList[i].newName
                });
              };

              model.updateById(req.body.id, {$set: product}, function(err, pro) {
                res.send(200);
              });
            }
          });
        }
      });
    } else {
      console.dir(pic);
      res.send(500);
    }
  });


  app.post('/product/pictures/upload', checkPermissions('products', 'list', {p_e_locname: true}), function (req, res) {
    var model = new ProductsModel();
    var categoriesModel = new CategoriesModel();
    var pid = req.body.id;
    var pic = req.files.pic;

    if (typeof(pic.length) === 'undefined') {
      pic = [ pic ];
    }

    if (pic && pic.length > 0) {
      async.eachSeries(pic, __renameImage, function (err) {
        if (err) {
          console.dir(err);
          res.redirect('/products/list');
        } else {
          model.findById(req.body.id, function (err, pro) {
            if (pro === null) {
              res.status(404);
              res.render('errors/404', model);
            } else {
              var product = { pictures: [] };

              if (pro.pictures && pro.pictures.length && pro.pictures.length > 0) {
                product.pictures = pro.pictures;
              }

              for (var i = 0; i < pic.length; i++) {
                product.pictures.push(pic[i].newName);
              };

              model.updateById(req.body.id, {$set: product}, function(err, pro) {
                res.redirect('/product/pictures/' + req.body.id);
              });
            }
          });
        }
      });
    } else {
    }
  });


  app.post('/product/pictures/remove', checkPermissions('products', 'list', {p_e_locname: true}), function (req, res) {
    var model = new ProductsModel();
    var categoriesModel = new CategoriesModel();
    var pid = req.body.id;
    var pic = req.body.picture;

    model.findById(req.body.id, function (err, pro) {
      if (pro === null) {
        res.status(404);
        res.render('errors/404', model);
      } else {
        var product = { pictures: pro.pictures };

        for (var i = 0; i < product.pictures.length; i++) {
          if (product.pictures[i] === pic) {
            fs.unlink(__dirname + '/../public/images/' + pic);
            product.pictures.splice(i, 1);
            break;
          }
        }

        model.updateById(req.body.id, { $set: product }, function(err, pro) {
          res.redirect('/product/pictures/' + req.body.id);
        });
      }
    });
  });


  app.get('/product/packs/remove', checkPermissions('products', 'list', {p_e_locname: true}), function (req, res) {
    var model = new ProductsModel();
    var categoriesModel = new CategoriesModel();
    model.findById(req.query.id, function (err, pro) {
      if (pro === null) {
        res.status(404);
        res.render('errors/404', model);
      } else {
        var product = { packs: pro.packs };

        for (var i = 0; i < product.packs.length; i++) {
          if (i === parseInt(req.query.pack, 10)) {
            fs.unlink(__dirname + '/../public/images/' + product.packs[i].fileName);
            product.packs.splice(i, 1);
            console.log('Splice ' + i);
            break;
          }
        }

        model.updateById(req.query.id, {$set: product}, function (err, pro) {
          res.redirect('/product/' + req.query.id);
        });
      }
    });
  });


  app.get('/product/keywordlist/remove', checkPermissions('products', 'list', {p_e_locname: true}), function (req, res) {
    var model = new ProductsModel();
    var categoriesModel = new CategoriesModel();
    model.findById(req.query.id, function (err, pro) {
      if (pro === null) {
        res.status(404);
        res.render('errors/404', model);
      } else {
        var product = { 'keyword-list': pro['keyword-list'] };

        for (var i = 0; i < product['keyword-list'].length; i++) {
          if (i === parseInt(req.query.pack, 10)) {
            fs.unlink(__dirname + '/../public/images/' + product['keyword-list'][i].fileName);
            product['keyword-list'].splice(i, 1);
            console.log('Splice ' + i);
            break;
          }
        }

        model.updateById(req.query.id, {$set: product}, function (err, pro) {
          res.redirect('/product/' + req.query.id);
        });
      }
    });
  });


  app.get('/products/delete/:id', function (req, res) {
    var model = new ProductsModel();
    model.deleteById(req.params.id, function (err, p) {
      res.redirect('/products/list');
    });
  });


  app.get('/products/pno/ok', function (req, res) {
    var model = new ProductsModel();
    model.find({ pno: req.query.pno }, function(err, p) {
      if (p.length === 0) {
        res.send(200);
      } else {
        res.send(500);
      }
    });
  });

  app.post('/products/export/basic', checkPermissions('products', 'list', {p_e_locname: true}), function (req, res) {
    var model = new ProductsModel();
    var ids = req.body.ids;
    model.exportBasicData(req.body.ids, function(err, workbook) {
      if (err) {
        res.send(500).send(err);
      } else {
        res.send(workbook);
      }
    });
  });
};
