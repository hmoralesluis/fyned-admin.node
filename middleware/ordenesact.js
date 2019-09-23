const OrderCart = require('../models/ordercart');

module.exports = function(req, res, next) {
  if (req.user) {    
    OrderCart.find({atendida: false}, function(err, orders){
        if(err) return next(err);
        res.locals.ordersqty = orders.length;        
        next();
    });    
  }else{
    next();
  }
}