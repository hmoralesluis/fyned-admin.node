const router = require('express').Router();
const passport = require('passport');
const passportConfig = require('../config/passport');
const User = require('../models/user');
const Gig = require('../models/gig');
const Category = require('../models/category');
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
    .populate('category')
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

  Category.find({}, function(err, categories){
    if(err) return next(err);
    res.render('restaurant/addrest', {message: req.flash('addresterror'), restname: req.flash('addrestname'), restcategory: req.flash('addrestcategory'), restdir: req.flash('addrestdir'), restlabel: req.flash('addrestlabel'), restdesc: req.flash('addrestdesc'),restlat: req.flash('addrestlat'),restlng: req.flash('addrestlng'), categories: categories});
  });

});

// router.post('/addrest', upload.single('picture'), function(req, res, next){
  // router.post('/addrest', upload.array('picture', 2), function(req, res, next){
router.post('/addrest', upload.any(), function(req, res, next){
  if (!req.user) return res.redirect('/login');

  Restaurant.findOne({name: req.body.name}, function(err, restaurant){
    if(err) return next(err);
    if(restaurant){
      req.flash('addresterror', 'A restaurant with that name already exist');
      req.flash('addrestname', req.body.name);
      req.flash('addrestcategory', req.body.category);
      req.flash('addrestdir', req.body.dir);
      req.flash('addrestlabel', req.body.label);
      req.flash('addrestdesc', req.body.description);
      req.flash('addrestlat', req.body.ubicacionlat);
      req.flash('addrestlng', req.body.ubicacionlng);
      return res.redirect('/addrest');
    }else{   
      Category.findOne({code: req.body.category}, function(err, categoryexist){
        if(err) return next(err);
        if(categoryexist){
          var restaurant = new Restaurant();
          restaurant.name = req.body.name;
          restaurant.category = categoryexist._id;
          restaurant.direction = req.body.dir;
          restaurant.estado = req.body.estado;
          restaurant.label = req.body.label;
          restaurant.description = req.body.description;   
          restaurant.latitude = req.body.ubicacionlat;
          restaurant.longitude = req.body.ubicacionlng; 
          if(req.files.length > 0){       
    
            if(req.files.length > 3){
              req.flash('addresterror', 'Max 3 files are allowed');
              req.flash('addrestname', req.body.name);
              req.flash('addrestcategory', req.body.category);
              req.flash('addrestdir', req.body.dir);
              req.flash('addrestlabel', req.body.label);
              req.flash('addrestdesc', req.body.description);
              req.flash('addrestlat', req.body.ubicacionlat);
              req.flash('addrestlng', req.body.ubicacionlng);
              return res.redirect('/addrest');
            }
    
            for(var i = 0; i < req.files.length; i++){
    
              var extension = path.extname(req.files[i].originalname).toLowerCase();
      
              if(extension != '.jpg')
              {
                req.flash('addresterror', 'Only JPG pictures are allowed');
                req.flash('addrestname', req.body.name);
                req.flash('addrestcategory', req.body.category);
                req.flash('addrestdir', req.body.dir);
                req.flash('addrestlabel', req.body.label);
                req.flash('addrestdesc', req.body.description);
                req.flash('addrestlat', req.body.ubicacionlat);
                req.flash('addrestlng', req.body.ubicacionlng);
                return res.redirect('/addrest');
              }else{
                
                const tempPath = req.files[i].path;
                const targetPath = path.join(__dirname, config.upload_file+"restaurant/"+restaurant._id+"_"+(i+1)+".jpg");
                // const targetPathMovil = path.join(__dirname, config.upload_file_movil+"restaurant/"+restaurant._id+"_"+(i+1)+".jpg");
                const targetLocal = path.join(__dirname, "../public/images/uploads/restaurant/"+restaurant._id+"_"+(i+1)+".jpg"); 
            
                fs.copyFile(tempPath, targetPath, function(err){
                  if(err) return next(err);
                });
                // fs.copyFile(tempPath, targetPathMovil, function(err){
                //   if(err) return next(err);
                // });  
                fs.copyFile(tempPath, targetLocal, function(err){
                  if(err) return next(err);
                });
    
                if(i == 0) {
                  restaurant.picture1 = restaurant._id+"_1.jpg";
                }if(i == 1) {
                  restaurant.picture2 = restaurant._id+"_2.jpg";
                }if(i == 2) {
                  restaurant.picture3 = restaurant._id+"_3.jpg";
                }              
              }
            }       
    
          }
          restaurant.save(function(err){
            return res.redirect('/restaurants');
          });
        }
      });
    }
  });
});

router.get('/editrest/:id', function(req, res, next){
  if (!req.user) return res.redirect('/login');

  Category.find({}, function(err, categories){
    if(err) return next(err);
    Restaurant.findById({ _id : req.params.id}).exec(function(err, restaurant){
      if(err) return next(err);
          res.render('restaurant/editrest', {message: req.flash('editresterror'), restedit: restaurant, categories: categories});
    });  
  });
});

router.post('/editrest/:id', upload.any(), function(req, res, next){
  if (!req.user) return res.redirect('/login');
    Restaurant.findOne({ name : req.body.name}).exec(function(err, restaurant){
      if(err) return next(err);


      if(restaurant){
        if(restaurant._id != req.params.id){
          req.flash('editresterror', 'A restaurant with name '+ req.body.name +' already exist');
          return res.redirect('/editrest/'+ req.params.id);
        }
      }
      
      Category.findOne({code: req.body.category}, function(err, categoryexist){
        if(err) return next(err);        
        if(categoryexist){          
          Restaurant.findOne({ _id : req.params.id}, function(err, restexist){
            if(err) return next(err);            
            restexist.name = req.body.name;
            restexist.category = categoryexist._id;
            restexist.direction = req.body.dir;
            restexist.estado = req.body.estado;
            restexist.label = req.body.label;
            restexist.description = req.body.description;
            restexist.latitude = req.body.ubicacionlat;
            restexist.longitude = req.body.ubicacionlng;
            if(req.files.length > 0){
    
              if(req.files.length > 3){
                req.flash('editresterror', 'Max 3 files are allowed');
                return res.redirect('/editrest/'+ req.params.id);
              }
    
              for(var i = 0; i < req.files.length; i++){
                var extension = path.extname(req.files[i].originalname).toLowerCase();
      
                if(extension != '.jpg')
                {
                  req.flash('editresterror', 'Only JPG pictures are allowed');
                  return res.redirect('/editrest/'+ req.params.id);
                }else{
                  const tempPath = req.files[i].path;
                  const targetPath = path.join(__dirname, config.upload_file+"restaurant/"+restaurant._id+"_"+(i+1)+".jpg");                  
                  // const targetPathMovil = path.join(__dirname, config.upload_file_movil+"restaurant/"+restaurant._id+"_"+(i+1)+".jpg");
                  const targetLocal = path.join(__dirname, "../public/images/uploads/restaurant/"+restaurant._id+"_"+(i+1)+".jpg");

                  console.log('el camino es ' + targetLocal);
      
                  fs.copyFile(tempPath, targetPath, function(err){
                    if(err) return next(err);
                  });
                  // fs.copyFile(tempPath, targetPathMovil, function(err){
                  //   if(err) return next(err);
                  // });  
                  fs.copyFile(tempPath, targetLocal, function(err){
                    if(err) return next(err);
                  });
                  
                  if(i == 0) {
                    restexist.picture1 = restexist._id+"_1.jpg";
                  }if(i == 1) {
                    restexist.picture2 = restexist._id+"_2.jpg";
                  }if(i == 2) {
                    restexist.picture3 = restexist._id+"_3.jpg";
                  } 
                }    
              }    
            }                
            restexist.save(function(err){
              if(err) return next(err);
              req.flash('restaurants', 'The restaurant have been updated');
              return res.redirect('/restaurants');
            });
          });
        }
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
