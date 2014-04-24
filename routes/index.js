var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});


router.get('/reg', function(req, res) {
    res.render('index', { title : 'Registration'});
});

router.post('/reg', function(req, res) {

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
