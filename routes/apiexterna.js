const router = require('express').Router();
const Gig = require('../models/gig');
const Category = require('../models/category');
const Restaurant = require('../models/restaurant');
const Cart = require('../models/cart');
const OrderCart = require('../models/ordercart');
const User = require('../models/user');
const LovedRestaurant = require('../models/lovedrestaurant');
const LovedGig = require('../models/lovedgig');
const Rol = require('../models/rol');
const Notification = require('../models/notification');
const Configuration =  require('../models/configuration');


router.post('/apitest', function(req, res, next){
  console.log('el valor es ' + req.body.todo);
  res.json({message: 'ok '});
});

function createNotification(message) {
  Rol.findOne({code: 'admin'}, function(err, roladmin){
    if(err) return next(err);
    User.find({rol: roladmin._id}, function(err, users){
      if(err) return next(err);
      let largo = users.length;
      for(let i = 0; i < largo; i++){
        let notification = new Notification();
        notification.owner = users[i]._id;
        notification.content = message;
        notification.save();
      }
      
    });
  });
}

// begin Datos de usuarios
  router.get('/apiuserbyemail/:email', function(req, res, next){
    const email = req.params.email;
    User.findOne({email: email}, function(err, userexist){
      if(err) return next(err);
      if(userexist)
        res.json({res: true});
      else
        res.json({res: false});      
    });
  });


  router.get('/adduserexterno/:name/:email/:pass', function(req, res, next){
    Rol.findOne({code: 'regular'}, function(err, rol){
      if(err) return next(err);
      var user = new User();
      user.username = req.params.name;
      user.email = req.params.email;
      user.password = req.params.pass;  
      user.rol = rol.id;  
      user.save();
      //Create the notifications related to this topic for the admin users.
      createNotification('Se registro un nuevo usuario');
      res.json({res: user._id});            
    });
  });


  router.get('/apicanlogintheuser/:email/:pass', function(req, res, next){
    User.findOne({email: req.params.email}, function(err, user){
      if(err) return next(err);
      if(user){
        if(user.comparePassword(req.params.pass))
          res.json({res: user._id});
        else
          res.json({res: false});  
      }else{
        res.json({res: false}); 
      }
    });
  });

// end Datos de usuarios



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


router.get('/apigigssugerencia', function(req, res, next) {
  Gig
    .find({enabled: true, sugerencia: true})
    // .populate('owner')
    .exec(function(err, gigs) {
      if (err) return next(err);
      res.json({gigs: gigs});
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
    .findOne({enabled: true, _id : req.params.id})
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
    Gig.findById({_id: idgig}, function(err, gig){
      if(err) return next(err);
      cart.items.unshift({
        item: gig._id,
        price: parseFloat(gig.price),
        title: gig.title,
        picture: gig.picture1,
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

/**
 * Funcion para modificar la cantidad de uno de los elementos del carro
 * Parameters Id usuario, Id del item y la nueva cantidad
 * Return true o false
 */

router.get('/apimodifyitemqtyfromcart/:iduser/:iditem/:qty', function(req, res, next){
  Cart.findOne({owner : req.params.iduser}, function(err, cart){
    if(err) return next(err);
    if(!cart){
      res.json({res: false});
    }else{      
      let large = cart.items.length;
      for(let i = 0; i < large; i++) {        
        if(cart.items[i]._id == req.params.iditem) {
          cart.total -= cart.items[i].quantity * cart.items[i].price;
          cart.items[i].quantity = req.params.qty;
          cart.total += cart.items[i].quantity * cart.items[i].price;
          cart.save();
          break;
        }
      }
      res.json({res: true});
    }
  });  
});

/**
 * Funcion para elimiar una solicitud de compra en el carro
 * Parameters Id usuario, Id del item 
 * Return true o false
 */

 router.get('/apidelorderfromcart/:iduser/:iditem', function(req, res, next){
    Cart.findOne({owner : req.params.iduser}, function(err, cart){
      if(err) return next(err);
      if(!cart){
        res.json({res: false});
      }else{ 
        let large = cart.items.length;
        for(let i = 0; i < large; i++) {        
          if(cart.items[i]._id == req.params.iditem) {
            cart.total -= cart.items[i].quantity * cart.items[i].price;
            break;
          }
        }
        cart.items.pull(String(req.params.iditem));
        cart.save();
        res.json({res: true});
      }
    });
 });

 /**
  * Funcion para crear una orden y limpiar los item del carro
  * Params id usuario,
  */

  router.get('/apicreateorderbyuserid/:iduser', function(req, res, next){    
    Cart.findOne({owner : req.params.iduser}, function(err, cart){
        if(err) return next(err);
        if(!cart) {
          res.json({res: false});
        }else {
          var ordercart = new OrderCart();
          ordercart.owner = cart.owner;
          ordercart.total = cart.total;
          let large = cart.items.length;
          for(let i = 0; i < large; i++) {
            ordercart.items.unshift({
              _id: cart.items[i]._id,
              item: cart.items[i].item,
              quantity: cart.items[i].quantity,
              price: cart.items[i].price,
              title: cart.items[i].title,
              picture: cart.items[i].picture
            });
          }
          ordercart.save();
          cart.items = [];
          cart.total = 0;
          cart.save();
          //Create the notifications related to this topic for the admin users.
          createNotification('Se creo una nueva orden');
          res.json({res: true});
         
        }
    });
  });

  /**
   * Funcion para obtener las ordenes correspondientes a un usuario
   * Params id usuario
   * return false or user orders
   */

   router.get('/getordercartbyuserid/:userid', function(req, res, next){
    OrderCart.find({owner: req.params.userid}, function(err, ordercart){
      if(err) return next(err);
      if(!ordercart){
        res.json({res: false})
      }else{
        res.json({res: true, orders: ordercart});
      }
    });
   });

  /**
   * Funcion para obtener los datos de una orden por el id de la misma
   * Params id orden
   * return false or order
   */ 

  router.get('/getordercartbyid/:orderid', function(req, res, next){
    OrderCart.findById({_id: req.params.orderid}, function(err, ordercart){
      if(err) return next(err);
      if(!ordercart){
        res.json({res: false})
      }else{
        res.json({res: true, order: ordercart});
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
        picture: restaurant.picture1,
      });

      lovedrest.save(function(err) {
        if (err) return next(err);
        res.json({
          id: lovedrest.items[0]._id,
          message: 1,
          item: restaurant._id,
          name: restaurant.name,
          picture: restaurant.picture1,
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
          console.log('el valor del larog es ' + lovedrest.items.length);
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
        picture: gig.picture1,
      });

      lovedgig.save(function(err) {
        if (err) return next(err);
        res.json({
          id: lovedgig.items[0]._id,
          message: 1,
          item: gig._id,
          title: gig.title,
          picture: gig.picture1,
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


/*--- Start configuration --*/

router.get('/apigetdistance', function(req, res, next){
  Configuration.findOne({}, function(err, configuration){
      if(err) return next(err);
      if(configuration){
        res.json({distance: configuration.distance});
      }else{
        res.json({message: 'no'});
      }
  });
});

/*--- End configuration --*/

module.exports = router;
