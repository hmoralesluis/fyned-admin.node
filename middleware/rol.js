const Rol = require('../models/rol');

module.exports = function(req, res, next) {
  if (req.user) {
    // iduser = req.user._id;
    Rol.findById({_id: req.user.rol}, function(err, rol){
        if(err) return next(err);
        res.locals.rol = rol;        
        next();
    });    
  }else{
    next();
  }
}