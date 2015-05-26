
/**
 * Module dependencies
 */

var express = require('express'),
    routes = require('./routes'),
    http = require('http'),
    jade = require('jade'),
    fs = require('fs'),
    path = require('path');

var app = module.exports = express();
var http = http.Server(app);
//var io = require('socket.io')(http, {'transports': ['websocket', 'polling']});
var io = require('socket.io')(http);
var rootPath = __dirname;

/**
 * Configuration
 */

// all environments
app.set('port', process.env.PORT || 3000);
app.use(express.static(path.join(__dirname, 'public')));
app.use('/helpers', express.static(__dirname + '/helpers'));
app.set('view engine', 'jade');
var pathToManifestAppcache = "/manifest.appcache";
var pathToFonts = rootPath+'public/fonts';


// development only
var env = process.env.NODE_ENV || 'development';

/* lower debug level socket io */
//io.set('log level', 1);
io.set('transports', ['websocket', 
                      'polling']);

/*
io.set('transports', ['websocket', 
                      'flashsocket', 
                      'htmlfile', 
                      'xhr-polling', 
                      'jsonp-polling', 
                      'polling']);
*/

// production only
if (app.get('env') === 'production') {
  // TODO
};

/**
 * Offline feature
 */

/* 
http://stackoverflow.com/questions/12346690/is-there-a-way-to-make-angularjs-load-partials-in-the-beginning-and-not-at-when?rq=1
http://stackoverflow.com/questions/23652183/makes-angular-js-works-offline
*/

app.get(pathToManifestAppcache, function (req, res) {
    res.set("Content-Type", "text/cache-manifest");
    res.status(200).sendFile(rootPath+'/manifest.appcache');
});

/*
app.get('/fonts/:file', function (req, res) {
    var file = req.params.file;
    
    console.log('request to /fonts came in');
    console.log(file);
    //console.log(req);
    res.set("Content-Type", "application/x-font-woff");
    res.status(200).sendFile(rootPath+'/public/fonts/'+file);
});
*/
/* test */
app.get('/test.html', function (req, res) {
  res.sendFile(rootPath + '/test.html');
});


/**
 * Routes
 */

// serve index and view partials
app.get('/', routes.index);
app.get('/partials/:name', routes.partials);
app.get('/admin/', routes.admin); // admin as separate - new controller in body



// JSON API
//app.get('/api/name', api.name);

// redirect all others to the index (HTML5 history)
app.get('*', routes.index);

// Socket.io Communication
//AUTH
/*
NO NEED FOR BEFORE AUTH, since we allow guest users too.
io.use(function(socket, next) {
    var handshakeData = socket.handshake;
    //console.log(handshakeData);
    console.log('aafterHandshake');
    //console.log(handshakeData.query);
    console.log(socket.handshake.query);
    if (socket.handshake.query.token) {
        console.log(socket.handshake.query.token);
        console.log(socket.handshake.query.token);
        console.log(socket.handshake.query.token);
    }
    
    if (handshakeData.headers.cookie) {
        var req = {
            headers: {
                cookie: handshake.headers.cookie,
            }
        }

        if (socket) {
            next();
        } else {
            console.log('beror invalid session error');
            return next(new Error('Invalid Session'));
        }
    } else {
        console.log('beror missing query token error');
        next(new Error('Missing query token'));
    }
    
});
*/ 

//SOCKET FILE
var socketManager = require('./routes/socket')(io);

/*
same as:
io.sockets.on('connection', function (socket) {
  socket.on('message', function () { });
  socket.on('disconnect', function () { });
});
*/


/**
 * Start Server
 */
/*
server.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});
*/

http.listen(app.get('port'), function(){
  console.log('listening on *:'+app.get('port'));
});