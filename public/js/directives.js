//define(['angular'], function (angular) {
'use strict';
    
    
/* Controllers */

//'use strict';
console.log('loading directives.js');

/* Directives */

angular.module('myApp.directives', []).
  directive('appVersion', function (version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  }).directive('usercontainer', function ($timeout) {
    return {
        restrict: 'EA',
        controller: function($scope, $element){
            
            var timeoutId;
            
            $scope.$watch("user.isTyping", function(isTyping) {
                if (isTyping) {
                console.log($scope.user.name + ' is typing...');
                    timeoutId = $timeout(function() {
                        console.log($scope.user.name + ' stopped typing.');
                        $scope.user.isTyping = false;
                        console.log($scope.user.name);
                    }, 5000);
                }
            });
            
            $element.on('$destroy', function() {
                $timeout.cancel(timeoutId);
            });            
            
        },
      };
  });

