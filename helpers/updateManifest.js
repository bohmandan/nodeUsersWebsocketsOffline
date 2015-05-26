var fs = require('fs');

var updateManifest = function (pathToManifestAppcache, callback) {
    'use strict';
    console.log('updateManifest called!');
    fs.readFile(pathToManifestAppcache, function (err, data) { // read file to memory
        if (err) {
            if (callback && typeof (callback) === "function") {
                callback(err);
                return;
            }
        } else {
            data = data.toString(); // stringify buffer
            var position = data.indexOf('\n'); // find position of new line element
            //console.log('firstPosition: '+position);
            if (position !== -1) { // if new line element found
                var firstLine = data.substr(0, position); // subtract string based on first line length
                //console.log(firstLine);
                var firstLineNewLine = firstLine + '\n';
                data = data.substr(position + 1); // subtract string based on first line length
                position = data.indexOf('\n'); // find position of new line element
                //console.log('secondPosition: '+position);
                var secondLine = data.substr(0, position); // subtract string based on first line length
                data = data.substr(position + 1); // subtract string once again based on first line length
                var commentChar = secondLine.indexOf('# KEEP THIS ON SECOND LINE AND DO NOT EDIT - NEW VERSION UPDATED:'); // make sure the line is a commented one.
                if (commentChar !== -1) {
                    var d = new Date();
                    var newTimeLine = '# KEEP THIS ON SECOND LINE AND DO NOT EDIT - NEW VERSION UPDATED: ' + d + '\n';
                    data = newTimeLine.concat(data); // subtract string based on first line length
                    data = firstLineNewLine.concat(data); // subtract string based on first line length
                    fs.writeFile(pathToManifestAppcache, data, function (err) { // write file
                        if (err) { // if error, report
                            if (callback && typeof (callback) === "function") {
                                callback(err);
                                return;
                            }
                        } else {
                            if (callback && typeof (callback) === "function") {
                                console.log('finished - returning ok.');
                                callback(null, 'ok');
                                return;
                            }
                        }
                    });
                }
            } else {
                err = 'no lines found';
                if (callback && typeof (callback) === "function") {
                    callback(err);
                    return;
                }
            }
        }
    });
};
 
module.exports = updateManifest;