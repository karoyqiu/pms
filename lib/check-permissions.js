'use strict';


module.exports = function (page, subPage, permissions) {
  return function (req, res, next) {
    var ok = true;

    if (req.session.user) {
      for (var p in permissions) {
        if (permissions.hasOwnProperty(p)) {
          if (req.session.user.permissions[p] !== permissions[p]) {
            ok = false;
            break;
          }
        }
      }
    } else {
      ok = false;
    }

    if (ok) {
      next();
    } else {
      var model = {
        page: page,
        subPage: subPage
      };

      res.status(401);
      res.render('errors/401', model);
    }
  };
};
