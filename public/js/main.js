console.log('loading main.js');

/*
require.config({

  // alias libraries paths
    paths: {
        socketIO: '/socket.io/socket.io',
		angular: '../bower_components/angular/angular',
		angularRoute: '../bower_components/angular-route/angular-route',
		angularSocketIO: '../bower_components/angular-socket-io/socket',
        app: '../js/app'
    },
    // angular does not support AMD out of the box, put it in a shim
    shim: {
        'socketIO': {exports: 'io'},
        'angular': {exports: 'angular'},
		'angularRoute': {deps: ['angular']},
		'angularSocketIO': {
			deps:['angular'],
			'exports':'angular.mock'
		}
    },
    // kick start application
    deps: ['../js/bootstrap']
});

define([
    'socketIO',
    'angular',
    'angularRoute',
    'angularSocketIO',
], function( io, angular, ngRoute, socketFactory ) {
 
console.log(io);
console.log(angular);
console.log('loading app.js');

    
angular.module('myApp', [
  'ngRoute',
  'myApp.controllers',
  'myApp.filters',
  'myApp.services',
  'myApp.directives',

  // 3rd party dependencies
  'btford.socket-io'
]).
config(function ($routeProvider, $locationProvider) {
  $routeProvider.
    when('/view1', {
      templateUrl: 'partials/partial1',
      controller: 'MyCtrl1'
    }).
    when('/view2', {
      templateUrl: 'partials/partial2',
      controller: 'MyCtrl2'
    }).
      when('/chat', {
      templateUrl: 'partials/chat',
      controller: 'chatCtrl'
    }).
    when('/admin', {
      templateUrl: 'admin',
      controller: 'adminCtrl'
    }).
    otherwise({
      redirectTo: '/view1'
    });

  $locationProvider.html5Mode(true);
});
 
 
      //Ready to write Backbone Models and Socket.io communication protocol in here :)
 
    
 
});
*/

/*
requirejs.config({
	paths: {
        socketIO: '/socket.io/socket.io',
		angular: '../bower_components/angular/angular',
		angularRoute: '../bower_components/angular-route/angular-route',
		angularSocketIO: '../bower_components/angular-socket-io/socket',
        app: '../js/app',
        services: '../js/services',
        controllers: '../js/controllers',
        filters: '../js/filters',
        directives: '../js/directives'
	},
	shim: {
		'angular' : {'exports' : 'angular'},
		'angularRoute': ['angular'],
		'angularSocketIO': {
			deps:['angular'],
			'exports':'angular.mock'
		},
        'app': ['angular'],
        'services': ['app'],
        'controllers': ['services'],
        'filters': ['controllers'],
        'directives': ['filters']
	},
	priority: [
		"angular"
	]
});
*/

/*
require(['angular',
          ], function () {
    var myApp = angular.module('myApp', []);
    console.log('all loaded!');
            
});
*/

/*
require(['angular',
         'app',
         'angularRoute',
         'services',
         'controllers',
         'filters',
         'directives'
        ], function (angular) {
    console.log('all loaded!');
    var module = angular.module('myApp', []);
            
});
*/

/*
requirejs.config({
  shim: {
    'bower_components/angular/angular.js': ['/socket.io/socket.io.js'],
    'bower_components/angular-route/angular-route.js': ['bower_components/angular/angular.js'],
    'bower_components/angular-socket-io/socket.js': ['bower_components/angular/angular.js','bower_components/angular-route/angular-route.js'],
    'js/app.js': ['bower_components/angular-route/angular-route.js'],
    'js/services.js': ['js/app.js'],
    'js/controllers.js': ['js/services.js'],
    'js/filters.js': ['js/controllers.js'],
    'js/directives.js': ['js/filters.js']
  }
});

require(['js/app.js',
         'js/services.js',
         'js/controllers.js',
         'js/filters.js',
         'js/directives.js'
        ], function () {
    
    console.log('all loaded!');
            
});
*/

/*
  script(src='/socket.io/socket.io.js')
  script(src='bower_components/angular/angular.js')
  script(src='bower_components/angular-route/angular-route.js')
  script(src='bower_components/angular-socket-io/socket.js')
  script(src='js/app.js')
  script(src='js/services.js')
  script(src='js/controllers.js')
  script(src='js/filters.js')
  script(src='js/directives.js')
  */