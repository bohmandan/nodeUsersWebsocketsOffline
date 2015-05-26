console.log('loading services.js');

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', []).
factory('socket', function (socketFactory) {
    'use strict';

    var tokenObj;
    if (window.sessionStorage.getItem('token')) {
        console.log('session token found - loaded in query: ' + window.sessionStorage.getItem('token'));
        tokenObj = {
            token: window.sessionStorage.getItem('token')
        }
    }

    return socketFactory({
        ioSocket: io.connect('//localhost:3000/', {
            forceNew: true,
            transports: ['websocket', 'polling'],
            query: tokenObj
        })
    });

}).service('userService', function (socket, $timeout) {

    var store = [],
        dataStore = {
            users: {},
            myself: {},
            test: 1
        };

    var updateTimer = function () {
        dataStore.test++
        // console.log("updateTimer: " + dataStore.test);

        $timeout(updateTimer, 2000);
    };
    updateTimer();    
    
    var _updateUsers = function (users) {
        dataStore.users = users;
        for (var i = 0; i < dataStore.users.length; i++) {
            if (dataStore.users[i].id === dataStore.myself.id) {
                dataStore.users[i].isMyself = true;
            }
        }
        localStorage.setItem('users', JSON.stringify(dataStore.users));
    };    
    
    var _setLastUpdateUsersDate = function (date) {
        console.log('userService - _setLastUpdateUsersDate with date: ' + date);
        dataStore.lastUpdateUsersDate = date;
        localStorage.setItem('lastUpdateUsersDate', date);
    };    
    
    var _oldUpdateUsersDateUpToDate = function (datesData) {
        if ((dataStore.lastUpdateUsersDate === datesData.oldUpdateUsersDate) || (dataStore.lastUpdateUsersDate === datesData.newUpdateUsersDate)) {
            if (dataStore.lastUpdateUsersDate === datesData.oldUpdateUsersDate) {
                console.log('userService - _oldUpdateUsersDateUpToDate done, dataStore.lastUpdateUsersDate equal to datesData.oldUpdateUsersDate');
                console.log(dataStore.lastUpdateUsersDate + ' - dataStore.lastUpdateUsersDate');
                console.log(datesData.oldUpdateUsersDate + ' - datesData.oldUpdateUsersDate');
            } else {
                console.log('userService - _oldUpdateUsersDateUpToDate done, dataStore.lastUpdateUsersDate equal to datesData.newUpdateUsersDate');
                console.log(dataStore.lastUpdateUsersDate + ' - dataStore.lastUpdateUsersDate');
                console.log(datesData.newUpdateUsersDate + ' - datesData.newUpdateUsersDate');
            }

            return true;
        } else {
            console.log('userService - _oldUpdateUsersDateUpToDate done, dataStore.lastUpdateUsersDate NOT equal to any datesData dates.');
            console.log(dataStore.lastUpdateUsersDate + ' - $scope.lastUpdateUsersDate');
            console.log(datesData.oldUpdateUsersDate + ' - datesData.oldUpdateUsersDate');
            console.log(datesData.newUpdateUsersDate + ' - datesData.newUpdateUsersDate');
            return false;
        }
    };
        
            var _sendUpdateMyself = function (myself) {
                
            console.log('_sendUpdateMyself triggered');
            console.log(dataStore.myself);
            socket.emit('updateFromUser', {
                user: dataStore.myself
            }, function (responseData) {
                if (!responseData) {
                    console.log('_sendUpdateMsyself ERROR!');
                } else {
                    console.log('_sendUpdateMyself OK!');
                    console.log(responseData);
                    updateUser({
                        user: dataStore.myself,
                        oldUpdateUsersDate: responseData.oldUpdateUsersDate,
                        newUpdateUsersDate: responseData.newUpdateUsersDate
                    });
                }
            });
        };

        var updateMyself = function (dataMsg) {
            console.log('updateMyself - with dataMsg.myself: ');
            console.log(dataMsg.myself);
            if (dataStore.myself) {
                console.log('yes - dataStore.myself exist');
                if (!dataStore.myself.geoloc && dataMsg.myself.geoloc) {
                    console.log('no - dataStore.myself.geoloc does not exist, yes dataStore.myself.geoloc exist');
                    dataStore.myself.geoloc = dataMsg.myself.geoloc;
                    $interval(
                        console.log('updating interval time'),
                        $scope.$apply(function () {
                            dataStore.myself.geoloc = dataMsg.myself.geoloc
                        }), 5000);
                } else if (dataMsg.myself.geoloc) {
                    console.log('yes - dataStore.myself.geoloc does exist');
                    if (dataStore.myself.geoloc.lastUpdateDate < dataMsg.myself.geoloc.latestUpdateDate) {
                        console.log('yes - dataStore.myself.geoloc.lastUpdateDate is less then dataStore.myself date - the new data');
                        dataStore.myself.geoloc = dataMsg.myself.geoloc;
                        $interval(
                            console.log('updating interval time'),
                            $scope.$apply(function () {
                                dataStore.myself.geoloc = dataMsg.myself.geoloc
                            }), 5000);
                    }
                }
                console.log('applying the rest.');
                $scope.$apply(function () {
                    dataStore.myself.name = dataMsg.myself.name ? dataMsg.myself.name : dataStore.myself.name;
                    dataStore.myself.id = dataMsg.myself.id ? dataMsg.myself.id : dataStore.myself.id;
                    dataStore.myself.socketId = dataMsg.myself.socketId ? dataMsg.myself.socketId : dataStore.myself.socketId;
                });
            } else {
                $scope.$apply(function () {
                    dataStore.myself = dataMsg.myself;
                });
            }
            if (dataMsg.myself.token) {
                console.log('dataMsg.myself.token true');
                if (dataMsg.myself.token != window.sessionStorage.getItem('token')) {
                    console.log('updating token: ' + dataMsg.myself.token);
                    console.log('old token from session storage: ' + window.sessionStorage.getItem('token'));
                    sessionStorage.setItem('token', dataMsg.myself.token);
                } else {
                    console.log('dataMsg.myself.token equal sessionStorage token');
                }
                /* after - delete it */
                delete dataMsg.myself.token;
            } else {
                console.log('dataMsg.myself.token false');
            }
            // update myself in users array
            localStorage.setItem('myself', JSON.stringify(dataStore.myself));
            if (dataMsg.sendUpdateMyself) {
                /* needs to send myself as well as missing latest dates */
                _sendUpdateMyself();
            } else {
                /* update immediately */
                updateUser({
                    user: dataMsg.myself,
                    oldUpdateUsersDate: dataMsg.oldUpdateUsersDate,
                    newUpdateUsersDate: dataMsg.newUpdateUsersDate
                });
            }
            localStorage.setItem('myself', JSON.stringify(dataStore.myself));
        };

        var updateUsers = function (dataMsg) {
            console.log('updateUsers retrieved');
            console.log(dataMsg);
            if (dataStore.lastUpdateUsersDate) {
                if (_oldUpdateUsersDateUpToDate({oldUpdateUsersDate: dataMsg.oldUpdateUsersDate, newUpdateUsersDate: dataMsg.newUpdateUsersDate})) {
                    _setLastUpdateUsersDate(dataMsg.newUpdateUsersDate);
                    _updateUsers(dataMsg.usersCont.users);
                    console.log('users updated!');
                } else {
                    _setLastUpdateUsersDate(dataMsg.newUpdateUsersDate);
                    socket.emit('requestUsers');
                    console.log('new request sent.');
                }
            } else {
                console.log('no dataStore.lastUpdateUsersDate');
                _setLastUpdateUsersDate(dataMsg.newUpdateUsersDate);
                _updateUsers(dataMsg.usersCont.users);
            }
        };
    

    var updateUser = function (dataMsg) {
        console.log(dataMsg.user.name);
        console.log(dataMsg.user.id);
        console.log(dataMsg);
        if (_oldUpdateUsersDateUpToDate({
            oldUpdateUsersDate: dataMsg.oldUpdateUsersDate,
            newUpdateUsersDate: dataMsg.newUpdateUsersDate
        })) {
            _setLastUpdateUsersDate(dataMsg.newUpdateUsersDate);
            var addToArray = true;
            console.log('userService - starting loop through dataStore.users');
            angular.forEach(dataStore.users, function (user) {
                if (user.id === dataMsg.user.id) {
                    /* user with id exist - update */
                    user.name = dataMsg.user.name ? dataMsg.user.name : user.name;
                    user.geoloc = dataMsg.user.geoloc ? dataMsg.user.geoloc : user.geoloc;
                    user.isTyping = dataMsg.user.isTyping ? true : false;
                    addToArray = false;
                    console.log('userService - users updated! - user found and updated in array');
                }
            });
            if (addToArray) {
                // ok calling internal function _addUser
                //_addUser(dataStore.user);
                dataStore.users.push(dataMsg.user);
                console.log('userService - users updated! - user not found in array so added to array');
            }
        } else {
            _setLastUpdateUsersDate(dataMsg.newUpdateUsersDate);
            socket.emit('requestUsers');
            console.log('userService - requestUsers sent.');
        }
    };


    var loadData = function () {
        var result,
            myselfJSON = localStorage.getItem('myself'),
            usersJSON = localStorage.getItem('users'),
            lastUpdateUsersDateObj = localStorage.getItem('lastUpdateUsersDate');
        console.log('userService - string myselfJSON from localStorage: ' + myselfJSON);
        if (myselfJSON) {
            dataStore.myself = JSON.parse(myselfJSON);
        }

        console.log('userService - string lastUpdateUsersDateJSON from localStorage: ' + lastUpdateUsersDateObj);
        if (lastUpdateUsersDateObj) {
            dataStore.lastUpdateUsersDate = lastUpdateUsersDateObj;
        } else {
            dataStore.lastUpdateUsersDate = false;
        }
        console.log('userService - string usersJSON from localStorage: ' + usersJSON);
        if (usersJSON) {
            dataStore.users = JSON.parse(usersJSON);
        }
        if (dataStore.myself && dataStore.lastUpdateUsersDate && dataStore.users) {
            console.log('userService - All loaded!');
            result = true;
        } else {
            console.log('userService - Sorry, not all loaded...');
            result = false;
        }
        return result;
    };
    /* load start - for now */
    if (loadData() === true) {
        console.log('all loaded true');
        console.log(dataStore.myself);
        $scope.geolocService.updateGeoloc();
        
    } else {
        console.log('no $scope.myself - sending chatInitRequest');
        socket.emit('chatInitRequest');

    }
    
    /* test, this should be message service later */
    socket.on('send:message', function (message) {
        console.log(message);
        console.log('INSIDE');
    });
    
    
    socket.on('chatInit', function (data) {
        console.log('chatInitrecieved');
        console.log('My name: ' + data.myself.name);
        console.log('My token: ' + data.myself.token);
        $scope.usersService.updateMyself(data);
        console.log('lastUpdateUsersDate: ' + data.newUpdateUsersDate);
        $scope.usersService.updateUsers(data);
    });

    socket.on('usersUpdate', function (data) {
        console.log('usersUpdate recieved');
        console.log(data.newUpdateUsersDate);
        updateUsers(data);
    });

    socket.on('userUpdate', function (data) {
        console.log('userUpdate username: ' + data.user.name);
        updateUser(data);
    });

    socket.on('user:join', function (dataMsg) {
        console.log('user:join username: ' + data.user.name);
        updateUser(dataMsg);
        
        $scope.messages.push({
            user: 'chatroom',
            text: 'User ' + dataMsg.user.name + ' has joined.'
        });
    });
    
    socket.on('change:name', function (data) {
        console.log('server sends change:name for oldusername: ' + data.user.oldName);
        updateUser(data);
    });
    
    /* user is typing - reciving */
    socket.on('userIsTyping', function (data) {
        console.log('userIsTyping for user: ' + data.user.name);
        updateUser(data);
    });  

    return {

        login: function (user) {
            /*
        $http.post('/user/login', user).then(function(dataStore) {
            return dataStore;
        });
        */
        },
        register: function (user) {
            console.log('user registered!');
            store.push(user);
            console.log(store);
            /*
        $http.post('/user/add', user).then(function(dataStore) {
          if (dataStore.status === "success") {
           alert("OK");
          } else {
           alert("NOT OK");
          }
        });
        */
            return user + 'ZX';
        },
        testare: function() {
            return dataStore.test;
        },
        updateUser: updateUser,
        loadData: loadData,
        dataStore: dataStore

    };
}).
value('version', '0.1');