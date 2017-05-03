'use strict';


var AdminModel = require('../models/admin');
var RoleProvider = require('../lib/roleprovider');
var UserProvider = require('../lib/userprovider');

var roleProvider = null;
var userProvider = null;


function __onToBool (onOff) {
  return (onOff && onOff === 'on') || false;
}


function __bodyToRole (body) {
  return {
    name: body.rname,
    status: parseInt(body.status, 10),
    permissions: {
      o_e_password: __onToBool(body.o_e_password),
      o_e_email: __onToBool(body.o_e_email),
      o_e_mobile: __onToBool(body.o_e_mobile),
      p_q_locname: __onToBool(body.p_q_locname),
      p_q_engname: __onToBool(body.p_q_engname),
      p_q_pricat: __onToBool(body.p_q_pricat),
      p_q_seccat: __onToBool(body.p_q_seccat),
      p_q_pripic: __onToBool(body.p_q_pripic),
      p_q_keywords: __onToBool(body.p_q_keywords),
      p_q_provider: __onToBool(body.p_q_provider),
      p_q_cost: __onToBool(body.p_q_cost),
      p_q_price: __onToBool(body.p_q_price),
      p_q_color: __onToBool(body.p_q_color),
      p_q_weight: __onToBool(body.p_q_weight),
      p_q_size: __onToBool(body.p_q_size),
      p_q_attrib: __onToBool(body.p_q_attrib),
      p_q_locdesc: __onToBool(body.p_q_locdesc),
      p_q_engdesc: __onToBool(body.p_q_engdesc),
      p_q_comment: __onToBool(body.p_q_comment),
      p_a_locname: __onToBool(body.p_a_locname),
      p_a_engname: __onToBool(body.p_a_engname),
      p_a_pricat: __onToBool(body.p_a_pricat),
      p_a_seccat: __onToBool(body.p_a_seccat),
      p_a_pripic: __onToBool(body.p_a_pripic),
      p_a_keywords: __onToBool(body.p_a_keywords),
      p_a_provider: __onToBool(body.p_a_provider),
      p_a_price: __onToBool(body.p_a_price),
      p_a_color: __onToBool(body.p_a_color),
      p_a_weight: __onToBool(body.p_a_weight),
      p_a_size: __onToBool(body.p_a_size),
      p_a_attrib: __onToBool(body.p_a_attrib),
      p_a_locdesc: __onToBool(body.p_a_locdesc),
      p_a_engdesc: __onToBool(body.p_a_engdesc),
      p_a_comment: __onToBool(body.p_a_comment),
      p_e_locname: __onToBool(body.p_e_locname),
      p_e_engname: __onToBool(body.p_e_engname),
      p_e_pricat: __onToBool(body.p_e_pricat),
      p_e_seccat: __onToBool(body.p_e_seccat),
      p_e_pripic: __onToBool(body.p_e_pripic),
      p_e_keywords: __onToBool(body.p_e_keywords),
      p_e_provider: __onToBool(body.p_e_provider),
      p_e_price: __onToBool(body.p_e_price),
      p_e_color: __onToBool(body.p_e_color),
      p_e_weight: __onToBool(body.p_e_weight),
      p_e_size: __onToBool(body.p_e_size),
      p_e_attrib: __onToBool(body.p_e_attrib),
      p_e_locdesc: __onToBool(body.p_e_locdesc),
      p_e_engdesc: __onToBool(body.p_e_engdesc),
      p_e_comment: __onToBool(body.p_e_comment),
      p_d: __onToBool(body.p_d),
      p_x: __onToBool(body.p_x),
      p_x_providers: __onToBool(body.p_x_providers),
      p_x_desc: __onToBool(body.p_x_desc),
      c_q_name: __onToBool(body.c_q_name),
      c_q_code: __onToBool(body.c_q_code),
      c_a_name: __onToBool(body.c_a_name),
      c_a_code: __onToBool(body.c_a_code),
      c_e_name: __onToBool(body.c_e_name),
      c_e_code: __onToBool(body.c_e_code),
      c_d: __onToBool(body.c_d),
      u_q_name: __onToBool(body.u_q_name),
      u_q_password: __onToBool(body.u_q_password),
      u_q_display: __onToBool(body.u_q_display),
      u_q_email: __onToBool(body.u_q_email),
      u_q_mobile: __onToBool(body.u_q_mobile),
      u_q_status: __onToBool(body.u_q_status),
      u_q_roles: __onToBool(body.u_q_roles),
      u_a_name: __onToBool(body.u_a_name),
      u_a_password: __onToBool(body.u_a_password),
      u_a_display: __onToBool(body.u_a_display),
      u_a_email: __onToBool(body.u_a_email),
      u_a_mobile: __onToBool(body.u_a_mobile),
      u_a_status: __onToBool(body.u_a_status),
      u_a_roles: __onToBool(body.u_a_roles),
      u_e_name: __onToBool(body.u_e_name),
      u_e_password: __onToBool(body.u_e_password),
      u_e_display: __onToBool(body.u_e_display),
      u_e_email: __onToBool(body.u_e_email),
      u_e_mobile: __onToBool(body.u_e_mobile),
      u_e_status: __onToBool(body.u_e_status),
      u_e_roles: __onToBool(body.u_e_roles),
      u_d: __onToBool(body.u_d),
      r_q_name: __onToBool(body.r_q_name),
      r_q_status: __onToBool(body.r_q_status),
      r_q_members: __onToBool(body.r_q_members),
      r_q_bp: __onToBool(body.r_q_bp),
      r_q_pp: __onToBool(body.r_q_pp),
      r_q_cp: __onToBool(body.r_q_cp),
      r_q_up: __onToBool(body.r_q_up),
      r_q_rp: __onToBool(body.r_q_rp),
      r_a_name: __onToBool(body.r_a_name),
      r_a_status: __onToBool(body.r_a_status),
      r_a_members: __onToBool(body.r_a_members),
      r_a_bp: __onToBool(body.r_a_bp),
      r_a_pp: __onToBool(body.r_a_pp),
      r_a_cp: __onToBool(body.r_a_cp),
      r_a_up: __onToBool(body.r_a_up),
      r_a_rp: __onToBool(body.r_a_rp),
      r_e_name: __onToBool(body.r_e_name),
      r_e_status: __onToBool(body.r_e_status),
      r_e_members: __onToBool(body.r_e_members),
      r_e_bp: __onToBool(body.r_e_bp),
      r_e_pp: __onToBool(body.r_e_pp),
      r_e_cp: __onToBool(body.r_e_cp),
      r_e_up: __onToBool(body.r_e_up),
      r_e_rp: __onToBool(body.r_e_rp),
      r_d: __onToBool(body.r_d)
    }
  };
}


function __bodyToUser (body) {
  return {
    name: body.username,
    password: body.password,
    status: parseInt(body.status, 10),
    displayName: body.displayname,
    email: body.email,
    mobile: body.mobile,
    roles: JSON.parse(body.roles)
  };
}


function getRoleProvider () {
  if (roleProvider === null) {
    roleProvider = new RoleProvider();
  }

  return roleProvider;
}


function getUserProvider () {
  if (userProvider === null) {
    userProvider = new UserProvider();
  }

  return userProvider;
}


function checkPermissions (subPage, permissions) {
  return function (req, res, next) {
    var ok = true;

    if (req.session.user) {
      for (var p in permissions) {
        if (req.session.user.permissions[p] !== permissions[p]) {
          ok = false;
          break;
        }
      }
    } else {
      ok = false;
    }

    if (ok) {
      next();
    } else {
      var model = new AdminModel(subPage, 'Permission denied');
      res.status(401);
      res.render('errors/401', model);
    }
  };
}


module.exports = function (app) {
  app.get('/admin', function (req, res) {
    res.redirect('/admin/users');
  });


  app.get('/admin/roles', checkPermissions('roles', {r_q_name: true}), function (req, res) {
    var provider = getRoleProvider();
    provider.findAll(function (err, all) {
      if (err) {
        console.error(err);
      } else {
        var model = new AdminModel('roles', 'Roles');
        model.roles = all;

        model.roles.forEach(function (r) {
          r.memberCount = 0;
        });

        res.render('admin/roles', model);
      }
    });
  });


  app.get('/admin/role/:id', checkPermissions('roles', {r_q_name: true}), function (req, res) {
    var provider = getRoleProvider();
    provider.findById(req.params.id, function (err, role) {
      var model = new AdminModel('roles', 'Edit role');
      model.action = 'modify';
      model.role = role;
      res.render('admin/role', model);
    });
  });


  app.get('/admin/roles/add', checkPermissions('roles', {r_a_name: true}), function (req, res) {
    var model = new AdminModel('roles', 'Add role');
    model.action = 'add';
    res.render('admin/role', model);
  });


  app.post('/admin/roles/add', checkPermissions('roles', {r_a_name: true}), function (req, res) {
    var provider = getRoleProvider();

    if (req.body.action === 'add') {
      provider.save(__bodyToRole(req.body), function (err, roles) {
        res.redirect('/admin/roles');
      });
    } else{
      provider.updateById(req.body.id, __bodyToRole(req.body), function (err, roles) {
        res.redirect('/admin/roles');
      });
    }
  });


  app.get('/admin/users', checkPermissions('users', {u_q_name: true}), function (req, res) {
    var provider = getUserProvider();
    provider.findAll(function (err, all) {
      var model = new AdminModel('users', 'Users');
      model.users = all;
      res.render('admin/users', model);
    });
  });


  app.get('/admin/users/add', checkPermissions('users', {u_a_name: true}), function (req, res) {
    var provider = getRoleProvider();
    provider.findAll(function (err, all) {
      var model = new AdminModel('users', 'Add user');
      model.action = 'add';

      if (!err) {
        model.roles = all;

        all.forEach(function (e) {
          if (e.name === 'User') {
            model.selectedRoleIds = [ e._id ];
          }
        });
      }

      res.render('admin/user', model);
    });
  });


  app.post('/admin/users/add', checkPermissions('users', {u_a_name: true}), function (req, res) {
    var provider = getUserProvider();

    if (req.body.action === 'add') {
      provider.save(__bodyToUser(req.body), function (err, users) {
        res.redirect('/admin/users');
      });
    } else{
      provider.updateById(req.body.id, __bodyToUser(req.body), function (err, users) {
        res.redirect('/admin/users');
      });
    }
  });


  app.get('/admin/user/:id', checkPermissions('users', {u_q_name: true}), function (req, res) {
    var uprovider = getUserProvider();
    var rprovider = getRoleProvider();

    rprovider.findAll(function (err, allRoles) {
      uprovider.findById(req.params.id, function (err, user) {
        var model = new AdminModel('users', 'Edit user');
        model.action = 'modify';
        model.user = user;
        model.roles = allRoles;
        model.selectedRoleIds = user.roles;

        res.render('admin/user', model);
      });
    });
  });
};
