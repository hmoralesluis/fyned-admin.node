var User = require('../models/user');
var Rol = require('../models/rol');
var router = require('express').Router();


router.get('/rol', function(req, res, next){

  var rol = new Rol();
  rol.code = 'admin';
  rol.name = 'admin';

  rol.save(function(err){
    if(err) return next(err);
    res.json({message: 'Rol created'});
  });
});


router.get('/user', function(req, res, next){

  Rol.findOne({name: 'admin'}, function(err, rol){
    if(err) return next(err);

    if(!rol) return res.json('No admin rol defined');

    var user = new User();
    user.email = 'admin@gmail.com';
    user.username = 'admin';
    user.password = 'admin';
    user.rol = rol;

    user.save(function(err){
      if(err) return next(err);
      res.json({message: 'User created'});
    });

  });

});


module.exports = router;
