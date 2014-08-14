'use strict';


function Dater(then) {
    var now = new Date();
    var difference = (now - then);
    var today = (now.toDateString() == then.toDateString());
    var yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    var isYesterday = (now.toDateString() == yesterday.toDateString());
    if (difference < 3600000) {
        /* in latest hour, return minutes */
        var minutes = Math.floor((difference/1000)/60);
        var returnString = minutes + ' minutes ago';
        return returnString;
    }
    else if (today) {
        var hours = then.getHours();
        var minutes = then.getMinutes();
        var hourMinutes = then;
        var returnString = 'Today, at '+hours+':'+minutes;
        return returnString;
    }
    else if (isYesterday) {
        var hours = then.getHours();
        var minutes = then.getMinutes();
        var hourMinutes = then;
        var returnString = 'Yesterday, at '+hours+':'+minutes;
        return returnString;
    }
    else {
        var date = then.toLocaleDateString();
        var hours = then.getHours();
        var minutes = then.getMinutes();
        var hourMinutes = then;
        var returnString = date+', at '+hours+':'+minutes;
        return returnString;
    }
}



/* Controllers */

angular.module('myApp.controllers', []).
  controller('AppCtrl', function ($scope, socket) {
    socket.on('send:name', function (data) {
      $scope.name = data.name;
    });
    /* default - offline */
    $scope.connection = {
        connected: false,
        text: 'Offline'
    }
    $scope.cachestatus = {
    status: 'checking',
    text: 'Checking status...'
    }
    socket.on('connect', function() {
        console.log('Got connected!');
        $scope.connection = {
                connected: true,
                text: 'Online'
                }
        
            /* latency checker - START */
            if (pingIt) {
                clearInterval(pingIt);
            }
            var pingIt = setInterval(function() {
              var startTime = Date.now();
                socket.emit('ping', 
                    { startTime: startTime }
                );
              socket.on('pong', function(data) {
                var startTimeBack = data.startTime;
                if (startTimeBack === startTime) {
                    var latency = Date.now() - data.startTime;
                    $scope.ping = {
                        ms: latency
                    }
                }
              });
            }, 2000);
            /* latency checker - END */
        
    });
    /* ON DISCONNECT - START */
    socket.on('disconnect', function() {
          console.log('Got disconnect!');
          $scope.connection = {
                connected: false,
                text: 'Offline'
                }
          clearInterval(pingIt);
    });
    /* ON DISCONNECT - END */
      
    function onUpdateReady() {
      $scope.cachestatus = {
        status: 'newUpdate',
        text: 'New update found - reload.'
      }
    }
    window.applicationCache.addEventListener('updateready', onUpdateReady);
    if(window.applicationCache.status === window.applicationCache.UPDATEREADY) {
        onUpdateReady();
    }
      
    /* GEOLOCATION START */
    function positionError(e) {
          console.log(e);
    }
    function positionSuccess(position) {
        var lat = position.coords.latitude;
        var lon = position.coords.longitude;
        console.log('lat: '+lat+', lon: '+lon);
        var gmLinkVar = 'http://maps.google.com/maps?q='+lat+', '+lon;
        console.log('gmLinkVar: '+gmLinkVar);
        var geolocLS = {
            lastUpdateDate: new Date(),
            lat: lat,
            lon: lon,
            link: gmLinkVar
            }
        localStorage.setItem('geolocLS',JSON.stringify(geolocLS));
        $scope.$apply(function () {
            $scope.geoloc = {
                status: {
                text: 'Current position on Google Maps',
                lastUpdateText: Dater(geolocLS.lastUpdateDate)
                },
                link: gmLinkVar
            }
        });
    }
    function updateGeolocation() {
        if (navigator.geolocation) { //get lat lon of user
              navigator.geolocation.getCurrentPosition(positionSuccess, positionError, { enableHighAccuracy: true });
        } else {
              console.log("Your browser is ancient and it doesn't support GeoLocation.");
        }
    }
    $scope.updateGeolocation = updateGeolocation;
    var geolocLSstring = localStorage.getItem('geolocLS');
    if (!geolocLSstring) {
        console.log('no geolocLS');
        /* geolocation - loading upon reloading page. */
        $scope.geoloc = {
            status: {
                text: 'Loading position...',
                latestUpdate: ''
            }
        }
        /* grab location */
        updateGeolocation();
    }
    else {
        console.log('yes use old geolocLS');
        console.log(geolocLSstring);
        var geolocLS = JSON.parse(geolocLSstring);
        console.log(geolocLS);
        var theDate = geolocLS.lastUpdateDate;
        geolocLS.lastUpdateDate = new Date(theDate);
        console.log(geolocLS);

        $scope.geoloc = {
            status: {
                text: 'Latest position on Google Maps',
                lastUpdateText: Dater(geolocLS.lastUpdateDate)
            },
            link: geolocLS.link
        }
    }
    /* GEOLOCATION END */
  }).
  controller('chatCtrl', function ($scope, socket) {
      
 // Socket listeners
  // ================

  socket.on('init', function (data) {
    $scope.name = data.name;
    $scope.users = data.users;
  });

  socket.on('send:message', function (message) {
    $scope.messages.push(message);
  });

  socket.on('change:name', function (data) {
    changeName(data.oldName, data.newName);
  });

  socket.on('user:join', function (data) {
    $scope.messages.push({
      user: 'chatroom',
      text: 'User ' + data.name + ' has joined.'
    });
    $scope.users.push(data.name);
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
    socket.emit('change:name', {
      name: $scope.newName
    }, function (result) {
      if (!result) {
        alert('There was an error changing your name');
      } else {
        
        changeName($scope.name, $scope.newName);

        $scope.name = $scope.newName;
        $scope.newName = '';
      }
    });
  };

  $scope.messages = [];

  $scope.sendMessage = function () {
    socket.emit('send:message', {
      message: $scope.message
    });

    // add the message to our model locally
    $scope.messages.push({
      user: $scope.name,
      text: $scope.message
    });

    // clear message box
    $scope.message = '';
  };

    // Destroy scope on destroy
    // ========================
    
    $scope.$on('$destroy', function (event) {
        socket.removeAllListeners();
        // or something like
        // socket.removeListener(this);
    });
      
  }).
  controller('MyCtrl1', function ($scope, socket) {
    socket.on('send:time', function (data) {
      $scope.time = data.time;
    });
  }).
  controller('showCrdCtrl', function ($scope, socket) {
      console.log('showCrdCtrl');
  }).
  controller('MyCtrl2', function ($scope, socket) {
      console.log('MyCtrl2');
  });