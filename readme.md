

# json-stdio

<br>

[![Version](https://img.shields.io/npm/v/json-stdio.svg?colorB=green)](https://www.npmjs.com/package/json-stdio)

<br>

>
> This library allows two Node.js processes to easily communicate via stdout/stderr/stdin.
>

<p>

### Usage / Getting Started

## Importing

```js
import stdio = require('json-stdio');    //   TypeScript
import * as stdio from 'json-stdio';     //   ESNext / ESWhatever
const stdio = require('json-stdio');     //   Old-Skool
```


## Writing to stdout/stderr (sender process):

```javascript
// log a file path, which can be received by another process

const stdio = require('json-stdio');
const filePath = '/foo/bar';
stdio.log({fp: filePath});
stdio.logerr({fp: filePath});

```


### Parsing a stream  (receiver process)

```javascript
const stdio = require('json-stdio');
const cp = require('child_process');

const k = cp.spawn('bash');

const parser = stdio.createParser();
const stdEventName = stdio.stdEventName;  // '@json-stdio-event'

k.stdout.pipe(parser).on(stdEventName, obj => {
  
    // obj is an object like so:
    // {fp: '/foo/bar'}
});

```
