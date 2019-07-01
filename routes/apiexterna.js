const router = require('express').Router();
const Gig = require('../models/gig');
const Category = require('../models/category');
const Restaurant = require('../models/restaurant');
const Cart = require('../models/cart');
const LovedRestaurant = require('../models/lovedrestaurant');
const LovedGig = require('../models/lovedgig')

router.get('/apigigs', function(req, res, next) {
  Gig
    .find({enabled: true})
    // .populate('owner')
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

router.get('/apigigfromthesamerest/:id', function(req, res, next) {
  Gig
    .findById({_id: req.params.id})
    .exec(function(err, gig) {
      if (err) return next(err);
      Gig.find({restaurant: gig.restaurant, enabled: true}, function(err, gigs){
        if (err) return next(err);
        console.log('data '+gigs);
        res.json({gigs: gigs});
      });
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


// Begin Cart
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
        title: gig.title,
        picture: gig.picture,
        quantity: parseInt(req.params.quantity)
      });


      cart.total = cart.total + (gig.price * quantity);
      // console.log('el valor es ' +cart.total);
      cart.save(function(err) {
        if (err) return next(err);
        res.json({message: 'ok', itemid: cart.items[0]._id});
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

// End Cart


// Begin Loved Restaurant

router.get('/apicreatelovedrestaurant/:iduser', function(req, res, next){

  var lovedrestaurant = new LovedRestaurant();

  lovedrestaurant.owner = req.params.iduser;
  lovedrestaurant.save(function(err){
    if(err) return next(err);
    res.json({message: 'ok'});
  });

});

router.get('/apiaddresttolovedrest/:iduser/:idrest/', function(req, res, next){

  const iduser =  req.params.iduser;
  const idrest =  req.params.idrest;

  // res.json({message: 'ok'});

  LovedRestaurant.findOne({ owner: iduser }, function(err, lovedrest) {
    if(err) return next(err);
    var large = lovedrest.items.length;

    for(var i = 0; i < large; i++){
      if(lovedrest.items[i].item == idrest){
        return res.json({message: 0});
      }
    }

    Restaurant.findById({_id: idrest}, function(err, restaurant){
      if(err) return next(err);
      lovedrest.items.unshift({
        item: restaurant._id,
        name: restaurant.name,
        picture: restaurant.picture,
      });

      lovedrest.save(function(err) {
        if (err) return next(err);
        res.json({
          id: lovedrest.items[0]._id,
          message: 1,
          item: restaurant._id,
          name: restaurant.name,
          picture: restaurant.picture,
        });
      });
    });
  });
});

router.get('/apigetlovedrestbyuserid/:iduser', function(req, res, next){

    LovedRestaurant.findOne({owner: req.params.iduser}, function(err, lovedrest){
        if(err) return next(err);
        if(!lovedrest){
          res.json({lovedrest: 0});
        }else{
          res.json({lovedrest: lovedrest});
        }
    });
});

router.get('/apidelresttolovedrest/:iduser/:item', function(req, res, next){
    LovedRestaurant.findOne({owner: req.params.iduser}, function(err, lovedrest){
      lovedrest.items.pull(String(req.params.item));
        if(err) return next(err);
        lovedrest.save(function(err){
          if(err) return next(err);
          res.json({message: 'Deleted'});
        });
    });
});

// End Loved Restaurant

// Begin Loved Gig

router.get('/apicreatelovedgig/:iduser', function(req, res, next){

  var lovedgig = new LovedGig();

  lovedgig.owner = req.params.iduser;
  lovedgig.save(function(err){
    if(err) return next(err);
    res.json({message: 'ok'});
  });

});

router.get('/apiaddgigtolovedgig/:iduser/:idgig/', function(req, res, next){

  const iduser =  req.params.iduser;
  const idgig =  req.params.idgig;

  // res.json({message: 'ok'});

  LovedGig.findOne({ owner: iduser }, function(err, lovedgig) {
    if(err) return next(err);
    var large = lovedgig.items.length;

    for(var i = 0; i < large; i++){
      if(lovedgig.items[i].item == idgig){
        return res.json({message: 0});
      }
    }

    Gig.findById({_id: idgig}, function(err, gig){
      if(err) return next(err);
      lovedgig.items.unshift({
        item: gig._id,
        title: gig.title,
        picture: gig.picture,
      });

      lovedgig.save(function(err) {
        if (err) return next(err);
        res.json({
          id: lovedgig.items[0]._id,
          message: 1,
          item: gig._id,
          title: gig.title,
          picture: gig.picture,
        });
      });
    });
  });
});


router.get('/apigetlovedgigbyuserid/:iduser', function(req, res, next){

    LovedGig.findOne({owner: req.params.iduser}, function(err, lovedgig){
        if(err) return next(err);
        if(!lovedgig){
          res.json({lovedgig: 0});
          // console.log('no hay');
        }else{
          // console.log('si hay '+lovedgig);
          res.json({lovedgig: lovedgig});
        }
    });
});

router.get('/apidelgigtolovedgig/:iduser/:item', function(req, res, next){
    LovedGig.findOne({owner: req.params.iduser}, function(err, lovedgig){
      if(err) return next(err);
      lovedgig.items.pull(String(req.params.item));
        if(err) return next(err);
        lovedgig.save(function(err){
          if(err) return next(err);
          res.json({message: 'Deleted'});
        });
    });
});

router.get('/apidelgigtocartgig/:iduser/:item', function(req, res, next){
    Cart.findOne({owner: req.params.iduser}, function(err, cart){
      if(err) return next(err);
      var large = cart.items.length;
      var total = 0;
      for(var i = 0; i < large; i++){
        if(cart.items[i]._id == req.params.item){
          total = cart.items[i].quantity * cart.items[i].price;
        }
      }
      cart.items.pull(String(req.params.item));
        if(err) return next(err);
        cart.total = cart.total - total;
        cart.save(function(err){
          if(err) return next(err);
          res.json({message: 'Deleted'});
        });
    });
});

// End Loved Gig

module.exports = router;
