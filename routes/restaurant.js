const router = require('express').Router();
const passport = require('passport');
const passportConfig = require('../config/passport');
const User = require('../models/user');
const Gig = require('../models/gig');
const Restaurant = require('../models/restaurant');
const multer = require('multer');
const fs = require("fs");
const path = require("path");
const config = require('../config/secret');
//This is the temp directory to store the uploads files
const upload = multer({
  dest: __dirname + '/../temp'
});





router.get('/restaurants', function(req, res, next) {
  if (!req.user) return res.redirect('/login');

  Restaurant
    .find({})
    .exec(function(err, restaurants) {
      if (err) return next(err);
      res.render('restaurant/restaurants', {
        restaurants: restaurants,
        message: req.flash('restaurants')
      });
    });
});




router.get('/addrest', function(req, res, next) {
  if (!req.user) return res.redirect('/login');

  res.render('restaurant/addrest', {message: req.flash('addresterror'), restname: req.flash('addrestname'), restdesc: req.flash('addrestdir'), restdesc: req.flash('addrestdesc')});

});

router.post('/addrest', upload.single('picture'), function(req, res, next){
  if (!req.user) return res.redirect('/login');

  Restaurant.findOne({name: req.body.name}, function(err, restaurant){
    if(err) return next(err);
    if(restaurant){
      req.flash('addresterror', 'A restaurant with that name already exist');
      req.flash('addrestname', req.body.name);
      req.flash('addrestdir', req.body.dir);
      req.flash('addrestdesc', req.body.description);
      return res.redirect('/addrest');
    }else{
      var restaurant = new Restaurant();
      restaurant.name = req.body.name;
      restaurant.direction = req.body.dir;
      restaurant.description = req.body.description;
      if(req.file){

        var extension = path.extname(req.file.originalname).toLowerCase();

        if(extension != '.jpg')
        {
          req.flash('addresterror', 'Only JPG pictures are allowed');
          req.flash('addrestname', req.body.name);
          req.flash('addrestdir', req.body.dir);
          req.flash('addrestdesc', req.body.description);
          return res.redirect('/addrest');
        }else{
          const tempPath = req.file.path;
          const targetPath = path.join(__dirname, config.upload_file+"restaurant/"+restaurant._id+".jpg");
          const targetLocal = path.join(__dirname, "../public/images/uploads/restaurant/"+restaurant._id+".jpg");



          fs.copyFile(tempPath, targetPath, function(err){
            if(err) return next(err);
          });

          fs.copyFile(tempPath, targetLocal, function(err){
            if(err) return next(err);
          });





            restaurant.picture = restaurant._id+".jpg";
        }

      }
      restaurant.save(function(err){
        return res.redirect('/restaurants');
      });
    }
  });
});

router.get('/editrest/:id', function(req, res, next){
  if (!req.user) return res.redirect('/login');

    Restaurant.findById({ _id : req.params.id}).exec(function(err, restaurant){
      if(err) return next(err);
          res.render('restaurant/editrest', {message: req.flash('editresterror'), restedit: restaurant});
  });
});

router.post('/editrest/:id', upload.single('picture'), function(req, res, next){
  if (!req.user) return res.redirect('/login');

    Restaurant.findOne({ name : req.body.name}).exec(function(err, restaurant){
      if(err) return next(err);


      if(restaurant){
        if(restaurant._id != req.params.id){
          req.flash('editresterror', 'A restaurant with name '+ req.body.name +' already exist');
          return res.redirect('/editrest/'+ req.params.id);
        }
      }

      Restaurant.findOne({ _id : req.params.id}, function(err, restexist){
        restexist.name = req.body.name;
        restexist.direction = req.body.dir;
        restaurant.description = req.body.description;
        if(req.file){

          var extension = path.extname(req.file.originalname).toLowerCase();

          if(extension != '.jpg')
          {
            req.flash('editresterror', 'Only JPG pictures are allowed');
            return res.redirect('/editrest/'+ req.params.id);
          }else{
            const tempPath = req.file.path;
            const targetPath = path.join(__dirname, config.upload_file+"restaurant/"+restaurant._id+".jpg");
            const targetLocal = path.join(__dirname, "../public/images/uploads/restaurant/"+restaurant._id+".jpg");

            fs.copyFile(tempPath, targetPath, function(err){
              if(err) return next(err);
            });

            fs.copyFile(tempPath, targetLocal, function(err){
              if(err) return next(err);
            });
              restexist.picture = restexist._id+".jpg";
          }

        }

        restexist.save(function(err){
          if(err) return next(err);
          req.flash('restaurants', 'The restaurant have been updated');
          return res.redirect('/restaurants');
        });
      });

  });
});

router.delete('/delrestaurants/:id', function(req, res, next){
  if (!req.user) return res.redirect('/login');
    Restaurant.findById({_id : req.params.id}, function(err, restaurant){
        if(err) return next(err);
        restaurant.remove();
        req.flash('restaurants', 'The restaurant have been deleted');
        res.json({data: 'Deleted'});
    });
});

router.get('/disablerest/:id', function(req, res, next){
  if (!req.user) return res.redirect('/login');
    Restaurant.findById({_id : req.params.id}, function(err, restaurant){
      if(err) return next(err);
      var enabled = restaurant.enabled;
      restaurant.enabled = !enabled;
      restaurant.save(function(err){
        if(err) return next(err);
        req.flash('restaurants', 'The restaurant change the status, the disabled items will not appear on the web');
        return res.redirect('/restaurants');
      });
    })
});

module.exports = router;
