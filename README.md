

# json-stdio
### This library allows two Node.js processes to easily communicate via stdout/stderr/stdin.

<p>

### Usage

## Importing

```
import JSONStdio = require('json-stdio');    //   TypeScript
import * as JSONStdio from 'json-stdio';     //   ESNext / ESWhatever
const JSONStdio = require('json-stdio');     //   ESNotInsane / ESMoreFun
```


## Writing to stdout/stderr (sender process):

```javascript
// log a file path, which can be received by another process
const filePath = '/foo/bar';
JSONStdio.logToStdout({fp: filePath});
JSONStdio.logToStderr({fp: filePath});

// The added value of using these convenience functions as opposed to console.log()/console.error()
// is that JSONStdio will automatically add 
// the standard "marker" property to the JSON string, and it will also more safely stringify JS objects,
// using a helper function which gets rid of circular references, etc.

```


### Parsing a stream  (receiver process)

```javascript
const JSONStdio = require('json-stdio');
const cp = require('child_process');

const k = cp.spawn('bash');

const parser = JSONStdio.createParser();
const stdEventName = JSONStdio.stdEventName;  // '@json-stdio-event'

k.stdout.pipe(parser).on(stdEventName, function(obj){
  
    // obj is an object like so:
    // {'@json-stdio':true, fp: '/foo/bar'}
});

```
