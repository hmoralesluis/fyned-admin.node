const router = require('express').Router();
const async = require('async');
const Gig = require('../models/gig');
const User = require('../models/user');
const Rol = require('../models/rol');
const Promocode = require('../models/promocode');


router.get('/users', function(req, res, next) {
  User
    .find({})
    .populate('rol')
    .exec(function(err, users) {
      if (err) return next(err);
      res.render('users/users', {
        users: users,
        message: req.flash('users')
      });
    });
});

router.get('/adduser', function(req, res, next) {
  Rol.find({}, function(err, rolesexist){
    if(err) return next(err);
    res.render('users/adduser', {message: req.flash('addusererror'), username: req.flash('adduserusename'), email: req.flash('adduseremail'), roles: rolesexist});
  });

});

router.post('/adduser', function(req, res, next){

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
                  return res.redirect('/users');
                }
              });
            }
        });
      }
    ])
  });

  router.get('/edituser/:id', function(req, res, next){

      User.findById({ _id : req.params.id}).populate('rol').exec(function(err, user){
        if(err) return next(err);
        Rol.find({}, function(err, rolesexist){
            res.render('users/edituser', {message: req.flash('editusererror'), useredit: user, roles: rolesexist});
        });
    });
  });

  router.post('/edituser/:id', function(req, res, next){



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
                  return res.redirect('/users');
                });
              });
            });
          });
        }
      ])
    });

    router.delete('/delusers/:id', function(req, res, next){
        User.findById({_id : req.params.id}, function(err, user){
            if(err) return next(err);
            user.remove();
            req.flash('users', 'The user have been deleted');
            res.json({data: 'Deleted'});
        });
    });


    router.get('/disableuser/:id', function(req, res, next){
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
