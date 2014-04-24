var crypto = require('crypto');
var fs = require('fs');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart({keepExtensions: true, uploadDir: './public/images'})
var User = require('../models/user.js');
var Post = require('../models/post.js');

var express = require('express');
var router = express.Router();



/* GET home page. */
router.get('/', function(req, res) {
    var page = req.query.p ? parseInt(req.query.p) : 1;
    Post.getTen(null, page, function(err, posts, total) {
        if (err) {
            posts = [];
        }

        res.render('index', {
            title: 'Home',
            page: page,
            posts: posts,
            isFirstPage: (page - 1) == 0,
            isLastPage: (page - 1) * 10 + posts.length == total,
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });

});

router.get('/reg', checkNotLogin);
router.get('/reg', function(req, res) {
    res.render('reg', {
        title : 'Registration',
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()

    });
});

router.post('/reg', checkNotLogin);
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

router.get('/login', checkNotLogin);
router.get('/login', function(req, res) {
    res.render('login', {
        title : 'Login',
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
    });
});

router.post('/login', checkNotLogin);
router.post('/login', function(req, res) {
    var md5 = crypto.createHash('md5'),
        password = md5.update(req.body.password).digest('hex');

    User.get(req.body.username, function(err, user) {
        if (!user) {
            req.flash('error', 'user not exist');
            return res.redirect('/login');
        }

        if (user.password != password) {
            req.flash('error', 'password not right!');
            return res.redirect('/login');
        }

        req.session.user = user;
        req.flash('success', 'login successfully!');
        res.redirect('/');

    });
});

router.get('/post', checkLogin);
router.get('/post', function(req, res) {
    res.render('post', {
        title : 'Post',
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
    });
});


router.post('/post', checkLogin);
router.post('/post', function(req, res) {
    var currentUser = req.session.user;
    var post = new Post(currentUser.username, req.body.title, req.body.post);
    post.save(function(err) {
        if (err) {
            req.flash('error', err);
            return res.redirect('/');
        }
        req.flash('success', 'post successfully!');
        res.redirect('/');
    });
});

router.get('/logout', checkLogin);
router.get('/logout', function(req, res) {
    req.session.user = null;
    req.flash('success', 'logout successfully!');
    res.redirect('/');
});

router.get('/upload', checkLogin);
router.get('/upload', function(req, res) {
    res.render('upload', {
        title: 'Upload',
        user: req.session.req,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
    })
});


router.post('upload', checkLogin);
router.post('/upload', multipartMiddleware, function(req, res) {

    for(var i in req.files) {
        if (req.files[i].size == 0) {
            // use sync delete a file
            fs.unlinkSync(req.files[i].path);
            console.log('Successfully removed');

        } else {
//            console.log(req.files[i].name);
            var target_path = './public/images/' + req.files[i].name;
            // rename a file sync
            fs.renameSync(req.files[i].path, target_path);
            console.log('Successfully renamed');
        }
    }

    req.flash('success', 'UPload successfully');
    res.redirect('/upload');
})



module.exports = router;


// 这部分用4.0 的新的表达方式可以重构掉？
function checkLogin(req, res, next) {
    if (!req.session.user) {
        req.flash('error', 'Need to login first');
        res.redirect('/login');
    }
    next();
}

function checkNotLogin(req, res, next) {
    if (req.session.user) {
        req.flash('error', 'You cannot do that with login status');
        res.redirect('back');
    }
    next();
}


