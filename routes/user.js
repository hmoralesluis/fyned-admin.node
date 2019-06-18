const router = require('express').Router();
const passport = require('passport');
const passportConfig = require('../config/passport');
const User = require('../models/user');


/* LOGIN ROUTE */
router.route('/login')

  .get((req, res, next) => {
    if (req.user) return res.redirect('/');
    res.render('accounts/login', { layout: 'layout-login', message: req.flash('loginMessage')});
  })

  .post(passport.authenticate('local-login', {
    successRedirect : '/', // redirect to the secure profile section
    failureRedirect : '/login', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
  }));

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

module.exports = router;
