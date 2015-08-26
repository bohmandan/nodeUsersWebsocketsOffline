//'use strict'; - remove for now, angular socket io issue passing function as argument
console.log('loading app.js');

    
angular.module('myApp', [
  //'ngRoute',
    'ngMaterial',
    'ngMdIcons',
    'myApp.controllers',
    'myApp.filters',
    'myApp.services',
    'myApp.directives'

  // 3rd party dependencies
  //'btford.socket-io'
]).
config(function($mdThemingProvider) {
  var customBlueMap = 		$mdThemingProvider.extendPalette('light-blue', {
    'contrastDefaultColor': 'light',
    'contrastDarkColors': ['50'],
    '50': 'ffffff'
  });
  $mdThemingProvider.definePalette('customBlue', customBlueMap);
  $mdThemingProvider.theme('default')
    .primaryPalette('customBlue', {
      'default': '500',
      'hue-1': '50'
    })
    .accentPalette('pink');
  $mdThemingProvider.theme('input', 'default')
        .primaryPalette('grey')
});
/*.
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
*/