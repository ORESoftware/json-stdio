const cp = require('child_process');
const JSONStdio = require('json-stdio');
const path = require('path');
const http = require('http');
const child = path.resolve(__dirname + '/child.js');

// use curl to POST to server:
// curl -i -X POST -H 'Content-Type: application/json' -d '["one","two","three","four"]' http://localhost:6969

const s = http.createServer((req, res) => {

  const doTheThing = list => {

    const k = cp.spawn('node', [child]);

    list.forEach(item => {
      k.stdin.write(JSONStdio.getJSON({key: item}) + '\n');
    });

    k.stdin.end();

    k.stdout.on('data', d => {
      console.log('from child:', String(d));
    });

    k.stderr.pipe(process.stderr);

    // write output from child process to the response
    k.stdout.pipe(res);
  };

  let data = '';
  req.on('data', function (chunk) {
    data += chunk;
  });

  req.once('end', function () {

    try {
      req.rawBody = data;

      if (data && data.indexOf('[') === 0) {
        const list = req.body = JSON.parse(data);
        doTheThing(list);
      }
      else {
        res.end('error: could not parse json array.\n');
      }
    }
    catch (err) {
      res.end('error: could not handle request.' + err.stack);
    }

  });

});

s.listen(6969);

