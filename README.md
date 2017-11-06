

# json-2-stdout
### This library allows two Node.js processes to easily communicate via stdout.

<p>

## Usage

### Writing to stdout:

```javascript
const {logToStdout} = require('json-2-stdout');

// log a file path to stdout
logToStdout({filePath});

```

### Parsing a stream

```javascript
const {createParser, stdEventName} = require('json-2-stdout');
const cp = require('child_process');

const k = cp.spawn('bash');

k.stdout.pipe(createParser()).on(stdEventName, function(obj){
  
    // obj is an object like so:
    // {'@stdout-2-json':true, filePath: 'foobar'}
});

```
