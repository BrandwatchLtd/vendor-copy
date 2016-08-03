'use strict';

var path = require('path');
var mkdirp = require('mkdirp');
var ncp = require('ncp');

function ensureDir(fromTo) {
    var toPath = path.dirname(fromTo.to);

    return new Promise(function (resolve, reject) {
        mkdirp(toPath, null, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

function copyFile(fromTo) {
    return new Promise(function (resolve, reject) {
        ncp(fromTo.from, fromTo.to, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

function ensureDirAndCopy(root, relativeFromTo) {
    var fromTo = {
        from: path.join(root, relativeFromTo.from),
        to: path.join(root, relativeFromTo.to)
    };

    return ensureDir(fromTo)
        .then(function () {
            return copyFile(fromTo);
        })
        .then(function () {
            return fromTo;
        });
}

module.exports = function (root, copyItems) {
    return Promise.all(copyItems.map(function (relativeFromTo) {
        return ensureDirAndCopy(root, relativeFromTo);
    }));
};
