var express = require('express');
var path = require('path');
var connect = require('connect');
var settings = require('./settings');

var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
//var partials = require('express-partials');

var MongoStore = require('connect-mongo')(connect);
var flash = require('connect-flash');
//var fs = require('fs');
//var accessLog = fs.createWriteStream('access.log', {flags : 'a'})
//var errorLog = fs.createWriteStream('error.log', {flags : 'a'})



var routes = require('./routes/index');
var users = require('./routes/users');
var posts = require('./routes/posts');
var tags = require('./routes/tags');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
//app.use(partials());
app.use(flash());


app.use(favicon(__dirname + 'public/images/favicon.ico'));
app.use(logger('dev'));
// Log output
//app.use(logger({stream: accessLog}));

// error logger
//app.use(function(err, req, res, next) {
//    var meta = '[' + new Date() + ']' + req.url + '\n';
//    errorLog.write(meta + err.stack+ '\n');
//    next();
//})


app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use(session({
    secret: settings.cookieSecret,
    key: settings.db,//cookie name
    cookie: {maxAge: 1000 * 60 * 60 * 24 * 30},//30 days
    store: new MongoStore({
        db: settings.db
    })
}))


app.use('/', routes);
app.use('/u', users);
app.use('/p', posts);
app.use('/tags', tags);

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);

});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
