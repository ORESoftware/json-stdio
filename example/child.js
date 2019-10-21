const stdio = require('json-stdio');
let stdinList = [];

const p = stdio.createParser();
const stdEventName = stdio.stdEventName;

process.stdin.pipe(p).on(stdEventName, v => {
  stdinList.push(v);
});

process.stdin.once('end', () => {

  process.stdout.write('\nyou have succeeded.\n');
  stdinList.forEach(v => {
    stdio.log(v);
  });

  process.stdout.write('\n\n');

});
