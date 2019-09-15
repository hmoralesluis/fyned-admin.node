const Notification = require('../models/notification');

module.exports = function(req, res, next) {
  if (req.user) {
    iduser = req.user._id;
    Notification.find({owner: req.user._id}, function(err, notifications){
        if(err) return next(err);
        res.locals.notifications = notifications;
        next();
    });    
  }else{
    next();
  }
}