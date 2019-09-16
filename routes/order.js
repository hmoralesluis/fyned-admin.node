const router = require('express').Router();
// const async = require('async');
// const stripe = require('stripe')('sk_test_agfM3tP9YHVywTfIbgk54IA6')
// const Gig = require('../models/gig');
const Order = require('../models/ordercart');
const Rol = require('../models/rol');
const User = require('../models/user');
// const Gig = require('../models/gig');
// const Category = require('../models/category');
// const Restaurant = require('../models/restaurant');
// const multer = require('multer');
// const fs = require("fs");
// const path = require("path");
// const config = require('../config/secret');


router.get('/ordersact', function(req, res, next){
    if (!req.user) return res.redirect('/login')
    Order
    .find({atendida: false})
    .populate('owner')
    .exec(function(err, orders){
        if(err) return next(err);
        Rol.findOne({code: 'repartidor'}, function(err, rol){
            if(err) return next(err);
            User.find({rol: rol._id}, function(err, users){
                if(err) return next(err);
                res.render('orders/orders', {orders: orders, message: req.flash('orderate'), repartidores: users});
            });
        });
    });
});

router.get('/ordersate', function(req, res, next){
    if (!req.user) return res.redirect('/login');
    Order
    .find({atendida: true})
    .populate('owner')
    .exec(function(err, orders){
        if(err) return next(err);
        res.render('orders/ordersate', {orders: orders});
    });
});

router.get('/changestatus/:id', function(req, res, next){
    if (!req.user) return res.redirect('/login');
    Order.findById({_id: req.params.id}, function(err, order){
        if(err) return next(err);
        order.progreso = order.progreso + 25;
        if(order.progreso == 25){
            order.estado = 'Preparando plato';
        }else{
            if(order.progreso == 50){
                order.estado = 'Plato listo';
            }else{
                if(order.progreso == 75){
                    order.estado = 'En camino';
                }else{
                    if(order.progreso == 100){
                        order.estado = 'Entregada';
                        order.atendida = true;
                        req.flash('orderate', 'Orden atendida');
                    }
                }
            }
        }
        order.save();
        res.redirect('/ordersact');
             
    });
});

router.post('/asignrep/:orderid/:repid', function(req, res, next){
    Order.findById({_id: req.params.orderid}, function(err, order){
        if(err) return next(err);
        order.repartidor = req.params.repid;
        order.progreso = order.progreso + 25;
        if(order.progreso == 25){
            order.estado = 'Preparando plato';
        }else{
            if(order.progreso == 50){
                order.estado = 'Plato listo';
            }else{
                if(order.progreso == 75){
                    order.estado = 'En camino';
                }else{
                    if(order.progreso == 100){
                        order.estado = 'Entregada';
                        order.atendida = true;
                        req.flash('orderate', 'Orden atendida');
                    }
                }
            }
        }
        order.save();
        res.json({data: 'OK'})
    });
});

module.exports = router;