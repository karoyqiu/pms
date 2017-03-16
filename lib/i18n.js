'use strict';


module.exports = function () {
  return function (req, res, next) {

    if (req.acceptedLanguages.length > 0) {
      res.locals.context = { locality: req.acceptedLanguages[0] };
    }

    next();
  };
};
