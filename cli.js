#!/usr/bin/env node

'use strict';

var vendorCopy = require('.');
var path = require('path');
var root = process.cwd();
var pkg = require(path.join(root, 'package.json'));

function logDone(items){
    items.forEach(function(item){
        console.log(item.from + ' => ' + item.to);
    });
}

function logError(error){
    console.error('Failed to install vendor modules:', error.stack);
    process.exit(1);
}

vendorCopy(root, pkg.vendorCopy || []).then(logDone, logError);
