var express = require('express');

var User = require('../models/user.js');
var Post = require('../models/post.js');

var router = express.Router();


router.get('/:username/:day/:title/edit', checkLogin);
router.get('/:username/:day/:title/edit', function(req, res) {
    var currentUser = req.session.user;
    // if we edit other's ? so we need to pass username in session

    // 这里其实没必要单独写个edit了，功能是查询，还不如直接入Post.getOne
    // 其实不行，有markdown的问题...
    Post.edit(currentUser.username, req.params.day, req.params.title, function(err, post) {
        if (err) {
            req.flash('error', err);
            res.redirect('back');
        }

        res.render('edit', {
            title:'Edit',
            post: post,
            user: currentUser,
            success: req.flash('success'),
            error: req.flash('error')
        });
    });
});

router.post('/:username/:day/:title/edit', checkLogin);
router.post('/:username/:day/:title/edit', function(req, res) {
    var currentUser = req.session.user;
    Post.update(currentUser.username, req.params.day, req.params.title, req.body.post, function(err) {
        var url = '/u/' + req.params.username + '/' + req.params.day + '/' + req.params.title;
        if (err) {
            res.flash('err', err);
            return res.redirect(url);  // if err, go back that page.
        }

        req.flash('success', 'Edit Successfully');
        res.redirect(url);
    });
});


router.get('/:username/:day/:title/delete', checkLogin);
router.get('/:username/:day/:title/delete', function(req, res) {
    var currentUser = req.session.user;
    Post.delete(currentUser.username, req.params.day, req.params.title, function(err) {
        if (err) {
            res.flash('err', err);
            return res.redirect('back');  // if err, go back that page.
        }

        req.flash('success', 'Delete Successfully');
        res.redirect('/');
    });
});




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

module.exports = router;