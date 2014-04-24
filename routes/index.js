var crypto = require('crypto');
var User = require('../models/user.js');

var express = require('express');
var router = express.Router();



/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', {

      title: 'Express',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()


  });
});


router.get('/reg', function(req, res) {
    res.render('reg', {
        title : 'Registration',
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()

    });
});

router.post('/reg', function(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    var password_re = req.body['repeat-password'];
    var email = req.body.email;
    console.log("???");
    console.log(req.body);

    if (password != password_re) {
        req.flash('error', 'Two password are not smae');
        return res.redirect('/reg');
    }

    // Generate Md5
    var md5 = crypto.createHash('md5'),
        password = md5.update(req.body.password).digest('hex');

   var newUser = new User({
        username: username,
        password: password,
        email: email
   });


    User.get(newUser.name, function(err, user) {
        if (user) {
            req.flash('error', 'Username already exist!');
            return res.redirect('/reg');
        }

        // if not exist in database, add user
        newUser.save(function(err, user) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/reg');
            }

            req.session.user = user;
            req.flash('success', 'Register successfully!');
            res.redirect('/');

        });
    });
});

router.get('/login', function(req, res) {
    res.render('login', { title : 'Login'});
});

router.post('/login', function(req, res) {

});

router.get('/post', function(req, res) {
    res.render('index', { title : 'Post Blog'});
});

router.post('/post', function(req, res) {

});

router.get('/logout', function(req, res) {
    res.render('index', { title : 'logout'});
});


module.exports = router;
