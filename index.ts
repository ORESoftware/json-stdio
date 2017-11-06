'use strict';

import * as stream from 'stream';
import * as assert from 'assert';

///////////////////////////////////////////////

export interface IParsedObject {
  [index: string]: any
}

//////////////////////////////////////////////////

export const customStringify = function (v: any) {
  let cache: Array<any> = [];
  return JSON.stringify(v, function (key, value) {
    if (typeof value === 'object' && value !== null) {
      if (cache.indexOf(value) !== -1) {
        // Circular reference found, discard key
        return;
      }
      // Store value in our collection
      cache.push(value);
    }
    return value;
  });
};


const stdMarker = '@stdout-2-json';

export const logToStdout = function(obj: Object){

  obj[stdMarker] = true;
  console.log(customStringify(obj));

};


export const initLogToStdout = function (marker: string){

  assert(marker && typeof marker === 'string', `first argument to ${initLogToStdout.name} must be a string.`);

  return function logToStdout(obj: Object){
    obj[marker] = true;
    console.log(customStringify(obj));
  };
};


export const createParser =  function (marker: string) {

  marker = marker || stdMarker;

  let lastLineData = '';

  const strm = new stream.Transform({

    objectMode: true,

    transform(chunk: any, encoding: string, cb: Function) {

      let data = String(chunk);
      if (lastLineData) {
        data = lastLineData + data;
      }

      let lines = data.split('\n');
      lastLineData = lines.splice(lines.length - 1, 1)[0];

      lines.forEach(l => {
        try {
          // l might be an empty string; ignore if so
          l && this.push(JSON.parse(l));
        }
        catch (err) {
          // noop
        }
      });

      cb();

    },

    flush(cb: Function) {
      if (lastLineData) {
        try {
          this.push(JSON.parse(lastLineData));
        }
        catch (err) {
          // noop
        }
      }
      lastLineData = '';
      cb();
    }
  });

  strm.on('data', function (d: IParsedObject) {
    if (d && d[stdMarker] === true) {
      strm.emit('testpoint', d);
    }
  });

  return strm;

};


