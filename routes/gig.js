const router = require('express').Router();
const passport = require('passport');
const passportConfig = require('../config/passport');
const Gig = require('../models/gig');
const Category = require('../models/category');
const Restaurant = require('../models/restaurant');
const multer = require('multer');
const fs = require("fs");
const path = require("path");
const config = require('../config/secret');
const async = require('async');
//This is the temp directory to store the uploads files
const upload = multer({
  dest: __dirname + '/../temp'
});





router.get('/gigs', function(req, res, next) {
  if (!req.user) return res.redirect('/login');
  Gig
    .find({})
    // .populate('category')
    .populate('owner')
    .populate('restaurant')
    .exec(function(err, gigs) {
      if (err) return next(err);
      res.render('gig/gigs', {
        gigs: gigs,
        message: req.flash('gigs')
      });
    });
});


router.get('/addgig', function(req, res, next) {
if (!req.user) return res.redirect('/login');
 Category.find({}, function(err, categories){
   if(err) return next(err);

   Restaurant.find({}, function(err, restaurants){
     res.render('gig/addgig', {message: req.flash('addgigerror'), gigtitle: req.flash('addgigtitle'), gigprice : req.flash('addgigprice'), gigoldprice : req.flash('addgigoldprice'),gigabout : req.flash('addgigabout'), gigdetails : req.flash('addgigdetails'), giglabel : req.flash('addgiglabel'),categories: categories, restaurants: restaurants});
   });
  });
});
//
// router.post('/addgig', upload.single('picture'), function(req, res, next){
  router.post('/addgig', upload.any(), function(req, res, next){
  if (!req.user) return res.redirect('/login');

  Gig.findOne({title: req.body.title}, function(err, gig){
    if(err) return next(err);
    if(gig){
      req.flash('addgigerror', 'Un plato con ese nombre ya existe');
      req.flash('addgigtitle', req.body.title);
      // req.flash('addgigcategory', req.body.category);
      req.flash('addgigprice', req.body.price);
      req.flash('addgigoldprice', req.body.oldprice);
      req.flash('addgigabout', req.body.about);
      req.flash('addgigdetails', req.body.details);
      req.flash('addgiglabel', req.body.label);
      return res.redirect('/addgig');
    }else{

      // async.waterfall ([

      //   function(callback){
      //     Category.findOne({code: req.body.category}, function(err, categoryexist){
      //       if(err) return next(err);
      //       callback(null, categoryexist);
      //     });
      //   },
      //   function(categoryexist){

          Restaurant.findOne({name: req.body.restaurant}, function(err, restaurantexist){

            var gig = new Gig();
            gig.owner = req.user._id;
            gig.title = req.body.title;
            // gig.category = categoryexist._id;
            gig.restaurant = restaurantexist._id;
            gig.price = req.body.price;
            gig.oldprice = req.body.oldprice;
            gig.about = req.body.about;
            gig.details = req.body.details;
            gig.label = req.body.label;
            if(req.files.length > 0){

              if(req.files.length > 3){
                req.flash('addresterror', 'Max 3 files are allowed');
                req.flash('addgigtitle', req.body.title);
                req.flash('addgigcategory', req.body.category);
                req.flash('addgigprice', req.body.price);
                req.flash('addgigoldprice', req.body.oldprice);
                req.flash('addgigabout', req.body.about);
                req.flash('addgigdetails', req.body.details);
                req.flash('addgiglabel', req.body.label);
                return res.redirect('/addgig');
              }

              for(var i = 0; i < req.files.length; i++){

                var extension = path.extname(req.files[i].originalname).toLowerCase();
  
                if(extension != '.jpg')
                {
                  req.flash('addgigerror', 'Only JPG pictures are allowed');
                  req.flash('addgigtitle', req.body.title);
                  req.flash('addgigcategory', req.body.category);
                  req.flash('addgigprice', req.body.price);
                  req.flash('addgigoldprice', req.body.oldprice);
                  req.flash('addgigabout', req.body.about);
                  req.flash('addgigdetails', req.body.details);
                  req.flash('addgiglabel', req.body.label);
                  return res.redirect('/addgig');
                }else{
                  const tempPath = req.files[i].path;
                  const targetPath = path.join(__dirname, config.upload_file+"gig/"+gig._id+"_"+(i+1)+".jpg");
                  const targetPathMovil = path.join(__dirname, config.upload_file_movil+"gig/"+gig._id+"_"+(i+1)+".jpg");
                  const targetLocal = path.join(__dirname, "../public/images/uploads/gig/"+gig._id+"_"+(i+1)+".jpg");
  
                  fs.copyFile(tempPath, targetPath, function(err){
                    if(err) return next(err);
                  });
                  fs.copyFile(tempPath, targetPathMovil, function(err){
                    if(err) return next(err);
                  });  
                  fs.copyFile(tempPath, targetLocal, function(err){
                    if(err) return next(err);
                  });

                  if(i == 0) {
                    gig.picture1 = gig._id+"_1.jpg";
                  }if(i == 1) {
                    gig.picture2 = gig._id+"_2.jpg";
                  }if(i == 2) {
                    gig.picture3 = gig._id+"_3.jpg";
                  }   
                    
                }
              }
            }
            gig.save(function(err){
              return res.redirect('/gigs');
            });

          });
      //   }
      // ])
    }
  });
});
//
router.get('/editgig/:id', function(req, res, next){
  if (!req.user) return res.redirect('/login');
    Gig.findById({ _id : req.params.id}).exec(function(err, gig){
      if(err) return next(err);
      Category.find({}, function(err, categories){
        if(err) return next(err);
        Restaurant.find({}, function(err, restaurants){
          res.render('gig/editgig', {message: req.flash('editgigerror'), gigedit: gig, categories: categories, restaurants: restaurants});
        });
      });
  });
});
//
router.post('/editgig/:id', upload.any(), function(req, res, next){
  if (!req.user) return res.redirect('/login');

    Gig.findOne({ title : req.body.title}).exec(function(err, gig){
      if(err) return next(err);


      if(gig){
        if(gig._id != req.params.id){
          req.flash('editgigerror', 'A Gig with title '+ req.body.title +' already exist');
          return res.redirect('/editgig/'+ req.params.id);
        }
      }

      Gig.findOne({ _id : req.params.id}, function(err, gigexist){
        if(err) return next(err);
        // Category.findOne({code: req.body.category}, function(err, categoryexist){
          // if(err) return next(err);
          Restaurant.findOne({name: req.body.restaurant}, function(err, restaurantexist){
            if(err) return next(err);
            gigexist.title = req.body.title;
            gigexist.restaurant = restaurantexist._id;
            // gigexist.category = categoryexist._id;
            gigexist.price = req.body.price;
            gigexist.oldprice = req.body.oldprice;
            gigexist.about = req.body.about;
            gigexist.details = req.body.details;
            gigexist.label = req.body.label;
            if(req.files.length > 0){

              if(req.files.length > 3){
                req.flash('editgigerror', 'Max 3 files are allowed');
                  return res.redirect('/editgig/'+ req.params.id);
              }

              for(var i = 0; i < req.files.length; i++){
                var extension = path.extname(req.files[i].originalname).toLowerCase();
  
                if(extension != '.jpg')
                {
                  req.flash('editgigerror', 'Only JPG pictures are allowed');
                  return res.redirect('/editgig/'+ req.params.id);
                }else{
                  const tempPath = req.files[i].path;
                  const targetPath = path.join(__dirname, config.upload_file+"gig/"+gig._id+"_"+(i+1)+".jpg");
                  const targetPathMovil = path.join(__dirname, config.upload_file_movil+"gig/"+gig._id+"_"+(i+1)+".jpg");
                  const targetLocal = path.join(__dirname, "../public/images/uploads/gig/"+gig._id+"_"+(i+1)+".jpg");
  
                  fs.copyFile(tempPath, targetPath, function(err){
                    if(err) return next(err);
                  });
                  fs.copyFile(tempPath, targetPathMovil, function(err){
                    if(err) return next(err);
                  });  
                  fs.copyFile(tempPath, targetLocal, function(err){
                    if(err) return next(err);
                  });
  
                  if(i == 0) {
                    gig.picture1 = gig._id+"_1.jpg";
                  }if(i == 1) {
                    gig.picture2 = gig._id+"_2.jpg";
                  }if(i == 2) {
                    gig.picture3 = gig._id+"_3.jpg";
                  } 
                }
              }
            }
            gigexist.save(function(err){
              if(err) return next(err);
              req.flash('gigs', 'The Gig have been updated');
              return res.redirect('/gigs');
            });
          });
        // });
      });
  });
});
//
router.delete('/delgigs/:id', function(req, res, next){
  if (!req.user) return res.redirect('/login');
    Gig.findById({_id : req.params.id}, function(err, gig){
        if(err) return next(err);
        gig.remove();
        req.flash('gig', 'The gig have been deleted');
        res.json({data: 'Deleted'});
    });
});
//

router.get('/sugerenciagig/:id', function(req, res, next){
    Gig.findById({_id : req.params.id}, function(err, gig){
      if(err) return next(err);
      var sugerencia = gig.sugerencia;
      gig.sugerencia = !sugerencia;
      gig.save(function(err){
        if(err) return next(err);
        req.flash('gigs', 'The Gig change the status');
        return res.redirect('/gigs');
      });
    })
});
router.get('/disablegig/:id', function(req, res, next){
    Gig.findById({_id : req.params.id}, function(err, gig){
      if(err) return next(err);
      var enabled = gig.enabled;
      gig.enabled = !enabled;
      gig.save(function(err){
        if(err) return next(err);
        req.flash('gigs', 'The Gig change the status, the disabled items will not appear on the web');
        return res.redirect('/gigs');
      });
    })
});

router.get('/categories', function(req, res, next) {
  if (!req.user) return res.redirect('/login');

  Category
    .find({})
    .exec(function(err, categories) {
      if (err) return next(err);
      res.render('gig/categories', {
        categories: categories,
        message: req.flash('categories')
      });
    });
});

router.get('/addcategory', function(req, res, next) {
  if (!req.user) return res.redirect('/login');

    res.render('gig/addcategory', {message: req.flash('addcategoryerror'), gigtitle: req.flash('addgigname')});

});

router.post('/addcategory', upload.single('picture'), function(req, res, next) {
  if (!req.user) return res.redirect('/login');

  var code = req.body.name.toLowerCase();  

  Category.findOne({code: code}, function(err, categoryexist){
    if(err) return next(err);
    if(categoryexist){
      req.flash('addcategoryerror', 'Una categoria con ese nombre ya existe');
      req.flash('addgigname', req.body.name);
      return res.redirect('/addcategory');
    }else{
      var category = new Category();
      category.code = code;
      category.name = req.body.name;
      if(req.file){
        console.log('tengo files');
        let extension = path.extname(req.file.originalname).toLowerCase();  
        if(extension != '.jpg')
        {
          req.flash('addcategoryerror', 'Solo se admin imagenes JPG');
          req.flash('addgigname', req.body.name);
          return res.redirect('/addcategory');
        }else{
          const tempPath = req.file.path;
          const targetPath = path.join(__dirname, config.upload_file+"category/"+category._id+".jpg");
          const targetPathMovil = path.join(__dirname, config.upload_file_movil+"category/"+category._id+".jpg");
          const targetLocal = path.join(__dirname, "../public/images/uploads/category/"+category._id+".jpg");

          fs.copyFile(tempPath, targetPath, function(err){
            if(err) return next(err);
          });
          fs.copyFile(tempPath, targetPathMovil, function(err){
            if(err) return next(err);
          });  
          fs.copyFile(tempPath, targetLocal, function(err){
            if(err) return next(err);
          });
          category.picture = category._id+".jpg";
        }
      }else{
          req.flash('addcategoryerror', 'Debe entrar una imagen');
          req.flash('addgigname', req.body.name);
          return res.redirect('/addcategory');
      }      
      category.save();
      return res.redirect('/categories');
    }
  })

});

router.get('/editcategory/:id', function(req, res, next){
  if (!req.user) return res.redirect('/login');

    Category.findById({ _id : req.params.id}).exec(function(err, category){
      if(err) return next(err);
          res.render('gig/editcategory', {message: req.flash('editcategoryerror'), categoryedit: category});
  });
});

router.post('/editcategory/:id', upload.single('picture'), function(req, res, next){
  if (!req.user) return res.redirect('/login');

  let code = req.body.name.toLowerCase();
  

  Category.findOne({code: code}, function(err, category){
      if(err) return next(err);
      if(category){
        if(category._id != req.params.id){
          req.flash('editcategoryerror', 'Una categoria con ese nombre ya existe');
          return res.redirect('/editcategory/'+req.params.id);
        }
      }

      Category.findById({_id : req.params.id}, function(err, categoryid){
        categoryid.code = code;
        categoryid.name = req.body.name;
        if(req.file){          
          let extension = path.extname(req.file.originalname).toLowerCase();  
          if(extension != '.jpg')
          {
            req.flash('addcategoryerror', 'Solo se adminten imagenes JPG');
            req.flash('addgigname', req.body.name);
            return res.redirect('/addcategory');
          }else{
            const tempPath = req.file.path;
            const targetPath = path.join(__dirname, config.upload_file+"category/"+category._id+".jpg");
            const targetPathMovil = path.join(__dirname, config.upload_file_movil+"category/"+category._id+".jpg");
            const targetLocal = path.join(__dirname, "../public/images/uploads/category/"+category._id+".jpg");
  
            fs.copyFile(tempPath, targetPath, function(err){
              if(err) return next(err);
            });
            fs.copyFile(tempPath, targetPathMovil, function(err){
              if(err) return next(err);
            });  
            fs.copyFile(tempPath, targetLocal, function(err){
              if(err) return next(err);
            });
            category.picture = category._id+".jpg";
          }
        } 
        categoryid.save(function(err){
          if(err) return next(err);
          req.flash('categories', 'Category Updated')
          return res.redirect('/categories');
        });
      });

  });
});

router.delete('/delcategories/:id', function(req, res, next){
  if (!req.user) return res.redirect('/login');
    Category.findById({_id : req.params.id}, function(err, category){
        if(err) return next(err);
        category.remove();
        req.flash('categories', 'The Category have been deleted');
        res.json({data: 'Deleted'});
    });
});



module.exports = router;
