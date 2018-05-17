'use strict';

const path = require('path');
const mkdirp = require('mkdirp');
const ncp = require('ncp');

function ensureDir(fromTo) {
  const toPath = path.dirname(fromTo.to);

  return new Promise((resolve, reject) => {
    mkdirp(toPath, null, err => err ? reject(err) : resolve());
  });
}

function copyFile(fromTo) {
  return new Promise((resolve, reject) => {
    ncp(fromTo.from, fromTo.to, { dereference: true }, err => err ? reject(err) : resolve());
  });
}

function ensureDirAndCopy(root, relativeFromTo) {
  const fromTo = {
    from: path.join(root, relativeFromTo.from),
    to: path.join(root, relativeFromTo.to)
  };

  return ensureDir(fromTo)
    .then(() => copyFile(fromTo))
    .then(() => fromTo);
}

module.exports = function (root, copyItems) {
  return Promise.all(copyItems.map(relativeFromTo => ensureDirAndCopy(root, relativeFromTo)));
};
