'use strict';

import * as stdio from './main';

process.argv.slice(2).forEach(v => {
  stdio.log(v);
});



