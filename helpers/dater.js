define(function(require, exports, module) {

var dater = function dater(then) {
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
};

module.exports = dater;
    
});