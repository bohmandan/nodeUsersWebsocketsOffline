/*
 * Serve content over a socket
 */

/* util to inspect the JS result after parsing */
//var util = require('util');
var updateManifest = require('../helpers/updateManifest');

/* grr fix */
if (typeof console === "undefined") {
    console = {
        log: function () {}
    };
}

// Private helpers
// ===============

/* delay function */
var delay = (function () {
    var timer = 0;
    return function (callback, ms) {
        clearTimeout(timer);
        timer = setTimeout(callback, ms);
    };
})();


var hashCode = function (s) {
    'use strict';
    return s.split("").reduce(function (a, b) {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
    }, 0);
}

var users = [];
var messages = [];
var lastUpdateUserNamesDate;
var lastUpdateUserGeolocsDate;
var oldUpdateUsersDate;
var lastUpdateUsersDate; // should be from database of course later.
var latestPublicUsersHash;

var usersService = (function () {


    function User() {
        this.latestUpdate = "";
        this.name = "";
        this.geoloc = {
            latestUpdate: '',
            lat: '',
            lon: '',
            accuracy: ''
        };
        this.greeting = "";
        this.socketId = "";
        this.token = false;
        this.email = "";
        this.password = "";
        this.id = "";
        for (var n in arguments[0]) {
            this[n] = arguments[0][n];
        }
    }

    function Admin() {
        User.call(this);
    }
    //Admin.prototype = Object.create(User.prototype);

    var updateLastUpdateUsersDate = function () {
        console.log('updateLastUpdateUsersDate called.');
        var newDate = new Date();
        oldUpdateUsersDate = lastUpdateUsersDate;
        lastUpdateUsersDate = newDate;
        console.log(oldUpdateUsersDate + ' - oldUpdateUsersDate');
        console.log(lastUpdateUsersDate + ' - lastUpdateUsersDate');
        lastUpdateUserGeolocsDate = newDate;
    };

    var claimUserId = function (userId) {
        var user = findUserByUserId(userId);
        if (!userId || user) {
            console.log('claim false, userId: ' + userId);
            return false;
        } else {
            console.log('claim true, userId: ' + userId);
            users.push(new User({
                id: userId,
                email: 'test@mail.com'
            }));
            /*
                no update here, since this is when creating the user and it will be done later by updateUser
                updateLastUpdateUsersDate();
            */
            return true;
        }
    };


    var addUser = function () {

    };


    // find the lowest unused id and claim it
    var getGuestUserId = function () {
        var userId,
            nextUserId = 1;
        do {
            userId = nextUserId;
            nextUserId += 1;
        } while (!claimUserId(userId));
        console.log('returning guestUser the id: ' + userId);
        return userId;
    };

    // serialize claimed names as an array
    var get = function () {
        var res = [];
        for (user in users) {
            res.push(user);
        }

        return res;
    };

    var free = function (name) {
        if (users[userId]) {
            delete users[userId];
        }
    };

    var findUserByUsername = function (username) {
        console.log('findUserByUsername: ' + username);
        var user;
        if (users.length) {
            users.forEach(function (userInArray) {
                if (userInArray.name === username) {
                    user = userInArray;
                    console.log('HIT for username: ' + username + '!');
                }

            });
        }
        console.log('findUserByUsername result: ' + user);
        return user;
    };

    var findUserByUserId = function (userId) {
        console.log('findUserByUserId: ' + userId);
        var user;
        if (users.length) {
            users.forEach(function (userInArray) {
                if (userInArray.id === userId) {
                    user = userInArray;
                    console.log('HIT for userId: ' + userId + ' !');
                }

            });
        }
        if (user) {
            console.log('will return user with username: ');
            console.log(user.name);
        }
        return user;
    };

    var findUserByToken = function (token) {
        console.log('findUserByToken: ' + token);
        var user;
        if (users.length) {
            users.forEach(function (userInArray) {
                if (userInArray.token == token) {
                    user = userInArray;
                    console.log('HIT for userId: ' + user.id + ' !');
                    console.log('HIT for token: ' + user.token + ' !');
                }

            });
        }
        if (user) {
            console.log('will return user with username: ');
            console.log(user.name);
            return user;
        } else {
            console.log('findUserByToken - NO USER FOUND');
            return false;
        }

    };

    var getPublicUsersHash = function () {
        /*
        var userNames,
            latestUpdateGeolocs;
        if (users.length) {
            users.forEach(function (userInArray) {
                userNames.push(userInArray.name);
                latestUpdateGeolocs.push(userInArray.geoloc.latestUpdate);
            });
        }
        var userNamesSort = 
        var latestUpdateGeolocsSort = 
        var completeString =  userNamesSort.stringify() + latestUpdateGeolocsSort.stringify();
        var latestPublicUsersHashNew = hashCode(completeString);
        console.log(latestPublicUsersHashNew);
        console.log(latestPublicUsersHash);
        latestPublicUsersHash = latestPublicUsersHashNew;
        return latestPublicUsersHash;
        */
    };

    var updateGeoloc = function (userId, geolocData) {
        console.log('updateGeoloc: ' + userId);
        var user = findUserByUserId(userId);
        if (user) {
            user.geoloc = geolocData;
            getPublicUsersHash();
            updateLastUpdateUsersDate();
            return true;
        } else {
            return false;
        }
    };

    var updateUser = function (updatedUser) {
        console.log('updateUser with user.id: ' + updatedUser.id);
        var userFound = false;
        if (users.length) {
            users.forEach(function (userInArray) {
                if (userInArray.id === updatedUser.id) {
                    userFound = true;
                    console.log('HIT for userId: ' + userInArray.id + ' !');
                    console.log('HIT for name: ' + userInArray.name + ' !');
                    console.log('before update: ');
                    console.log(userInArray);
                    userInArray.geoloc = updatedUser.geoloc ? updatedUser.geoloc : userInArray.geoloc;
                    userInArray.token = updatedUser.token ? updatedUser.token : userInArray.token;
                    userInArray.name = updatedUser.name ? updatedUser.name : userInArray.name;
                    console.log('after update: ');
                    console.log(userInArray);
                    updateLastUpdateUsersDate();
                }
            });
        }
        if (userFound) {
            console.log('user found, updated');
            return true;
        } else {
            users.push(new User(updatedUser));
            console.log('user not found, pushed as new');
            return true;
        }
    };



    return {
        claimUserId: claimUserId,
        free: free,
        get: get,
        getGuestUserId: getGuestUserId,
        findUserByUsername: findUserByUsername,
        findUserByUserId: findUserByUserId,
        findUserByToken: findUserByToken,
        updateGeoloc: updateGeoloc,
        updateUser: updateUser
    };
}());


// Keep track of which names are used so that there are no duplicates
var userNames = (function () {
    var names = {};

    var claim = function (userId, name) {
        console.log('check if name is claimable - name: ' + name);
        var user = usersService.findUserByUsername(name);
        if (!name || user) {
            console.log('claim false, name: ' + name);
            return false;
        } else {
            console.log('ok setting username.');
            var currentUser = usersService.findUserByUserId(userId);
            currentUser.name = name;
            console.log('claim true, name: ' + name);
            return true;
        }
    };

    // find the lowest unused "guest" name and claim it
    var getGuestName = function (userId) {
        console.log('getGuestName for userId: ' + userId);
        var name,
            nextUserId = 1;
        do {
            name = 'Guest ' + nextUserId;
            nextUserId += 1;
        } while (!claim(userId, name));
        console.log('returning guestName: ' + name + ' for user with userId: ' + userId);
        return name;
    };

    // serialize claimed names as an array
    var get = function () {
        var res = [];
        users.forEach(function (arrItem) {
            res.push(arrItem.name);
        });
        console.log(res);
        return res;
    };

    var free = function (name) {
        if (names[name]) {
            delete names[name];
        }
    };

    return {
        claim: claim,
        free: free,
        get: get,
        getGuestName: getGuestName
    };
}());


var messageService = (function () {
    
    var addMessage = function () {
        messages.push('emptyMessage');
        console.log('emptyMessage pushed, returning id: ' + messages.length);
        return messages.length;
    }

    var newId = function () {
        console.log('addMessage called');
        var returnId = addMessage();
        console.log('returnId: ' + returnId);
        return returnId;
    };

    return {
        newId: newId
    };
    
}());


var io = require('socket.io')();
var dada = this;

// Keep track of which names are used so that there are no duplicates





// export function for listening to the socket
module.exports = function (io) {

    function findClientsSocket(roomId, namespace) {
        var res = [],
            ns = io.of(namespace || "/"); // the default namespace is "/"

        if (ns) {
            for (var id in ns.connected) {
                if (roomId) {
                    var index = ns.connected[id].rooms.indexOf(roomId);
                    if (index !== -1) {
                        res.push(ns.connected[id]);
                    }
                } else {
                    res.push(ns.connected[id]);
                }
            }
        }
        return res;
    }

    /*
    var testIt = (function () {

        var log = function (obj) {
            console.log(io);
        };

        return {
            log: log
        };
    }());
    */

    var theRoom = 'some-room';
    var defaultNsps = '/';

    io.on('connection', function (socket) {

        console.log('');
        console.log('NEW CONNECTION');
        console.log('');
        console.log(socket.handshake.query);
        console.log('joining ', theRoom);
        socket.join(theRoom);

        var user;

        function guestUserInit() {

            /* for test only */
            var token = Math.random();

            var userIdToBe = usersService.getGuestUserId();
            user = {
                id: userIdToBe,
                name: userNames.getGuestName(userIdToBe),
                socketId: socket.id,
                token: token
            };
            console.log('inside guestUserInit() - before');
            usersService.updateUser(user);
            console.log('inside guestUserInit() - after');

        }

        if (socket.handshake.query.token) {
            console.log('socket.handshake.query.token FOUND!');
            console.log('socket.handshake.query.token FOUND!');
            console.log('socket.handshake.query.token FOUND!');
            user = usersService.findUserByToken(socket.handshake.query.token);
            if (!user) {
                console.log('returned no user - guestUserInit anyway.');
                guestUserInit();
            }

        } else {

            guestUserInit();

        }

        console.log('user.id: ' + user.id);
        console.log(user);
        //console.log(io.nsps[defaultNsps].adapter.rooms[theRoom]);
        //console.log(io.sockets.connected[socketId]);
        console.log('socket.id: ' + socket.id);
        console.log('socket.transport: ' + socket.conn.transport.name);

        //testIt.log();

        socket.on('connect', function () {
            console.log('socket connect event');
        });

        // send the new user their name and a list of users
        function sendInit() {
            console.log('emitting INIT data');
            console.log('SENDING CHAT-INIT - WITH USERNAME: ' + user.name);
            socket.emit('chatInit', {
                oldUpdateUsersDate: oldUpdateUsersDate,
                newUpdateUsersDate: lastUpdateUsersDate,
                myself: user,
                usersCont: {
                    users: users
                }
            });
            console.log(user.token);
            console.log(user.token);
            console.log('init sent - name: ' + user.name);
        };
        sendInit();

        socket.on('chatInitRequest', function () {
            console.log('chatInitRequest RECIEVED');
            sendInit();
        });

        function adminInit() {
            console.log('emitting adminInit data');
            socket.emit('adminInit', {
                oldUpdateUsersDate: oldUpdateUsersDate,
                newUpdateUsersDate: lastUpdateUsersDate,
                usersCont: {
                    users: users
                }
            });
        };

        socket.on('adminInitRequest', function () {
            console.log('chatInitRequest RECIEVED');
            adminInit();
        });

        /*
        console.log(user);
        console.log(users);
        */

        // notify other clients that a new user has joined
        socket.broadcast.emit('user:join', {
            oldUpdateUsersDate: oldUpdateUsersDate,
            newUpdateUsersDate: lastUpdateUsersDate,
            user: {
                id: user.id,
                name: user.name
            }
        });
        
        socket.on('userIsTyping', function() {
            socket.broadcast.emit('userIsTyping', {
                oldUpdateUsersDate: oldUpdateUsersDate,
                newUpdateUsersDate: lastUpdateUsersDate,
                user: {
                    id: user.id,
                    name: user.name,
                    isTyping: true
                }
            });
        });

        // broadcast a user's message to other users
        socket.on('send:message', function (data) {
            socket.broadcast.emit('send:message', {
                userId: user.id,
                msgId: messageService.newId(),
                username: user.name,
                text: data.message
            });
        });

        // validate a user's name change, and broadcast it on success
        socket.on('changeRequest:name', function (data, fn) {
            if (userNames.claim(user.id, data.name)) {
                var oldName = user.name;
                user.name = data.name;
                userNames.free(oldName);
                usersService.updateUser(user);

                socket.broadcast.emit('change:name', {
                    oldUpdateUsersDate: oldUpdateUsersDate,
                    newUpdateUsersDate: lastUpdateUsersDate,
                    oldName: oldName,
                    user: {
                        id: user.id,
                        name: user.name
                    }
                });

                fn({
                    myself: user,
                    oldUpdateUsersDate: oldUpdateUsersDate,
                    newUpdateUsersDate: lastUpdateUsersDate
                });
            } else {
                /* fn - need to review... */
                fn(false);
            }
        });

        socket.on('updateFromUser', function (data, fn) {
            console.log('updateFromUser');
            console.log(data);
            usersService.updateUser(data.user);

            socket.broadcast.emit('userUpdate', {
                oldUpdateUsersDate: oldUpdateUsersDate,
                newUpdateUsersDate: lastUpdateUsersDate,
                user: data.user
            });

            /*
            TO BE?
            fn({
                oldUpdateUsersDate: oldUpdateUsersDate,
                newUpdateUsersDate: lastUpdateUsersDate
            });
            */

        });

        var pathToManifestAppcache = "manifest.appcache";
        socket.on('updateManifest', function () {
            console.log('updatingManifest');
            updateManifest(pathToManifestAppcache, function (err, res) {
                if (err) {
                    console.log('error occured: ' + err);
                    socket.emit('updateManifestResult', {
                        status: 'error'
                    });
                }
                if (res === 'ok') {
                    console.log('updateManifest complete - sending OK back to client');
                    socket.emit('updateManifestResult', {
                        status: 'ok'
                    });
                }
            });
        });

        /* latency checker */
        socket.on('ping', function (data) {
            socket.emit('pong', data);
        });

        /* latency checker */
        socket.on('updateGeoloc', function (data) {
            console.log('updateGeoloc recieved');
            console.log(data);
            usersService.updateGeoloc(userId, data);
        });

        socket.on('requestUsers', function (data) {
            console.log('user requested users');
            socket.emit('usersUpdate', {
                oldUpdateUsersDate: oldUpdateUsersDate,
                newUpdateUsersDate: lastUpdateUsersDate,
                usersCont: {
                    users: users
                }
            });
        });

        // clean up when a user leaves, and broadcast it to other users
        socket.on('disconnect', function (reason) {
            console.log('a user left becasue: ' + reason);
            socket.broadcast.emit('user:left', {
                id: user.id,
                name: user.name
            });
            userNames.free(user.name);
        });
        /*
        setInterval(function () {
            //console.log(socket.client.conn.transport.constructor.name);
            console.log(socket.conn.transport.name);
            
        }, 1000);
        */
    });

    /*
    setInterval(function () {
        // console.log(io.of(defaultNsps).adapter.rooms[theRoom]);
        console.log(io.nsps[defaultNsps].adapter.rooms[theRoom]);
        if (io.nsps[defaultNsps].adapter.rooms[theRoom]) {
            console.log(Object.keys(io.nsps[defaultNsps].adapter.rooms[theRoom]).length);
        }
    }, 1000);
    */

};