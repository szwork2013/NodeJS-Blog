var User = require('../models/user.js');
var Post = require('../models/post.js');

var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
    Post.getTags(function(err, tags) {
        if (err) {
            req.flash('error', err);
            return res.redirect('/');
        }

        res.render('tags', {
            title: 'Tags',
            tags: tags,
            user: req.session.req,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });
});


router.get('/:tag', function(req, res) {
    Post.getTag(req.params.tag, function(err, posts) {
        if (err) {
            req.flash('error', err);
            return res.redirect('/');
        }

        res.render('tag', {
            title: 'Tag' + req.params.tag,
            posts: posts,
            user: req.session.req,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });
});

module.exports = router;

