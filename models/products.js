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


ProductsModel.prototype.exportBasicData = function(ids, callback) {
  this.__getCollection(function (err, col) {
    if (err) {
      callback(err);
    } else {
      var objs = [];

      ids.forEach(function(id) {
        objs.push(ObjectID.createFromHexString(id));
      });

      var cursor = col.find({ _id: { $in: objs }});
      var sheet = { };
      var row = 1;

      sheet['A1'] = { t: 's', v: '*库存sku编号' };
      sheet['B1'] = { t: 's', v: '*库存sku名称' };
      sheet['C1'] = { t: 's', v: '库存sku英文名称' };
      sheet['D1'] = { t: 's', v: 'sku状态(自动创建、等待开发、正常销售)' };
      sheet['E1'] = { t: 's', v: '成本价' };
      sheet['F1'] = { t: 's', v: '售价' };
      sheet['G1'] = { t: 's', v: '商品目录' };
      sheet['H1'] = { t: 's', v: '申报品名(中文)' };
      sheet['I1'] = { t: 's', v: '申报品名(英文)' };
      sheet['J1'] = { t: 's', v: "商品自定义分类(多个用英文';'号隔开)" };
      sheet['K1'] = { t: 's', v: '商品仓库' };
      sheet['L1'] = { t: 's', v: '仓位' };
      sheet['M1'] = { t: 's', v: '仓库成本价' };
      sheet['N1'] = { t: 's', v: '库存' };
      sheet['O1'] = { t: 's', v: '商品重量' };
      sheet['P1'] = { t: 's', v: '供应商' };
      sheet['Q1'] = { t: 's', v: '上次采购价格' };
      sheet['R1'] = { t: 's', v: '最低采购价格' };
      sheet['S1'] = { t: 's', v: '销售员' };
      sheet['T1'] = { t: 's', v: '采购员' };
      sheet['U1'] = { t: 's', v: '采购天数' };
      sheet['V1'] = { t: 's', v: '最小采购数量' };
      sheet['W1'] = { t: 's', v: '最大采购数量' };
      sheet['X1'] = { t: 's', v: '库存警戒天数' };
      sheet['Y1'] = { t: 's', v: '警戒库存' };
      sheet['Z1'] = { t: 's', v: '配货员' };
      sheet['AA1'] = { t: 's', v: '包材' };
      sheet['AB1'] = { t: 's', v: '可包装个数' };
      sheet['AC1'] = { t: 's', v: '原厂SKU' };
      sheet['AD1'] = { t: 's', v: '是否带电池（0/1）' };
      sheet['AE1'] = { t: 's', v: '库存图片地址' };
      sheet['AF1'] = { t: 's', v: '备注' };
      sheet['AG1'] = { t: 's', v: "虚拟sku(多个用英文';'分割)" };

      cursor.each(function(err, pro) {
        if (pro) {
          pro.attribs.forEach(function(a) {
            row++;
            var cell = 'A' + row.toString();
            sheet[cell] = { t: 's', v: pro.pno + '-' + a.pkey };
            cell = 'B' + row.toString();
            sheet[cell] = { t: 's', v: a.pkey + ' ' + a.pvalue };
            cell = 'E' + row.toString();
            sheet[cell] = { t: 's', v: pro.providers[0].price };
            cell = 'M' + row.toString();
            sheet[cell] = { t: 's', v: pro.providers[0].price };
            cell = 'P' + row.toString();
            sheet[cell] = { t: 's', v: pro.providers[0].providerName };
            cell = 'AE' + row.toString();
            sheet[cell] = { t: 's', v: a.picurl };
            cell = 'AG' + row.toString();
            sheet[cell] = { t: 's', v: pro.pno + '-' + a.pkey + a.pengvalue };
          });
        } else {
          sheet['!ref'] = 'A1:AG' + row.toString();
          var workbook = {
            SheetNames: ['库存SKU导入模板'],
            Sheets: {
              '库存SKU导入模板': sheet
            }
          };

          //console.dir(workbook);
          callback(null, workbook);
        }
      });
    }
  });
};


ProductsModel.prototype.exportProviderData = function(ids, callback) {
  this.__getCollection(function (err, col) {
    if (err) {
      callback(err);
    } else {
      var objs = [];

      ids.forEach(function(id) {
        objs.push(ObjectID.createFromHexString(id));
      });

      var cursor = col.find({ _id: { $in: objs }});
      var sheet = { };
      var row = 1;

      sheet['A1'] = { t: 's', v: '*供应商' };
      sheet['B1'] = { t: 's', v: '*SKU' };
      sheet['C1'] = { t: 's', v: '最低采购价' };
      sheet['D1'] = { t: 's', v: '上次采购价' };
      sheet['E1'] = { t: 's', v: '商品网址' };

      cursor.each(function(err, pro) {
        if (pro) {
          pro.attribs.forEach(function(a) {
            pro.providers.forEach(function(p) {
              row++;
              var cell = 'A' + row.toString();
              sheet[cell] = { t: 's', v: p.providerName };
              cell = 'B' + row.toString();
              sheet[cell] = { t: 's', v: pro.pno + '-' + a.pkey };
              cell = 'C' + row.toString();
              sheet[cell] = { t: 's', v: p.price };
              cell = 'E' + row.toString();
              sheet[cell] = { t: 's', v: p.link };
            });
          });
        } else {
          sheet['!ref'] = 'A1:E' + row.toString();
          var workbook = {
            SheetNames: ['供应商关联SKU导出模板'],
            Sheets: {
              '供应商关联SKU导出模板': sheet
            }
          };

          //console.dir(workbook);
          callback(null, workbook);
        }
      });
    }
  });
};


module.exports = ProductsModel;
