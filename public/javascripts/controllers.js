console.log('loading controllers.js');

//var dater = require('../helpers/dater');
//define(['helpers/dater.js'],function (require) {
//define(['./app'], function (app) {

/* REQUIRE later */
window.offlineApp = window.axiell || {};

window.offlineApp.helpers = window.offlineApp.helpers || {};

window.offlineApp.helpers.hashCode = function (s) {
    //'use strict'; - remove for now, angular socket io issue passing function as argument
    return s.split("").reduce(function (a, b) {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
    }, 0);
}

/* create global object */
window.offlineApp.helpers.dater = (function (thenBeforeCheck) {
    //'use strict'; - remove for now, angular socket io issue passing function as argument
    var then;

    function isDate(val) {
        console.log('isDate called: ' + val);
        return !isNaN(val.getMonth());
    }

    function isString(val) {
        return (typeof val === 'string');
    }
    if (thenBeforeCheck) {
        if (isString(thenBeforeCheck)) {
            then = new Date(thenBeforeCheck);
        } else {
            then = thenBeforeCheck;
        }
        if (isDate(then)) {
            var now = new Date();
            var difference = (now - then);
            var today = (now.toDateString() == then.toDateString());
            var yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            var isYesterday = (now.toDateString() == yesterday.toDateString());
            if (difference < 3600000) {
                /* in latest hour, return minutes */
                var minutes = Math.floor((difference / 1000) / 60);
                var returnString = minutes + ' minutes ago';
                return returnString;
            } else if (today) {
                var hours = then.getHours();
                var minutes = then.getMinutes();
                var hourMinutes = then;
                var returnString = 'Today, at ' + hours + ':' + minutes;
                return returnString;
            } else if (isYesterday) {
                var hours = then.getHours();
                var minutes = then.getMinutes();
                var hourMinutes = then;
                var returnString = 'Yesterday, at ' + hours + ':' + minutes;
                return returnString;
            } else {
                var date = then.toLocaleDateString();
                var hours = then.getHours();
                var minutes = then.getMinutes();
                var hourMinutes = then;
                var returnString = date + ', at ' + hours + ':' + minutes;
                return returnString;
            }

        } else {
            //console.log('then exist but not a dateObj in the end');
            return false;
        }

    } else {
        return false;
    }
});


/* latency checker - START */
/* create global object */
window.offlineApp.helpers.pingIt = (function () {

    /* ***************** */
    /* private variables */
    /* ***************** */
    var _timer;

    /* ***************** */
    /* public functions  */
    /* ***************** */
    function start(socket, $scope) {
        $scope.ping = {
            buttonText: 'Stop',
            pingValueMs: '-'
        };
        if (_timer) {
            clearInterval(_timer);
        }
        _timer = setInterval(function () {
            var startTime = Date.now();
            socket.emit('ping', {
                startTime: startTime
            });
            //attach listener to pong
            socket.on('pong', function (data) {
                var startTimeBack = data.startTime;
                //check to make sure we dont use the wrong ping
                if (startTimeBack === startTime) {
                    //calculate difference
                    var latency = Date.now() - data.startTime;
                    //update angular scope with ping data
                    $scope.ping.pingValueMs = latency;
                }
            });
        }, 2000);
        return true;
    }

    function stop(socket, $scope) {
        $scope.ping = {
            buttonText: 'Start',
            pingValueMs: '-'
        };
        clearInterval(_timer);
        return true;
    }
    /* ************************************** */
    /* return public functions and variables  */
    /* ************************************** */
    return {
        /* init function - can be run with new configuration object */
        start: start,
        stop: stop
        /* public var */
        /* hasRan: function(x) { return hasRan; } */
    };

})();

/* latency checker - END */

window.offlineApp.helpers.appCacheStatus = (function () {

    var webAppCacheStatus = '',
        webAppCacheMonitorStart,
        _updateStatus,
        $scope = '',
        webappCache = window.applicationCache;

    _updateStatus = function () {
        console.log('_updateStatus');
        console.log(webAppCacheStatus);
        $scope.cachestatus = webAppCacheStatus;
    }

    webAppCacheMonitorStart = function (intScope) {
        $scope = intScope;
        console.log('webAppCacheMonitorStart');
        return true;
    }

    webAppCacheStatus = {
        status: "notSupported",
        text: "Not supported"
    };
    if (window.applicationCache) {
        var oAppCache = window.applicationCache;
        switch (oAppCache.status) {
        case oAppCache.UNCACHED:
            webAppCacheStatus = {
                status: "uncached",
                text: "Not cached"
            };
            break;
        case oAppCache.IDLE:
            webAppCacheStatus = {
                status: "idle",
                text: "Idle"
            };
            break;
        case oAppCache.CHECKING:
            webAppCacheStatus = {
                status: "checking",
                text: "Checking..."
            };
            break;
        case oAppCache.DOWNLOADING:
            webAppCacheStatus = {
                status: "downloading",
                text: "Downloading"
            };
            break;
        case oAppCache.UPDATEREADY:
            webAppCacheStatus = {
                status: "updateready",
                text: "Update ready"
            };
            break;
        case oAppCache.OBSOLETE:
            webAppCacheStatus = {
                status: "obsolete",
                text: "Obsolete"
            };
            break;
        default:
            webAppCacheStatus = {
                status: oAppCache.status.toString(),
                text: "Unexpected Status ( " + oAppCache.status.toString() + ")"
            };
            break;
        }
    }

    function noupdateCache() {
        console.log("No update to cache found");
        _updateStatus();
        console.log('loader hide - timeout');
    }

    function doneCache() {
        console.log("Cache has finished downloading");
        _updateStatus();
        console.log('loader hide - timeout');
    }

    function progressCache() {
        console.log('loader show');
        _updateStatus();
        console.log("Downloading cache...");
    }

    function updateCache() {
        _updateStatus();
        webappCache.swapCache();
        console.log('loader show');
        _updateStatus();
        console.log("Cache has been updated due to a change found in the manifest");
        console.log('loader hide - timeout');
    }

    function errorCache() {
        console.log('loader show');
        _updateStatus();
        console.log("You're either offline or something has gone horribly wrong.");
    }

    function checkingCache() {
        console.log('loader show');
        _updateStatus();
        console.log("Checking cache.");
    }

    function obsoleteCache() {
        console.log('loader show');
        _updateStatus();
        console.log("Obsolete cache.");
    };

    webappCache.addEventListener("progress", progressCache, false);
    webappCache.addEventListener("cached", doneCache, false);
    webappCache.addEventListener("noupdate", noupdateCache, false);
    webappCache.addEventListener("updateready", updateCache, false);
    webappCache.addEventListener("checking", checkingCache, false);
    webappCache.addEventListener("error", errorCache, false);
    webappCache.addEventListener("obsolete", obsoleteCache, false);

    /* ************************************** */
    /* return public functions and variables  */
    /* ************************************** */
    return {
        /* init function - can be run with new configuration object */
        webAppCacheMonitorStart: webAppCacheMonitorStart,
        webAppCacheStatus: function () {
            return webAppCacheStatus
        }
    };

})();


/* REQUIRE LATER */


//define(['angular'], function (angular) {
//'use strict'; - remove for now, angular socket io issue passing function as argument


function DialogController($scope, $mdDialog) {
  $scope.hide = function() {
    $mdDialog.hide();
  };
  $scope.cancel = function() {
    $mdDialog.cancel();
  };
  $scope.answer = function(answer) {
    $mdDialog.hide(answer);
  };
};

/* Controllers */

//angular.module('myApp.controllers', []).controller('AppCtrl', function ($scope, $mdSidenav, socket, dataFactory, $interval, $timeout) {
angular.module('myApp.controllers', []).controller('AppCtrl', function ($scope, $mdSidenav, $mdBottomSheet, $mdDialog, $mdToast, socket, dataFactory, $interval, $timeout) {
    
    $scope.dataStore = dataFactory.dataStore;
    
    /* angular material -- START */
    $scope.toggleSidenav = function(menuId) {
        $mdSidenav(menuId).toggle();
    };
    $scope.menu = [
    {
      link : '',
      title: 'Dashboard',
      icon: 'dashboard'
    },
    {
      link : '',
      title: 'Friends',
      icon: 'group'
    },
    {
      link : '',
      title: 'Messages',
      icon: 'message'
    }
  ];
  $scope.admin = [
    {
      link : '',
      title: 'Trash',
      icon: 'delete'
    },
    {
      link : 'showListBottomSheet($event)',
      title: 'Settings',
      icon: 'settings'
    }
  ];
  $scope.showAdd = function(ev) {
    $mdDialog.show({
      controller: DialogController,
      template: '<md-dialog aria-label="Mango (Fruit)"> <md-content class="md-padding"> <form name="userForm"> <div layout layout-sm="column"> <md-input-container flex> <label>First Name</label> <input ng-model="user.firstName" placeholder="Placeholder text"> </md-input-container> <md-input-container flex> <label>Last Name</label> <input ng-model="theMax"> </md-input-container> </div> <md-input-container flex> <label>Address</label> <input ng-model="user.address"> </md-input-container> <div layout layout-sm="column"> <md-input-container flex> <label>City</label> <input ng-model="user.city"> </md-input-container> <md-input-container flex> <label>State</label> <input ng-model="user.state"> </md-input-container> <md-input-container flex> <label>Postal Code</label> <input ng-model="user.postalCode"> </md-input-container> </div> <md-input-container flex> <label>Biography</label> <textarea ng-model="user.biography" columns="1" md-maxlength="150"></textarea> </md-input-container> </form> </md-content> <div class="md-actions" layout="row"> <span flex></span> <md-button ng-click="answer(\'not useful\')"> Cancel </md-button> <md-button ng-click="answer(\'useful\')" class="md-primary"> Save </md-button> </div></md-dialog>',
      targetEvent: ev,
    })
    .then(function(answer) {
      $scope.alert = 'You said the information was "' + answer + '".';
    }, function() {
      $scope.alert = 'You cancelled the dialog.';
    });
  };
    
    $scope.showActionToast = function() {
        var toast = $mdToast.simple()
              .content('Action Toast!')
              .action('OK')
              .highlightAction(false)
              .position('right');
        $mdToast.show(toast).then(function() {
          console.log('You clicked \'OK\'.');
        });
    };
    $scope.showActionToast();
    
    $scope.showAlert = function(ev) {
        $mdDialog.show(
            $mdDialog.alert()
                .parent(angular.element(document.body))
                .title('This is an alert title')
                .content('You can specify some description text in here.')
                .ariaLabel('Alert Dialog Demo')
                .ok('Got it!')
                .targetEvent(ev)
        );
    };
    //$scope.showAlert();
    
    /* angular material -- END */

    function updateOnlineStatus(event) {
        if (navigator.onLine === true) {
            $scope.onlinestatus = {
                online: true,
                text: 'Internetconnection online'
            }
        } else if (navigator.onLine === false) {
            $scope.onlinestatus = {
                online: false,
                text: 'Internetconnection offline'
            }
        }
    }
    updateOnlineStatus();
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    $scope.cachestatus = {
        status: 'hellostatus',
        text: 'hellotext'
    }
    offlineApp.helpers.appCacheStatus.webAppCacheMonitorStart($scope);


    $scope.usersService = (function () {

        var _updateUsers = function (users) {
            $scope.users = users;
            for (var i = 0; i < $scope.users.length; i++) {
                if ($scope.users[i].id === $scope.myself.id) {
                    $scope.users[i].isMyself = true;
                }
            }
            localStorage.setItem('users', JSON.stringify($scope.users));
        };

        var _setLastUpdateUsersDate = function (date) {
            console.log('_setLastUpdateUsersDate with date: ' + date);
            $scope.lastUpdateUsersDate = date;
            localStorage.setItem('lastUpdateUsersDate', date);
        };

        var _oldUpdateUsersDateUpToDate = function (datesData) {
            if (($scope.lastUpdateUsersDate === datesData.oldUpdateUsersDate) || ($scope.lastUpdateUsersDate === datesData.newUpdateUsersDate)) {
                if ($scope.lastUpdateUsersDate === datesData.oldUpdateUsersDate) {
                    console.log('_oldUpdateUsersDateUpToDate done, $scope.lastUpdateUsersDate equal to datesData.oldUpdateUsersDate');
                    console.log($scope.lastUpdateUsersDate + ' - $scope.lastUpdateUsersDate');
                    console.log(datesData.oldUpdateUsersDate + ' - datesData.oldUpdateUsersDate');
                } else {
                    console.log('_oldUpdateUsersDateUpToDate done, $scope.lastUpdateUsersDate equal to datesData.newUpdateUsersDate');
                    console.log($scope.lastUpdateUsersDate + ' - $scope.lastUpdateUsersDate');
                    console.log(datesData.newUpdateUsersDate + ' - datesData.newUpdateUsersDate');
                }
                
                return true;
            } else {
                console.log('_oldUpdateUsersDateUpToDate done, $scope.lastUpdateUsersDate NOT equal to any datesData dates.');
                    console.log($scope.lastUpdateUsersDate + ' - $scope.lastUpdateUsersDate');
                    console.log(datesData.oldUpdateUsersDate + ' - datesData.oldUpdateUsersDate');                
                    console.log(datesData.newUpdateUsersDate + ' - datesData.newUpdateUsersDate');
                return false;
            }
        };

        /*
           
        var _addUser = function (user) {

                $scope.users.push(user);
                console.log('adding user to users array - after');
        };
        
        */

        var _sendUpdateMyself = function (myself) {
            console.log('_sendUpdateMyself triggered');
            console.log($scope.myself);
            socket.emit('updateFromUser', {
                user: $scope.myself
            }, function (data) {
                if (!data) {
                    console.log('_sendUpdateMsyself ERROR!');
                } else {
                    console.log('_sendUpdateMyself OK!');
                    console.log(data);
                    $scope.usersService.updateUser({
                        user: $scope.myself,
                        oldUpdateUsersDate: data.oldUpdateUsersDate,
                        newUpdateUsersDate: data.newUpdateUsersDate
                    });
                }
            });
        };

        var updateMyself = function (data) {
            console.log('updateMyself - with data: ');
            console.log(data.myself);
            if ($scope.myself) {
                console.log('yes - $scope.myself exist');
                if (!$scope.myself.geoloc && data.myself.geoloc) {
                    console.log('no - $scope.myself.geoloc does not exist, yes data.myself.geoloc exist');
                    $scope.myself.geoloc = data.myself.geoloc;
                    $interval(
                        console.log('updating interval time'),
                        $scope.$apply(function () {
                            $scope.myself.geoloc = data.myself.geoloc
                        }), 5000);
                } else if (data.myself.geoloc) {
                    console.log('yes - $scope.myself.geoloc does exist');
                    if ($scope.myself.geoloc.lastUpdateDate < data.myself.geoloc.latestUpdateDate) {
                        console.log('yes - $scope.myself.geoloc.lastUpdateDate is less then data.myself date - the new data');
                        $scope.myself.geoloc = data.myself.geoloc;
                        $interval(
                            console.log('updating interval time'),
                            $scope.$apply(function () {
                                $scope.myself.geoloc = data.myself.geoloc
                            }), 5000);
                    }
                }
                console.log('applying the rest.');
                $scope.$apply(function () {
                    $scope.myself.name = data.myself.name ? data.myself.name : $scope.myself.name;
                    $scope.myself.id = data.myself.id ? data.myself.id : $scope.myself.id;
                    $scope.myself.socketId = data.myself.socketId ? data.myself.socketId : $scope.myself.socketId;
                });
            } else {
                $scope.$apply(function () {
                    $scope.myself = data.myself;
                });
            }
            if (data.myself.token) {
                console.log('data.myself.token true');
                if (data.myself.token != window.sessionStorage.getItem('token')) {
                    console.log('updating token: ' + data.myself.token);
                    console.log('old token from session storage: ' + window.sessionStorage.getItem('token'));
                    sessionStorage.setItem('token', data.myself.token);
                } else {
                    console.log('data.myself.token equal sessionStorage token');
                }
                /* after - delete it */
                delete data.myself.token;
            } else {
                console.log('data.myself.token false');
            }
            // update myself in users array
            localStorage.setItem('myself', JSON.stringify($scope.myself));
            if (data.sendUpdateMyself) {
                /* needs to send myself as well as missing latest dates */
                _sendUpdateMyself();
            } else {
                /* update immediately */
                $scope.usersService.updateUser({
                    user: data.myself,
                    oldUpdateUsersDate: data.oldUpdateUsersDate,
                    newUpdateUsersDate: data.newUpdateUsersDate
                });
            }
            localStorage.setItem('myself', JSON.stringify($scope.myself));
        };

        var updateUsers = function (data) {
            console.log('updateUsers retrieved');
            console.log(data);
            if ($scope.lastUpdateUsersDate) {
                if (_oldUpdateUsersDateUpToDate({oldUpdateUsersDate: data.oldUpdateUsersDate, newUpdateUsersDate: data.newUpdateUsersDate})) {
                    _setLastUpdateUsersDate(data.newUpdateUsersDate);
                    _updateUsers(data.usersCont.users);
                    console.log('users updated!');
                } else {
                    _setLastUpdateUsersDate(data.newUpdateUsersDate);
                    socket.emit('requestUsers');
                    console.log('new request sent.');
                }
            } else {
                console.log('no $scope.lastUpdateUsersDate');
                _setLastUpdateUsersDate(data.newUpdateUsersDate);
                _updateUsers(data.usersCont.users);
            }
        };

        var updateUser = function (data) {
            console.log(data.user.name);
            console.log(data.user.id);
            console.log(data);
            if (_oldUpdateUsersDateUpToDate({oldUpdateUsersDate: data.oldUpdateUsersDate, newUpdateUsersDate: data.newUpdateUsersDate})) {
                _setLastUpdateUsersDate(data.newUpdateUsersDate);                
                var addToArray = true;
                console.log('starting loop through $scope.users');
                angular.forEach($scope.users, function(user) {
                    if (user.id === data.user.id) {
                        /* user with id exist - update */
                        user.name = data.user.name ? data.user.name : user.name;
                        user.geoloc = data.user.geoloc ? data.user.geoloc : user.geoloc;
                        user.isTyping = data.user.isTyping ? true : false;
                        addToArray = false;
                        console.log('users updated! - user found and updated in array');
                    }
                });
                if (addToArray) {
                    // ok calling internal function _addUser
                    //_addUser(data.user);
                    $scope.users.push(data.user);
                    console.log('users updated! - user not found in array so added to array');
                }
            } else {
                _setLastUpdateUsersDate(data.newUpdateUsersDate);
                socket.emit('requestUsers');
                console.log('new request sent.');
            }
        };

        var loadData = function () {
            var result,
                myselfJSON = localStorage.getItem('myself');
            console.log('string myselfJSON from localStorage: ' + myselfJSON);
            if (myselfJSON) {
                $scope.myself = JSON.parse(myselfJSON);
            }
            var lastUpdateUsersDateObj = localStorage.getItem('lastUpdateUsersDate');
            console.log('string lastUpdateUsersDateJSON from localStorage: ' + lastUpdateUsersDateObj);
            if (lastUpdateUsersDateObj) {
                $scope.lastUpdateUsersDate = lastUpdateUsersDateObj;
            } else {
                $scope.lastUpdateUsersDate = false;
            }
            var usersJSON = localStorage.getItem('users');
            console.log('string usersJSON from localStorage: ' + usersJSON);
            if (usersJSON) {
                $scope.users = JSON.parse(usersJSON);
            }
            if ($scope.myself && $scope.lastUpdateUsersDate && $scope.users) {
                console.log('all loaded!');
                result = true;
            } else {
                console.log('sorry, not all loaded...');
                result = false;
            }
            return result;
        };

        return {
            updateUsers: updateUsers,
            updateUser: updateUser,
            updateMyself: updateMyself,
            loadData: loadData
        };

    })();


    /* GEOLOCATION START */
    //require helper dater
    $scope.geolocService = (function () {

        function _positionError(e) {
            console.log(e);
        }

        function _positionSuccess(position) {
            var lat = position.coords.latitude;
            var lon = position.coords.longitude;
            var accuracy = position.coords.accuracy;
            console.log('lat: ' + lat + ', lon: ' + lon + ', accuracy: ' + accuracy);
            console.log($scope.myself);
            var myselfUpdate = $scope.myself;
            console.log('before myselfUpdate');
            console.log(myselfUpdate);
            myselfUpdate.geoloc = {
                lastUpdateDate: new Date(),
                lat: lat,
                lon: lon,
                accuracy: accuracy
            }
            var data = {
                myself: myselfUpdate,
                sendUpdateMyself: true
            };
            $scope.usersService.updateMyself(data);
        }

        updateGeoloc = function () {
            if (navigator.geolocation) { //get lat lon of user
                navigator.geolocation.getCurrentPosition(_positionSuccess, _positionError, {
                    enableHighAccuracy: true
                });
            } else {
                console.log("Your browser is ancient and it doesn't support GeoLocation.");
            }
        }

        return {
            updateGeoloc: updateGeoloc
        };

    })();

    /* GEOLOCATION END */


    if ($scope.usersService.loadData() === true) {
        console.log('all loaded true');
        console.log($scope.myself);
        $scope.geolocService.updateGeoloc();
        
    } else {
        console.log('no $scope.myself - sending chatInitRequest');
        socket.emit('chatInitRequest');

    }

    $scope.$on('socket:error', function (ev, data) {
        console.log(ev);
        console.log(data);
    });

    socket.on('send:name', function (data) {
        $scope.myself.name = data.name;
    });

    /* default - offline */
    $scope.connection = {
        connected: false,
        text: 'Disconnected from server'
    }

    socket.on('connect', function () {
        console.log('Got connected!');
        var transport = this.io.engine.transport.name;
        $scope.connection = {
            connected: true,
            text: 'Connected to server',
            transport: transport
        }
    });

    /* ON DISCONNECT - START */
    socket.on('disconnect', function () {
        console.log('Got disconnect!');
        $scope.connection = {
            connected: false,
            text: 'Offline'
        }
        //ping module
        offlineApp.helpers.pingIt.stop();

    });
    /* ON DISCONNECT - END */

    socket.on('chatInit', function (data) {
        console.log('chatInitrecieved');
        console.log('My name: ' + data.myself.name);
        console.log('My token: ' + data.myself.token);
        $scope.usersService.updateMyself(data);
        console.log('lastUpdateUsersDate: ' + data.newUpdateUsersDate);
        $scope.usersService.updateUsers(data);
    });

    socket.on('usersUpdate', function (data) {
        console.log(data.newUpdateUsersDate);
        $scope.usersService.updateUsers(data);
    });

    socket.on('userUpdate', function (data) {
        console.log('userUpdate');
        $scope.usersService.updateUser(data);
    });

    socket.on('user:join', function (dataMsg) {
        console.log('user:join');
        console.log(dataMsg);
        console.log('after data');
        $scope.usersService.updateUser(dataMsg);
        console.log(dataFactory.dataStore);
        dataFactory.updateUser(dataMsg);
        console.log(dataFactory.dataStore);
        
        $scope.messages.push({
            user: 'chatroom',
            text: 'User ' + dataMsg.user.name + ' has joined.'
        });
    });

    socket.on('change:name', function (data) {
        console.log('server sends change:name - $scope.usersService.updateUser(data) will be used');
        console.log('change:name');
        $scope.usersService.updateUser(data);
        //changeName(data.oldName, data.newName);
    });
    
    /* user is typing - reciving */
    socket.on('userIsTyping', function (data) {
        console.log('userIsTyping');
        console.log(data);
        console.log('after data');
        $scope.usersService.updateUser(data);
    });    

}).controller('chatCtrl', function ($scope, socket, dataFactory, $location, $anchorScroll, $timeout) {

    console.log('chatCtrl loaded');
    // Socket listeners
    // ================

    // bind to dataStore
    $scope.dataStore = dataFactory.dataStore;
    window.zeroIt = function() {
        $scope.dataStore.test = 0;
        console.log('local is ZEROED!');
    };

    socket.on('send:message', function (message) {
        console.log(message);
        $scope.messages.push(message);
        $location.hash('msg' + message.msgId);
        $anchorScroll();
        console.log('when message pushed - scroll to bottom IF focus is not on messages. Also implement in update somehow? Create messageService ? ALSO! Make messages flow resizable!');
    });

    // add a message to the conversation when a user disconnects or leaves the room
    socket.on('user:left', function (data) {
        $scope.messages.push({
            user: 'chatroom',
            text: 'User ' + data.name + ' has left.'
        });
        var i, user;
        for (i = 0; i < $scope.users.length; i++) {
            user = $scope.users[i];
            if (user === data.name) {
                $scope.users.splice(i, 1);
                break;
            }
        }
    });

    // Private helpers
    // ===============

    var changeName = function (oldName, newName) {
        // rename user in list of users
        var i;
        for (i = 0; i < $scope.users.length; i++) {
            if ($scope.users[i] === oldName) {
                $scope.users[i] = newName;
            }
        }

        $scope.messages.push({
            user: 'chatroom',
            text: 'User ' + oldName + ' is now known as ' + newName + '.'
        });
    }

    // Methods published to the scope
    // ==============================

    $scope.changeName = function () {
        $scope.isLoadingNewName = true;
        console.log('changeName, socket.emit changeRequest');
        socket.emit('changeRequest:name', {
            name: $scope.newName
        }, function(myselfData) {
            console.log(myselfData);
            if (myselfData) {
                console.log(myselfData);
                //$scope.usersService.updateMyself(dataz);
                dataFactory.updateMyself(myselfData);
                /*
                changeName($scope.myself.name, $scope.newName);

                $scope.myself.name = $scope.newName;
                $scope.newName = '';
                */
            } else {
                alert('There was an error changing your name');
            }
            $scope.isLoadingNewName = false;
        });
        console.log('changeRequest:name SENT!');
    };

    $scope.messages = [];

    $scope.sendMessage = function () {
        socket.emit('send:message', {
            message: $scope.message
        });

        // add the message to our model locally
        $scope.messages.push({
            username: $scope.myself.name,
            text: $scope.message
        });

        // clear message box
        $scope.message = '';
    };
    
    /* user is typing - detect and send */
    $scope.nothingSentIn3sec = true;
    $scope.timeoutRunning = false;
    $scope.userIsTypingSend = function() {
        //send a broadcast each 3s
        var startTimeout = function() {
            if (!$scope.timeoutRunning) {
                $scope.timeoutRunning = true;
                $timeout(function() {
                    $scope.nothingSentIn3sec = true;
                    $scope.timeoutRunning = false;
                }, 3000);
            }
        }
        
        if ($scope.nothingSentIn3sec) {
            $scope.nothingSentIn3sec = false;
            console.log('user is typing');
            socket.emit('userIsTyping');
            console.log('status sent, starting timer to wait 3 seconds');
            startTimeout();
        } else {
            console.log('user is typing');
            console.log('status not sent, wait at most 3 seconds');
        }        
    }
    

    // Destroy scope on destroy
    // ========================

    $scope.$on('$destroy', function (event) {
        socket.removeAllListeners();
        // or something like
        // socket.removeListener(this);
    });

}).controller('pingCtrl', function ($scope, socket) {

    $scope.ping = {
        running: 'false',
        buttonText: 'Start',
        pingValueMs: '-'
    };
    $scope.pingItToggle = function () {
        console.log('pingItToggle clicked');
        console.log($scope.ping);
        if ($scope.ping.running === 'false') {
            console.log('pingItRunning changed to true');
            $scope.ping.running = 'true';
            offlineApp.helpers.pingIt.start(socket, $scope);
        } else {
            console.log('pingItRunning changed to false');
            $scope.ping.running = 'false';
            offlineApp.helpers.pingIt.stop(socket, $scope);
        }
    };
    $scope.reconnect = function () {
        console.log('reconnect clicked');
        socket.socket.connect();
    };
    

    $scope.$on('$destroy', function (event) {
        socket.removeAllListeners();
        // or something like
        // socket.removeListener(this);
    });

}).controller('MyCtrl1', function ($scope, socket) {
    console.log('MyCtrl1');
    socket.on('send:time', function (data) {
        $scope.time = data.time;
    });
}).controller('showCrdCtrl', function ($scope, socket) {
    console.log('showCrdCtrl');
}).controller('adminCtrl', function ($scope, socket) {
    console.log('adminCtrl');

    if (!$scope.users) {
        socket.emit('adminInitRequest');
        console.log('adminInitRequest sent');
    } else {
        console.log('no need');
    };

    socket.on('adminInit', function (data) {
        console.log('adminInitrecieved');
        console.log(data);
        $scope.usersService.updateUsers(data);
    });



    // Methods published to the scope
    // ==============================
    $scope.updateManifest = function () {
        $scope.updateManifestOk = '';
        socket.emit('updateManifest');
        console.log('updateManifest sent');
    };
    /*
    // out for now
    socket.on('updateManifestResult', function (data) {
        console.log(data);
        console.log(data.status);
        $scope.updateManifestResult = data.status;
    });
    */


    // Destroy scope on destroy
    // ========================

    $scope.$on('$destroy', function (event) {
        socket.removeAllListeners();
        // or something like
        // socket.removeListener(this);
    });

}).controller('MyCtrl2', function ($scope, socket) {
    console.log('MyCtrl2');
});