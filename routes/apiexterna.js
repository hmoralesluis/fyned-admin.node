const router = require('express').Router();
const Gig = require('../models/gig');
const Category = require('../models/category');
const Restaurant = require('../models/restaurant');
const Cart = require('../models/cart');

router.get('/apigigs', function(req, res, next) {
  Gig
    .find({enabled: true})
    .populate('owner')
    .exec(function(err, gigs) {
      if (err) return next(err);
      res.json({gigs: gigs});
    });
});

router.get('/apigig/:id', function(req, res, next) {
  Gig
    .findById({_id: req.params.id})
    // .populate('category')
    .exec(function(err, gig) {
      if (err) return next(err);
      res.json({gig: gig});
    });
});

router.get('/apicategories', function(req, res, next) {
  Category
    .find()
    // .populate('owner')
    .exec(function(err, categories) {
      if (err) return next(err);
      res.json({categories: categories});
    });
});
router.get('/apicategory/:id', function(req, res, next) {
  Category
    .findById({_id: req.params.id})
    // .populate('owner')
    .exec(function(err, category) {
      if (err) return next(err);
      res.json({category: category});
    });
});



router.get('/apirestaurants', function(req, res, next) {

  Restaurant
    .find({enabled: true})
    .exec(function(err, restaurants) {
      if (err) return next(err);
      res.json({restaurants: restaurants});
    });
});

router.get('/apirestaurantandgigs/:id', function(req, res, next) {

  Restaurant
    .find({enabled: true, _id : req.params.id})
    .exec(function(err, restaurant) {
      if (err) return next(err);
      Gig.find({enabled: true, restaurant: req.params.id}, function(err, gigs){
        res.json({restaurant: restaurant, gigs: gigs});
        // console.log(restaurant);
      });
    });
});

router.get('/apicreatecart/:iduser', function(req, res, next){

  var cart = new Cart();
  cart.owner = req.params.iduser;
  cart.save(function(err){
    if(err) return next(err);
    res.json({message: 'ok'});
  });

});

router.get('/apiaddgigtocart/:iduser/:idgig/:quantity', function(req, res, next){

  const iduser =  req.params.iduser;
  const idgig =  req.params.idgig;
  const quantity =  req.params.quantity;


  // res.json({message: 'ok'});

  Cart.findOne({ owner: iduser }, function(err, cart) {
    if(err) return next(err);
    Gig.findById({_id: req.params.idgig}, function(err, gig){
      if(err) return next(err);
      cart.items.unshift({
        item: gig._id,
        price: parseFloat(gig.price),
        quantity: parseInt(req.params.quantity)
      });


      cart.total = cart.total + (gig.price * quantity);
      // console.log('el valor es ' +cart.total);
      cart.save(function(err) {
        if (err) return next(err);
        res.json({message: 'ok'});
      });
    });
  });
});

router.get('/apigetcartbyuserid/:iduser', function(req, res, next){
    Cart.findOne({owner: req.params.iduser}, function(err, cart){
        if(err) return next(err);
        if(!cart){
          res.json({cart: 0});
        }else{
          res.json({cart: cart});
        }
    });
});

module.exports = router;
