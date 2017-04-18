'use strict';


var UserProvider = require('../lib/userprovider');
var RoleProvider = require('../lib/roleprovider');
var ObjectID = require('mongodb').ObjectID;

var userProvider = null;
var roleProvider = null;


module.exports = function () {
  return function (req, res, next) {
    if (userProvider === null) {
      userProvider = new UserProvider();
    }

    if (roleProvider === null) {
      roleProvider = new RoleProvider();
    }

    if (req.url !== '/' && req.url !== '/signin' && !req.signedCookies.su) {
      console.log(req.url);
      console.log(req.signedCookies);
      res.redirect('/');
    } else {
      if (req.signedCookies.su) {
        if (req.session.user) {
          res.locals.user = req.session.user;
          next();
        } else {
          userProvider.findById(req.signedCookies.su, function (err, user) {
            user.permissions = {
              o_e_password: false,
              o_e_email: false,
              o_e_mobile: false,
              p_q_locname: false,
              p_q_engname: false,
              p_q_pricat: false,
              p_q_seccat: false,
              p_q_pripic: false,
              p_q_keywords: false,
              p_q_provider: false,
              p_q_price: false,
              p_q_color: false,
              p_q_weight: false,
              p_q_size: false,
              p_q_attrib: false,
              p_q_locdesc: false,
              p_q_engdesc: false,
              p_q_comment: false,
              p_q_cost: false,
              p_a_locname: false,
              p_a_engname: false,
              p_a_pricat: false,
              p_a_seccat: false,
              p_a_pripic: false,
              p_a_keywords: false,
              p_a_provider: false,
              p_a_price: false,
              p_a_color: false,
              p_a_weight: false,
              p_a_size: false,
              p_a_attrib: false,
              p_a_locdesc: false,
              p_a_engdesc: false,
              p_a_comment: false,
              p_e_locname: false,
              p_e_engname: false,
              p_e_pricat: false,
              p_e_seccat: false,
              p_e_pripic: false,
              p_e_keywords: false,
              p_e_provider: false,
              p_e_price: false,
              p_e_color: false,
              p_e_weight: false,
              p_e_size: false,
              p_e_attrib: false,
              p_e_locdesc: false,
              p_e_engdesc: false,
              p_e_comment: false,
              p_d: false,
              p_x: false,
              c_q_name: false,
              c_q_code: false,
              c_a_name: false,
              c_a_code: false,
              c_e_name: false,
              c_e_code: false,
              c_d: false,
              u_q_name: false,
              u_q_password: false,
              u_q_display: false,
              u_q_email: false,
              u_q_mobile: false,
              u_q_status: false,
              u_q_roles: false,
              u_a_name: false,
              u_a_password: false,
              u_a_display: false,
              u_a_email: false,
              u_a_mobile: false,
              u_a_status: false,
              u_a_roles: false,
              u_e_name: false,
              u_e_password: false,
              u_e_display: false,
              u_e_email: false,
              u_e_mobile: false,
              u_e_status: false,
              u_e_roles: false,
              u_d: false,
              r_q_name: false,
              r_q_status: false,
              r_q_members: false,
              r_q_bp: false,
              r_q_pp: false,
              r_q_cp: false,
              r_q_up: false,
              r_q_rp: false,
              r_a_name: false,
              r_a_status: false,
              r_a_members: false,
              r_a_bp: false,
              r_a_pp: false,
              r_a_cp: false,
              r_a_up: false,
              r_a_rp: false,
              r_e_name: false,
              r_e_status: false,
              r_e_members: false,
              r_e_bp: false,
              r_e_pp: false,
              r_e_cp: false,
              r_e_up: false,
              r_e_rp: false,
              r_d: false
            };

            roleProvider.findAll(function (err, allRoles) {
              for (var i in user.roles) {
                for (var j in allRoles) {
                  if (allRoles[j]._id.equals(user.roles[i])) {
                    for (var p in user.permissions) {
                      user.permissions[p] = user.permissions[p] || allRoles[j].permissions[p];
                    }
                  }
                }
              }

              req.session.user = user;
              res.locals.user = user;
              next();
            });
          });
        }
      } else {
        next();
      }
    }
  };
};
