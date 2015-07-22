var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var socket_io = require( "socket.io" );

var routes = require('./routes/index');
// not used for now
// var users = require('./routes/users');

// Express
var app = express();

// Socket.io
var io = socket_io();
app.io = io;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());


var pathToManifestAppcache = "/manifest.appcache";
/*
app.get(pathToManifestAppcache, function (req, res) {
    res.set("Content-Type", "text/cache-manifest");
    res.status(200).sendFile(rootPath+'/manifest.appcache');
});
*/

/* helper */
if (typeof String.prototype.endsWith !== 'function') {
    String.prototype.endsWith = function(suffix) {
        return this.indexOf(suffix, this.length - suffix.length) !== -1;
    };
}

var staticFileRoutes = [
    pathToManifestAppcache,
    '/node_modules/angular-material/angular-material.min.css',
    '/node_modules/angular/angular.min.js',
    '/node_modules/angular-aria/angular-aria.min.js',
    '/node_modules/angular-animate/angular-animate.min.js',
    '/node_modules/angular-material/angular-material.min.js',
    '/node_modules/angular-material-icons/angular-material-icons.min.js'
];
staticFileRoutes.forEach(function(route) {
    app.get(route, function (req, res) {
        if (route.endsWith('.appcache')) {
            res.set("Content-Type", "text/cache-manifest");
        }
        res.sendFile( __dirname+route );
    });
});

/*
app.get('/node_modules/angular-material/angular-material.min.css', function (req, res) {
    res.sendFile( __dirname+'/node_modules/angular-material/angular-material.min.css' ) 
});
*/

app.use(express.static(path.join(__dirname, '/public')));

app.use('/', routes);
// not used for now
//app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

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

// Socket code here
require('./sockets/socket.js')(io);


module.exports = app;
