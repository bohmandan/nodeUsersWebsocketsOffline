
/**
 * Module dependencies
 */

var express = require('express'),
    routes = require('./routes'),
    cacheManifest = require('connect-cache-manifest'),
    http = require('http'),
    jade = require('jade'),
    path = require('path');

var app = module.exports = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

/**
 * Configuration
 */

// all environments
app.set('port', process.env.PORT || 3000);
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'jade');

// development only
var env = process.env.NODE_ENV || 'development';
if ('development' == env) {
  //app.use(express.errorHandler());
}
/* lower debug level socket io */
io.set('log level', 1);

// production only
if (app.get('env') === 'production') {
  // TODO
};

/**
 * Offline feature
 */

app.get("/manifest.appcache", function(req, res){
    res.set("Content-Type", "text/cache-manifest");
    res.status(200).sendfile('manifest.appcache');
});
/*
app.get("/test.html", function(req, res){
    res.set("Content-Type", "text/html");
    res.status(200).sendfile('test.html');
});
*/
app.get('/test.html', function (req, res) {
  res.sendfile(__dirname + '/test.html');
});


/**
 * Routes
 */

// serve index and view partials
app.get('/', routes.index);
app.get('/partials/:name', routes.partials);

// JSON API
//app.get('/api/name', api.name);

// redirect all others to the index (HTML5 history)
app.get('*', routes.index);

// Socket.io Communication
io.sockets.on('connection', require('./routes/socket'));

/**
 * Start Server
 */

server.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});
