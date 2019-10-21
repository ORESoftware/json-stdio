#!/usr/bin/env node
'use strict';

import {createParser, stdEventName} from './main';

process.stdin.resume()
  .pipe(createParser())
  .on(stdEventName, v => {
    console.log(v);
});
