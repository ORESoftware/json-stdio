

# json-stdio
### This library allows two Node.js processes to easily communicate via stdout/stderr/stdin.

<p>

## Usage

### Writing to stdout:

```javascript
const {logToStdout} = require('json-stdio');

// log a file path to stdout
logToStdout({filePath});

```

### Parsing a stream

```javascript
const {createParser, stdEventName} = require('json-stdio');
const cp = require('child_process');

const k = cp.spawn('bash');

k.stdout.pipe(createParser()).on(stdEventName, function(obj){
  
    // obj is an object like so:
    // {'@stdout-2-json':true, filePath: 'foobar'}
});

```
