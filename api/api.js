var User = require('../models/user');
var Rol = require('../models/rol');
var router = require('express').Router();


router.get('/rol', function(req, res, next){

  var rol = new Rol();
  rol.code = 'admin';
  rol.name = 'Admin';

  Rol.findOne({code: 'admin'}, function(err, erol){
    if(err) return next(err);
    if(!erol){
      rol.save(function(err){
        if(err) return next(err);
        res.json({message: 'Rol admin created'});
      });
    }
  });
  

  var rol1 = new Rol();
  rol1.code = 'regular';
  rol1.name = 'Regular';

  Rol.findOne({code: 'regular'}, function(err, rol){
    if(err) return next(err);
    if(!rol){
      rol1.save(function(err){
        if(err) return next(err);
        res.json({message: 'Rol regular created'});
      });
    }
  });

  var rol2 = new Rol();
  rol2.code = 'repartidor';
  rol2.name = 'Repartidor';

  Rol.findOne({code: 'repartidor'}, function(err, rol){
    if(err) return next(err);
    if(!rol){
      rol2.save(function(err){
        if(err) return next(err);
        res.json({message: 'Rol repartidor created'});
      });
    }
  });

});


router.get('/user', function(req, res, next){

  Rol.findOne({code: 'admin'}, function(err, rol){
    if(err) return next(err);

    if(!rol) return res.json('No admin rol defined');

    var user = new User();
    user.email = 'admin@gmail.com';
    user.username = 'admin';
    user.password = 'admin';
    user.enabled = true;
    // user.name = 'Admin';
    // user.lastname = 'Super';
    user.rol = rol;

    user.save(function(err){
      if(err) return next(err);
      res.json({message: 'User created'});
    });

  });

});


module.exports = router;
