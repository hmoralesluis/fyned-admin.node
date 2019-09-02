const router = require('express').Router();
const async = require('async');
// const Gig = require('../models/gig');
const User = require('../models/user');
const Rol = require('../models/rol');
const Cart = require('../models/cart');
const LovedGig = require('../models/lovedgig');
const LovedRestaurant = require('../models/lovedrestaurant');
// const Promocode = require('../models/promocode');


router.get('/usersadmin', function(req, res, next) {
  if (!req.user) return res.redirect('/login');
  Rol.findOne({code: 'admin'}, function(err, rol){
    if(err) return next(err);
    if(rol){
      User
        .find({rol: rol._id})
        .populate('rol')
        .exec(function(err, users) {
          if (err) return next(err);
          res.render('users/users', {
            users: users,
            message: req.flash('users')
          });
        });
    }
  });
});

router.get('/usersregular', function(req, res, next) {
  if (!req.user) return res.redirect('/login');
  Rol.findOne({code: 'regular'}, function(err, rol){
    if(err) return next(err);
    if(rol){
      User
        .find({rol: rol._id})
        .populate('rol')
        .exec(function(err, users) {
          if (err) return next(err);
          res.render('users/users', {
            users: users,
            message: req.flash('users')
          });
        });
    }
  });
});

// router.get('/usersreg', function(req, res, next) {
//   if (!req.user) return res.redirect('/login');
//   User
//     .find({})
//     .populate('rol')
//     .exec(function(err, users) {
//       if (err) return next(err);
//       res.render('users/users', {
//         users: users,
//         message: req.flash('users')
//       });
//     });
// });

router.get('/adduser', function(req, res, next) {
  if (!req.user) return res.redirect('/login');
  Rol.find({}, function(err, rolesexist){
    if(err) return next(err);
    res.render('users/adduser', {message: req.flash('addusererror'), username: req.flash('adduserusename'), email: req.flash('adduseremail'), roles: rolesexist});
  });

});

router.post('/adduser', function(req, res, next){
  if (!req.user) return res.redirect('/login');

    var username = req.body.username;
    var email = req.body.email;
    var password = req.body.password;
    var rol = req.body.rol;

    async.waterfall ([

        function(callback){
          Rol.findOne({code: rol}, function(err, rolexist){
              if(err) return next(err);
              callback(null, rolexist);
            });
          },

        function(rolexist){
        User.findOne({username: username}, function(err, user){
          if(err) return next(err);
          if(user){
            req.flash('addusererror', 'The username already exist');
            req.flash('adduserusename', username);
            req.flash('adduseremail', email);
            return res.redirect('/adduser');
          }else{
              User.findOne({email: email}, function(err, user){
                if(err) return next(err);
                if(user){
                  req.flash('addusererror', 'The email already exist');
                  req.flash('adduserusename', username);
                  req.flash('adduseremail', email);
                  return res.redirect('/adduser');
                }else{
                  var user = new User();
                  user.username = username;
                  user.email = email;
                  user.password = password;
                  user.rol = rolexist;
                  user.save();

                  cart = new Cart();
                  cart.owner = user._id;
                  cart.save();

                  lovedgig = new LovedGig();
                  lovedgig.owner = user._id;
                  lovedgig.save();

                  lovedrestaurant = new LovedRestaurant();
                  lovedrestaurant.owner = user._id;
                  lovedrestaurant.save();

                  if(rolexist.code == 'admin')
                    return res.redirect('/usersadmin');
                  if(rolexist.code == 'regular')
                    return res.redirect('/usersregular');  
                }
              });
            }
        });
      }
    ])
  });

  router.get('/edituser/:id', function(req, res, next){
    if (!req.user) return res.redirect('/login');

      User.findById({ _id : req.params.id}).populate('rol').exec(function(err, user){
        if(err) return next(err);
        Rol.find({}, function(err, rolesexist){
            res.render('users/edituser', {message: req.flash('editusererror'), useredit: user, roles: rolesexist});
        });
    });
  });

  router.post('/edituser/:id', function(req, res, next){
    if (!req.user) return res.redirect('/login');
      var userid = req.params.id;
      var username = req.body.username;
      var email = req.body.email;
      var password = req.body.password;
      var rol = req.body.rol;

      // res.json({message: rol});

      async.waterfall ([

          function(callback){
            Rol.findOne({code: rol}, function(err, rolexist){
                if(err) return next(err);
                callback(null, rolexist);
              });
            },

          function(rolexist){
          User.find({username: username}, function(err, usersusername){
            if(err) return next(err);
            var large = usersusername.length;
            for(var i = 0; i < large; i++){
                if(usersusername[0]._id != userid){
                  req.flash('editusererror', 'The username '+ username +' is in use');
                  return res.redirect('/edituser/'+userid);
                }
            }

            User.find({email: email}, function(err, usersemail){
              if(err) return next(err);
              var large = usersemail.length;
              for(var i = 0; i < large; i++){
                  if(usersemail[0]._id != userid){
                    req.flash('editusererror', 'The Email '+ email +' is in use');
                    return res.redirect('/edituser/'+userid);
                  }
              }

              User.findOne({_id: userid}, function(err, user){
                user.username = username;
                user.email = email;
                if(password != '')
                  user.password = password;
                user.rol = rolexist;
                user.save(function(err){
                  if(err) return next(err);
                  req.flash('users', 'The user have been updated');
                  if(rolexist.code == 'admin')
                    return res.redirect('/usersadmin');
                  if(rolexist.code == 'regular')
                    return res.redirect('/usersregular'); 
                });
              });
            });
          });
        }
      ])
    });

    router.delete('/delusers/:id', function(req, res, next){
      if (!req.user) return res.redirect('/login');
        User.findById({_id : req.params.id}, function(err, user){
            if(err) return next(err);
            Cart.findOne({owner: req.params.id}, function(err, item){
              if(err) return next(err);
              if(item){
                item.remove();
              }              
            });
            LovedGig.findOne({owner: req.params.id}, function(err, item){
              if(err) return next(err);
              if(item){
                item.remove();
              }              
            });
            LovedRestaurant.findOne({owner: req.params.id}, function(err, item){
              if(err) return next(err);
              if(item){
                item.remove();
              }              
            });
            user.remove();
            req.flash('users', 'The user have been deleted');
            res.json({data: 'Deleted'});
        });
    });


    router.get('/disableuser/:id', function(req, res, next){
      if (!req.user) return res.redirect('/login');
        User.findById({_id : req.params.id}, function(err, user){
          if(err) return next(err);
          var enabled = user.enabled;
          user.enabled = !enabled;
          user.save(function(err){
            if(err) return next(err);
            req.flash('users', 'The user change the status');
            return res.redirect('/users');
          });
        })
    });


    module.exports = router;
