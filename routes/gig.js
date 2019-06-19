const router = require('express').Router();
const passport = require('passport');
const passportConfig = require('../config/passport');
const Gig = require('../models/gig');
const multer = require('multer');
const fs = require("fs");
const path = require("path");
//This is the temp directory to store the uploads files
const upload = multer({
  dest: __dirname + '/../temp'
});





router.get('/gigs', function(req, res, next) {

  Gig
    .find({})
    .populate('owner')
    .exec(function(err, gigs) {
      if (err) return next(err);
      res.render('gig/gigs', {
        gigs: gigs,
        message: req.flash('gigs')
      });
    });
});

router.get('/addgig', function(req, res, next) {

  res.render('gig/addgig', {message: req.flash('addgigerror'), gigtitle: req.flash('addgigtitle'), gigcategory : req.flash('addgigcategory'), gigprice : req.flash('addgigprice')});

});
//
router.post('/addgig', upload.single('picture'), function(req, res, next){

  Gig.findOne({title: req.body.title}, function(err, gig){
    if(err) return next(err);
    if(gig){
      req.flash('addgigerror', 'A Gig with that name already exist');
      req.flash('addgigtitle', req.body.title);
      req.flash('addgigcategory', req.body.category);
      req.flash('addgigprice', req.body.price);
      return res.redirect('/addgig');
    }else{
      var gig = new Gig();

      gig.owner = req.user._id;
      gig.title = req.body.title;
      gig.category = req.body.category;
      gig.price = req.body.price;
      if(req.file){

        var extension = path.extname(req.file.originalname).toLowerCase();

        if(extension != '.jpg')
        {
          req.flash('addgigerror', 'Only JPG pictures are allowed');
          req.flash('addgigtitle', req.body.title);
          req.flash('addgigcategory', req.body.category);
          req.flash('addgigprice', req.body.price);
          return res.redirect('/addgig');
        }else{
          const tempPath = req.file.path;
          const targetPath = path.join(__dirname, "../public/images/uploads/"+gig._id+".jpg");
          fs.rename(tempPath, targetPath, function(err){
            if(err) return next(err);
          });
            gig.picture = gig._id+".jpg";
        }

      }
      gig.save(function(err){
        return res.redirect('/gigs');
      });
    }
  });
});
//
router.get('/editgig/:id', function(req, res, next){

    Gig.findById({ _id : req.params.id}).exec(function(err, gig){
      if(err) return next(err);
          res.render('gig/editgig', {message: req.flash('editgigerror'), gigedit: gig});
  });
});
//
router.post('/editgig/:id', upload.single('picture'), function(req, res, next){

    Gig.findOne({ title : req.body.title}).exec(function(err, gig){
      if(err) return next(err);


      if(gig){
        if(gig._id != req.params.id){
          req.flash('editgigerror', 'A Gig with title '+ req.body.title +' already exist');
          return res.redirect('/editgig/'+ req.params.id);
        }
      }

      Gig.findOne({ _id : req.params.id}, function(err, gigexist){
        gigexist.title = req.body.title;
        gigexist.category = req.body.category;
        gigexist.price = req.body.price;
        if(req.file){

          var extension = path.extname(req.file.originalname).toLowerCase();

          if(extension != '.jpg')
          {
            req.flash('editgigerror', 'Only JPG pictures are allowed');
            return res.redirect('/editgig/'+ req.params.id);
          }else{
            const tempPath = req.file.path;
            const targetPath = path.join(__dirname, "../public/images/uploads/"+gigexist._id+".jpg");
            fs.rename(tempPath, targetPath, function(err){
              if(err) return next(err);
            });
              gigexist.picture = gigexist._id+".jpg";
          }

        }

        gigexist.save(function(err){
          if(err) return next(err);
          req.flash('gigs', 'The Gig have been updated');
          return res.redirect('/gigs');
        });
      });

  });
});
//
router.delete('/delgigs/:id', function(req, res, next){
    Gig.findById({_id : req.params.id}, function(err, gig){
        if(err) return next(err);
        gig.remove();
        req.flash('gig', 'The restaurant have been deleted');
        res.json({data: 'Deleted'});
    });
});
//
router.get('/disablegig/:id', function(req, res, next){
    Gig.findById({_id : req.params.id}, function(err, gig){
      if(err) return next(err);
      var enabled = gig.enabled;
      gig.enabled = !enabled;
      gig.save(function(err){
        if(err) return next(err);
        req.flash('gigs', 'The Gig change the status');
        return res.redirect('/gigs');
      });
    })
});

module.exports = router;
