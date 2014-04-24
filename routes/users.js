var express = require('express');

var User = require('../models/user.js');
var Post = require('../models/post.js');

var router = express.Router();

/* GET users listing. */
router.get('/:username', function(req, res) {
    User.get(req.params.username, function(err, user) {
        if (!user) {
            req.flash('error', 'User not exist');
            return res.redirect('/');
        }

        Post.getAll(user.username, function(err, posts) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/');
            }

            res.render('user', {
                title: user.username,
                posts: posts,
                user: req.session.user,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            });
        });
    });
});


router.get('/:username/:day/:title', function(req, res) {
    Post.getOne(req.params.username, req.params.day, req.params.title, function(err, post) {
        if (err) {
            req.flash('error', 'This post not exist');
            return res.redirect('/');
        }

        res.render('article', {
            title: req.params.title,
            post: post,
            user: req.session.req,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });
})





module.exports = router;
