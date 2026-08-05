'use strict';

const assert = require('node:assert/strict');
const {once} = require('node:events');
const test = require('node:test');

const {
  createParser,
  getJSONCanonical,
  stdEventName,
  stdMarker,
  transformObject2JSON,
} = require('../dist/main.js');

const collectTransform = async (transform, values) => {
  let output = '';
  transform.setEncoding('utf8');
  transform.on('data', chunk => {
    output += chunk;
  });
  for (const value of values) {
    transform.write(value);
  }
  transform.end();
  await once(transform, 'end');
  return output;
};

test('canonical envelopes preserve falsy values and normalize undefined to null', () => {
  assert.deepEqual(JSON.parse(getJSONCanonical(false)), {
    [stdMarker]: true,
    value: false,
  });
  assert.deepEqual(JSON.parse(getJSONCanonical(0)), {
    [stdMarker]: true,
    value: 0,
  });
  assert.deepEqual(JSON.parse(getJSONCanonical(undefined)), {
    [stdMarker]: true,
    value: null,
  });
});

test('object transform applies the configured marker to every emitted envelope', async () => {
  const marker = '@acme-json';
  const output = await collectTransform(
    transformObject2JSON({marker}),
    [{id: 1}, false, 0],
  );
  const records = output.trim().split('\n').map(JSON.parse);

  assert.deepEqual(records, [
    {[marker]: true, value: {id: 1}},
    {[marker]: true, value: false},
    {[marker]: true, value: 0},
  ]);
  assert.ok(records.every(record => !(stdMarker in record)));
});

test('parser emits only matching protocol records across fragmented input', async () => {
  const marker = '@acme-json';
  const eventName = '@acme-event';
  const parser = createParser(marker, eventName);
  const values = [];
  parser.on(eventName, value => values.push(value));

  const payload = [
    JSON.stringify({[marker]: true, value: 0}),
    JSON.stringify({[stdMarker]: true, value: 'wrong protocol'}),
    JSON.stringify({[marker]: false, value: 'disabled'}),
    JSON.stringify({[marker]: true, value: false}),
  ].join('\n');

  const midpoint = Math.floor(payload.length / 2);
  parser.write(payload.slice(0, midpoint));
  parser.end(payload.slice(midpoint));
  await once(parser, 'end');

  assert.deepEqual(values, [0, false]);
  assert.notEqual(eventName, stdEventName);
});
