'use strict';

var assert = require('assert');
var path = require('path');
var fs = require('fs');
var rimraf = require('rimraf');
var mkdirp = require('mkdirp');
var vendorCopy = require('../');

function readFile(path){
    return new Promise(function(resolve, reject){
        fs.readFile(path, 'utf8', function(err, content){
            if (err) {
                reject(err);
            } else {
                resolve(content);
            }
        });
    });
}

function rmdir(relativePath){
    return new Promise(function(resolve, reject){
        rimraf(path.join(__dirname, relativePath), function(err){
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

function mkdir(relativePath){
    return new Promise(function(resolve, reject){
        mkdirp(path.join(__dirname, relativePath), function(err){
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

function writeFile(relativePath, content){
    return new Promise(function(resolve, reject){
        fs.writeFile(path.join(__dirname, relativePath), content, function(err){
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

describe('vendorCopy', function(){
    beforeEach(function(){
        return rmdir('../test-copy-space/')
            .then(function(){
                return mkdir('../test-copy-space/');
            })
            .then(function(){
                return Promise.all([
                    mkdir('../test-copy-space/source'),
                    mkdir('../test-copy-space/target')
                ]);
            })
            .then(function(){
                return Promise.all([
                    writeFile('../test-copy-space/source/fixture.01.txt', 'fixture 01'),
                    writeFile('../test-copy-space/source/fixture.02.txt', 'fixture 02')
                ]);
            });
    });

    it('is a function', function(){
        assert.equal(typeof vendorCopy, 'function');
    });

    describe('a single file into an existing directory', function(){
        beforeEach(function(){
            var copySpecs = [
                {
                    from: '../test-copy-space/source/fixture.01.txt',
                    to: '../test-copy-space/target/fixture.01.txt'
                }
            ];

            return vendorCopy(__dirname, copySpecs);
        });

        it('copies the file', function(){
            return readFile(path.join(__dirname, '../test-copy-space/target/fixture.01.txt'))
                .then(function(content){
                    assert.equal(content, 'fixture 01');
                });
        });
    });

    describe('multiple files into an existing directory', function(){
        beforeEach(function(){
            var copySpecs = [
                {
                    from: '../test-copy-space/source/fixture.01.txt',
                    to: '../test-copy-space/target/fixture.01.txt'
                },
                {
                    from: '../test-copy-space/source/fixture.02.txt',
                    to: '../test-copy-space/target/fixture.02.txt'
                }
            ];

            return vendorCopy(__dirname, copySpecs);
        });

        it('copies the files', function(){
            var promises = [
                readFile(path.join(__dirname, '../test-copy-space/target/fixture.01.txt')),
                readFile(path.join(__dirname, '../test-copy-space/target/fixture.02.txt'))
            ];

            return Promise.all(promises)
                .then(function(results){
                    assert.equal(results[0], 'fixture 01');
                    assert.equal(results[1], 'fixture 02');
                });
        });
    });

    describe('files into non-existant directories', function(){
        beforeEach(function(){
            var copySpecs = [
                {
                    from: '../test-copy-space/source/fixture.01.txt',
                    to: '../test-copy-space/target/some/path/fixture.01.txt'
                }
            ];

            return vendorCopy(__dirname, copySpecs);
        });

        it('creates the path and copies the file', function(){
            return readFile(path.join(__dirname, '../test-copy-space/target/some/path/fixture.01.txt'))
                .then(function(content){
                    assert.equal(content, 'fixture 01');
                });
        });
    });
});
