const router = require('express').Router();
// const async = require('async');
// const stripe = require('stripe')('sk_test_agfM3tP9YHVywTfIbgk54IA6')
// const Gig = require('../models/gig');
const Order = require('../models/ordercart');
const Gig = require('../models/gig');
const Category = require('../models/category');
const Restaurant = require('../models/restaurant');
const multer = require('multer');
const fs = require("fs");
const path = require("path");
const config = require('../config/secret');


router.get('/ordersact', function(req, res, next){
    if (!req.user) return res.redirect('/login')
    Order
    .find({atendida: false})
    .populate('owner')
    .exec(function(err, orders){
        if(err) return next(err);
        res.render('orders/orders', {orders: orders, message: req.flash('orderate')});
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

module.exports = router;