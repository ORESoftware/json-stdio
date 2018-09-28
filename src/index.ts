'use strict';

import * as stream from 'stream';
import * as assert from 'assert';
import * as util from 'util';
import {JSONParser} from "@oresoftware/json-stream-parser";
import * as safe from '@oresoftware/safe-stringify';

export const r2gSmokeTest = function () {
  return true;
};

///////////////////////////////////////////////

export interface ParsedObject extends Object {
  [index: string]: any
}

//////////////////////////////////////////////////

export const stdMarker = '@json-stdio';
export const stdEventName = '@json-stdio-event';

////////////////////////////////////////////////////////////////////

export interface AnyIndex extends Object {
  [key: string]: any
}

export const getJSON =  (obj: AnyIndex, marker?: string) => {

  marker = marker || stdMarker;

  try {
    obj[marker] = true;
  }
  catch (err) {
    console.error(`json-stdio could not add "${marker}" property to the following value (next line)\n:${util.inspect(obj)}\n`);
    throw err;
  }

  return safe.stringify(obj);

};

export type Stringifiable = object | string | boolean | number | null;

export const getJSONCanonical =  (v: Stringifiable, marker?: string) => {

  marker = marker || stdMarker;

  if (typeof v === "undefined") {
    v = null;
  }

  return safe.stringify({
    [marker]: true,
    value: v
  });

};

export const initLogToStdout = function (marker: string) {

  assert(marker && typeof marker === 'string', `first argument to "${initLogToStdout.name}" must be a string.`);

  return function logToStdout(obj: any) {

    try {
      console.log(getJSONCanonical(obj, marker));
    }
    catch (err) {
      console.error(`json-stdio could not stringify the following value (next line)\n:${util.inspect(obj)}\n`);
      throw err;
    }

  };

};

export const initLogToStderr = function (marker: string) {

  assert(marker && typeof marker === 'string', `first argument to "${initLogToStderr.name}" must be a string.`);

  return function logToStderr(obj: any) {

    try {
      console.error(getJSONCanonical(obj, marker));
    }
    catch (err) {
      console.error(`json-stdio could not stringify the following value (next line)\n:${util.inspect(obj)}\n`);
      throw err;
    }

  };

};

export const logToStdout = initLogToStdout(stdMarker);
export const logToStderr = initLogToStderr(stdMarker);
export const log = logToStdout;
export const logerr = logToStderr;

export const createParser =  (marker?: string, eventName?: string) => {

  marker = marker || stdMarker;
  eventName = eventName || stdEventName;

  const strm = new JSONParser();

  strm.on('data',  (d: ParsedObject) => {
    if (d && d[marker] === true) {
      strm.emit(eventName, d.value);
    }
  });

  return strm;

};


export interface Object2JSONOpts {
  marker: string;
}

export const transformObject2JSON = function (opts?: Object2JSONOpts) {

  const marker = opts && opts.marker || stdMarker;

  return new stream.Transform({

    objectMode: true,

    transform(chunk: any, encoding: string, cb: Function) {

      try {
        this.push(getJSONCanonical(chunk) + '\n');
      }
      catch (err) {
        /* noop */
      }

      cb();

    },

    flush(cb: Function) {
      cb();
    }
  });

};

