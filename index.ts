'use strict';

import * as stream from 'stream';
import * as assert from 'assert';
import * as util from 'util';

///////////////////////////////////////////////

export type IStringifyiableObject = IParsedObject;
export interface IParsedObject {
  [index: string]: any
}

//////////////////////////////////////////////////

const customStringify = function (v: any) {
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


export const stdMarker = '@stdout-2-json';
export const stdEventName = '@stdout-2-json-object';

////////////////////////////////////////////////////////////////////

export const initLogToStdout = function (marker: string){

  assert(marker && typeof marker === 'string', `first argument to ${initLogToStdout.name} must be a string.`);

  return function logToStdout(obj: IStringifyiableObject){

    try{
      obj[stdMarker] = true;
    }
    catch(err){
      console.error(`json-stdio could not add "${stdMarker}" property to the following value (next line)\n:${util.inspect(obj)}\n`);
      throw err;
    }

    try{
      console.log(customStringify(obj));
    }
    catch(err){
      console.error(`json-stdio could not stringify the following value (next line)\n:${util.inspect(obj)}\n`);
      throw err;
    }

  };

};

export const initLogToStderr = function (marker: string){

  assert(marker && typeof marker === 'string', `first argument to ${initLogToStderr.name} must be a string.`);

  return function logToStderr(obj: IStringifyiableObject){

    try{
      obj[stdMarker] = true;
    }
    catch(err){
      console.error(`json-stdio could not add "${stdMarker}" property to the following value (next line)\n:${util.inspect(obj)}\n`);
      throw err;
    }

    try{
      console.error(customStringify(obj));
    }
    catch(err){
      console.error(`json-stdio could not stringify the following value (next line)\n:${util.inspect(obj)}\n`);
      throw err;
    }

  };

};

export const logToStdout = initLogToStdout(stdMarker);
export const logToStderr = initLogToStderr(stdMarker);


export const createParser =  function (marker?: string, eventName?: string) {

  marker = marker || stdMarker;
  eventName = eventName || stdEventName;

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
    if (d && d[marker] === true) {
      strm.emit(eventName, d);
    }
  });

  return strm;

};


