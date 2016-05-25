'use strict';

var path = require('path');
var assert = require('assert');
var SandboxedModule = require('sandboxed-module');
var sinon = require('sinon');
var Deferred = require('es2015-deferred');

describe('cli', function(){
    var sandbox = sinon.sandbox.create();
    var vendorCopyStub = sandbox.stub();
    var infoStub = sandbox.stub();
    var errorStub = sandbox.stub();
    var exitStub = sandbox.stub();
    var packagePath = path.join(__dirname, '..', 'package.json');
    var vendorCopyDeferred;

    beforeEach(function(){
        vendorCopyDeferred = new Deferred();
        vendorCopyStub.returns(vendorCopyDeferred.promise);

        var requires = {
            '.': vendorCopyStub
        };

        requires[packagePath] = {
            vendorCopy: 'vendor-copy-config'
        };

        SandboxedModule.require('../cli', {
            requires: requires,
            globals: {
                console: {
                    log: infoStub,
                    error: errorStub
                },
                process: {
                    exit: exitStub,
                    cwd: process.cwd
                }
            }
        });
    });

    afterEach(function(){
        sandbox.reset();
    });

    it('calls the library with the root and the "vendorCopy" field of the package.json file', function(){
        assert.deepEqual(vendorCopyStub.args, [[path.join(__dirname, '..'), 'vendor-copy-config']]);
    });

    describe('when the library call resolves', function(){
        beforeEach(function(){
            vendorCopyDeferred.resolve([
                {
                    from: 'from1',
                    to: 'to1'
                },
                {
                    from: 'from2',
                    to: 'to2'
                }
            ]);

            return vendorCopyDeferred.promise;
        });

        it('logs each copy', function(){
            assert.deepEqual(infoStub.args, [['from1 => to1'], ['from2 => to2']]);
        });
    });

    describe('when the library call rejects', function(){
        beforeEach(function(){
            vendorCopyDeferred.reject({
                stack: 'fake error stack'
            });

            return vendorCopyDeferred.promise.catch(function(){});
        });

        it('logs the error', function(){
            assert.deepEqual(errorStub.args, [['Failed to install vendor modules:', 'fake error stack']]);
        });

        it('exits the process with status 1', function(){
            assert.deepStrictEqual(exitStub.args, [[1]]);
        });
    });
});
