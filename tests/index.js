'use strict';

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const rimraf = require('rimraf');
const mkdirp = require('mkdirp');
const vendorCopy = require('../');

function readFile(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, 'utf8', (err, content) => err ? reject(err) : resolve(content));
  });
}

function rmdir(relativePath) {
  return new Promise((resolve, reject) => {
    rimraf(path.join(__dirname, relativePath), err => err ? reject(err) : resolve());
  });
}

function mkdir(relativePath) {
  return new Promise((resolve, reject) => {
    mkdirp(path.join(__dirname, relativePath), err => err ? reject(err) : resolve());
  });
}

function writeFile(relativePath, content) {
  return new Promise((resolve, reject) => {
    fs.writeFile(path.join(__dirname, relativePath), content, err => err ? reject(err) : resolve());
  });
}

function symlink(relativeTargetPath, relativeDestinationPath) {
  const targetPath = path.join(__dirname, relativeTargetPath);
  const destinationPath = path.join(__dirname, relativeDestinationPath);

  return new Promise((resolve, reject) => {
    fs.symlink(targetPath, destinationPath, err => err ? reject(err) : resolve());
  });
}

describe('vendorCopy', () => {
  beforeEach(() => {
    return rmdir('../test-copy-space/')
      .then(() => mkdir('../test-copy-space/'))
      .then(() => Promise.all([
        mkdir('../test-copy-space/source'),
        mkdir('../test-copy-space/target')
      ]))
      .then(() => Promise.all([
        writeFile('../test-copy-space/source/fixture.01.txt', 'fixture 01'),
        writeFile('../test-copy-space/source/fixture.02.txt', 'fixture 02')
      ]))
      .then(() => symlink('../test-copy-space/source/fixture.01.txt', '../test-copy-space/source/fixture.03.txt'));
  });

  it('is a function', () => {
    assert.equal(typeof vendorCopy, 'function');
  });

  describe('a single file into an existing directory', () => {
    beforeEach(() => {
      const copySpecs = [
        {
          from: '../test-copy-space/source/fixture.01.txt',
          to: '../test-copy-space/target/fixture.01.txt'
        }
      ];

      return vendorCopy(__dirname, copySpecs);
    });

    it('copies the file', () => {
      return readFile(path.join(__dirname, '../test-copy-space/target/fixture.01.txt'))
        .then(content => {
          assert.equal(content, 'fixture 01');
        });
    });
  });

  describe('multiple files into an existing directory', () => {
    beforeEach(() => {
      const copySpecs = [
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

    it('copies the files', () => {
      const promises = [
        readFile(path.join(__dirname, '../test-copy-space/target/fixture.01.txt')),
        readFile(path.join(__dirname, '../test-copy-space/target/fixture.02.txt'))
      ];

      return Promise.all(promises)
        .then(results => {
          assert.equal(results[0], 'fixture 01');
          assert.equal(results[1], 'fixture 02');
        });
    });
  });

  describe('files into non-existant directories', () => {
    beforeEach(() => {
      const copySpecs = [
        {
          from: '../test-copy-space/source/fixture.01.txt',
          to: '../test-copy-space/target/some/path/fixture.01.txt'
        }
      ];

      return vendorCopy(__dirname, copySpecs);
    });

    it('creates the path and copies the file', () => {
      return readFile(path.join(__dirname, '../test-copy-space/target/some/path/fixture.01.txt'))
        .then(content => {
          assert.equal(content, 'fixture 01');
        });
    });
  });

  describe('folders into non-existing directories', () => {
    beforeEach(() => {
      const copySpecs = [
        {
          from: '../test-copy-space/source',
          to: '../test-copy-space/target/some/path'
        }
      ];

      return vendorCopy(__dirname, copySpecs);
    });

    it('creates the path and copies the folder across', () => {
      const promises = [
        readFile(path.join(__dirname, '../test-copy-space/target/some/path/fixture.01.txt')),
        readFile(path.join(__dirname, '../test-copy-space/target/some/path/fixture.02.txt'))
      ];

      return Promise.all(promises)
        .then(results => {
          assert.equal(results[0], 'fixture 01');
          assert.equal(results[1], 'fixture 02');
        });
    });
  });

  describe('simlinks', () => {
    beforeEach(() => {
      const copySpecs = [
        {
          from: '../test-copy-space/source/fixture.03.txt',
          to: '../test-copy-space/target/fixture.03.txt'
        }
      ];

      return vendorCopy(__dirname, copySpecs);
    });

    it('resolves symlinks when copying', () => {
      return readFile(path.join(__dirname, '../test-copy-space/target/fixture.03.txt'))
        .then((content) => {
          assert.equal(content, 'fixture 01');
        });
    });
  });
});
