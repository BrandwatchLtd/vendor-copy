'use strict';

var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');

function ensureDir(fromTo){
    var toPath = path.dirname(fromTo.to);

    return new Promise(function(resolve, reject){
        mkdirp(toPath, null, function(err){
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

function copyFile(fromTo){
    return new Promise(function(resolve, reject){
        var sourceFile = fs.createReadStream(fromTo.from);
        var targetFile = fs.createWriteStream(fromTo.to);

        sourceFile.on('error', reject);
        targetFile.on('error', reject);
        targetFile.on('close', resolve);

        sourceFile.pipe(targetFile);
    });
}

function ensureDirAndCopy(root, relativeFromTo){
    var fromTo = {
        from: path.join(root, relativeFromTo.from),
        to: path.join(root, relativeFromTo.to)
    };

    return ensureDir(fromTo)
        .then(function(){
            return copyFile(fromTo);
        })
        .then(function(){
            return fromTo;
        });
}

module.exports = function(root, copyItems){
    return Promise.all(copyItems.map(function(relativeFromTo){
        return ensureDirAndCopy(root, relativeFromTo);
    }));
};
