#!/usr/bin/env node
'use strict';

/*

 docker.r2g notes:

 this file will be copied to this location:

 $HOME/.r2g/temp/project/tests/smoke-test.js

 and it will then be executed with:

 ./smoke-test.js


 so, write a smoke test in this file, which only calls require() against your library.
 for example if your library is named "foo.bar", then the *only* require call you
 should make is to require('foo.bar'). If you make require calls to any other library
 in node_modules, then you will got non-deterministic results. require calls to core/built-in libraries are fine.

*/


const assert = require('assert').strict;
const path = require('path');
const os = require('os');
const fs = require('fs');
const EE = require('events');


process.on('unhandledRejection', (reason, p) => {
  // unless we force process to exit with 1, process may exit with 0 upon an unhandledRejection
  console.error(reason);
  process.exit(1);
});


const stdio = require('json-stdio');
const cp = require('child_process');

const k = cp.spawn('bash');
k.stderr.pipe(process.stderr);
k.stdout.pipe(process.stdout);

k.stdin.end(`node ${path.resolve(__dirname + '/../fixtures/child.js')}`);

const parser = stdio.createParser();
const stdEventName = stdio.stdEventName;  // '@json-stdio-event'

let count = 0;

k.stdout.pipe(parser).on(stdEventName, function(v){
  assert.deepEqual({fp: '/foo/bar'}, v);
  if(++count === 2){
    process.exit(0);
  }
});

k.stderr.pipe(parser).on(stdEventName, function(v){
  assert.deepEqual({fp: '/foo/bar'}, v);
  if(++count === 2){
    process.exit(0);
  }
});

k.once('exit', code => {
   if(code > 0){
     console.error('Child process exited with non-zero exit code.');
     process.exit(1);
   }
});

// your test goes here
