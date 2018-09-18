const JSONStdio = require('json-stdio');
let stdinList = [];

const p = JSONStdio.createParser();
const stdEventName = JSONStdio.stdEventName;

process.stdin.pipe(p).on(stdEventName, v => {
  stdinList.push(v);
});

process.stdin.once('end', () => {

  process.stdout.write('\nyou have succeeded.\n');
  stdinList.forEach(v => {
    JSONStdio.logToStdout(v);
  });

  process.stdout.write('\n\n');

});
