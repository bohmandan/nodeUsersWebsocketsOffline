//define(['angular'], function (angular) {

'use strict';
console.log('loading filters.js');

/* Filters */

angular.module('myApp.filters', []).
    filter('interpolate', function (version) {
        return function (text) {
            return String(text).replace(/\%VERSION\%/mg, version);
        }
    }).
    filter('dater', function () {
        return function (theDate) {
            console.log(theDate);
            if (theDate) {
                return window.offlineApp.helpers.dater(theDate);
            } else {
                return false;
            }
        };
    });