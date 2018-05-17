'use strict';

const path = require('path');
const assert = require('assert');
const SandboxedModule = require('sandboxed-module');
const sinon = require('sinon');
const Deferred = require('es2015-deferred');

describe('cli', () => {
  const sandbox = sinon.sandbox.create();
  const vendorCopyStub = sandbox.stub();
  const infoStub = sandbox.stub();
  const errorStub = sandbox.stub();
  const exitStub = sandbox.stub();
  const packagePath = path.join(__dirname, '..', 'package.json');

  let fakeProcess;
  let requires;
  let vendorCopyDeferred;

  beforeEach(() => {
    vendorCopyDeferred = new Deferred();
    vendorCopyStub.returns(vendorCopyDeferred.promise);

    requires = {
      '.': vendorCopyStub
    };

    requires[packagePath] = {
      vendorCopy: ['vendor-copy-config'],
      devVendorCopy: ['dev-vendor-copy-config']
    };

    fakeProcess = {
      exit: exitStub,
      cwd: process.cwd
    };
  });

  afterEach(() => {
    sandbox.reset();
  });

  describe('npm development mode', () => {
    beforeEach(() => {
      fakeProcess.env = { npm_config_production: 'false' };

      SandboxedModule.require('../cli', {
        requires,
        globals: {
          console: {
            log: infoStub,
            error: errorStub
          },
          process: fakeProcess
        }
      });
    });

    it('calls the library with the root and the "vendorCopy" and "devVendorCopy" fields of the package.json file', () => {
      assert.deepEqual(vendorCopyStub.args, [[path.join(__dirname, '..'), ['vendor-copy-config', 'dev-vendor-copy-config']]]);
    });

    describe('when the library call resolves', () => {
      beforeEach(() => {
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

      it('logs each copy', () => {
        assert.deepEqual(infoStub.args, [['from1 => to1'], ['from2 => to2']]);
      });
    });

    describe('when the library call rejects', () => {
      beforeEach(() => {
        vendorCopyDeferred.reject({
          stack: 'fake error stack'
        });

        return vendorCopyDeferred.promise.catch(() => {});
      });

      it('logs the error', () => {
        assert.deepEqual(errorStub.args, [['Failed to install vendor modules:', { stack: 'fake error stack' }]]);
      });

      it('exits the process with status 1', () => {
        assert.deepStrictEqual(exitStub.args, [[1]]);
      });

      it('exits the process with status 1', () => {
        assert.deepStrictEqual(exitStub.args, [[1]]);
      });
    });
  });

  describe('NODE_ENV development mode', () => {
    beforeEach(() => {
      fakeProcess.env = { NODE_ENV: 'development' };

      SandboxedModule.require('../cli', {
        requires,
        globals: {
          console: {
            log: infoStub,
            error: errorStub
          },
          process: fakeProcess
        }
      });
    });

    it('calls the library with the root and the "vendorCopy" field of the package.json file', () => {
      assert.deepEqual(vendorCopyStub.args, [[path.join(__dirname, '..'), ['vendor-copy-config', 'dev-vendor-copy-config']]]);
    });

    describe('when the library call resolves', () => {
      beforeEach(() => {
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

      it('logs each copy', () => {
        assert.deepEqual(infoStub.args, [['from1 => to1'], ['from2 => to2']]);
      });
    });

    describe('when the library call rejects', () => {
      beforeEach(() => {
        vendorCopyDeferred.reject({
          stack: 'fake error stack'
        });

        return vendorCopyDeferred.promise.catch(() => {});
      });

      it('logs the error', () => {
        assert.deepEqual(errorStub.args, [['Failed to install vendor modules:', { stack: 'fake error stack' }]]);
      });

      it('exits the process with status 1', () => {
        assert.deepStrictEqual(exitStub.args, [[1]]);
      });
    });
  });

  describe('npm production mode', () => {
    beforeEach(() => {
      fakeProcess.env = { npm_config_production: 'true' };

      SandboxedModule.require('../cli', {
        requires,
        globals: {
          console: {
            log: infoStub,
            error: errorStub
          },
          process: fakeProcess
        }
      });
    });

    it('calls the library with the root and the "vendorCopy" field of the package.json file', () => {
      assert.deepEqual(vendorCopyStub.args, [[path.join(__dirname, '..'), ['vendor-copy-config']]]);
    });

    describe('when the library call resolves', () => {
      beforeEach(() => {
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

      it('logs each copy', () => {
        assert.deepEqual(infoStub.args, [['from1 => to1'], ['from2 => to2']]);
      });
    });

    describe('when the library call rejects', () => {
      beforeEach(() => {
        vendorCopyDeferred.reject({
          stack: 'fake error stack'
        });

        return vendorCopyDeferred.promise.catch(() => {});
      });

      it('logs the error', () => {
        assert.deepEqual(errorStub.args, [['Failed to install vendor modules:', { stack: 'fake error stack' }]]);
      });

      it('exits the process with status 1', () => {
        assert.deepStrictEqual(exitStub.args, [[1]]);
      });
    });
  });

  describe('NODE_ENV production mode', () => {
    beforeEach(() => {
      fakeProcess.env = { NODE_ENV: 'production' };

      SandboxedModule.require('../cli', {
        requires,
        globals: {
          console: {
            log: infoStub,
            error: errorStub
          },
          process: fakeProcess
        }
      });
    });

    it('calls the library with the root and the "vendorCopy" field of the package.json file', () => {
      assert.deepEqual(vendorCopyStub.args, [[path.join(__dirname, '..'), ['vendor-copy-config']]]);
    });

    describe('when the library call resolves', () => {
      beforeEach(() => {
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

      it('logs each copy', () => {
        assert.deepEqual(infoStub.args, [['from1 => to1'], ['from2 => to2']]);
      });
    });

    describe('when the library call rejects', () => {
      beforeEach(() => {
        vendorCopyDeferred.reject({
          stack: 'fake error stack'
        });

        return vendorCopyDeferred.promise.catch(() => {});
      });

      it('logs the error', () => {
        assert.deepEqual(errorStub.args, [['Failed to install vendor modules:', { stack: 'fake error stack' }]]);
      });

      it('exits the process with status 1', () => {
        assert.deepStrictEqual(exitStub.args, [[1]]);
      });
    });
  });
});
