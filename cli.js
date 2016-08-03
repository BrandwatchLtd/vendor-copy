#!/usr/bin/env node

'use strict';

var vendorCopy = require('.');
var path = require('path');
var root = process.cwd();
var pkg = require(path.join(root, 'package.json'));

var isProduction = process.env.npm_config_production === 'true' || process.env.NODE_ENV === 'production';

function logDone(items) {
    items.forEach(function (item) {
        console.log(item.from + ' => ' + item.to); // eslint-disable-line no-console
    });
}

function logError(error) {
    console.error('Failed to install vendor modules:', error.stack); // eslint-disable-line no-console
    process.exit(1);
}

var toCopy = pkg.vendorCopy || [];

if (!isProduction) {
    toCopy = toCopy.concat(pkg.devVendorCopy || []);
}

vendorCopy(root, toCopy).then(logDone, logError);
