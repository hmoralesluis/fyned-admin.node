const router = require('express').Router();
const Configuration =  require('../models/configuration');

router.get('/configuration', function(req, res, next) {
    if (!req.user) return res.redirect('/login');
    Configuration.find({}, function(err,  configurations){
        if(err) return next(err);        
        if(configurations.length == 0){
            let configuration = new Configuration();
            configuration.distance = 0;
            configuration.save();
            res.render('configuration/configurations', {configuration: configuration, message: req.flash('updateconfiguration')});
        }else{
            res.render('configuration/configurations', {configuration: configurations[0], message: req.flash('updateconfiguration')});
        }
        
    });
  });


  router.post('/congiguration_distance', function(req, res, next) {
    if (!req.user) return res.redirect('/login');
    console.log(' la distancia es ' + req.body.distance);
    Configuration.findOne({}, function(err,  configuration){
        if(err) return next(err);
        req.flash('updateconfiguration', 'Configuracion actualizada');
        if(configuration){
            configuration.distance = req.body.distance;
            configuration.save();
            res.redirect('/configuration');
        }else{
            let configuration = new Configuration();
            configuration.distance = req.body.distance;
            configuration.save();
            res.redirect('/configuration');
        }        
    });


  });



  
module.exports = router;