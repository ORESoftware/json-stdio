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
  let cache = new Map<any, true>();
  return JSON.stringify(v, function (key, value) {
    if (typeof value === 'object' && value !== null) {
      if (cache.get(value) === true) {
        // Circular reference found, discard key
        return;
      }
      // Store value in our collection
      cache.set(value, true);
    }
    return value;
  });
};

export const stdMarker = '@json-stdio';
export const stdEventName = '@json-stdio-event';

////////////////////////////////////////////////////////////////////

export const getJSON = function (obj: IStringifyiableObject, marker?: string) {
  
  marker = marker || stdMarker;
  
  try {
    obj[marker] = true;
  }
  catch (err) {
    console.error(`json-stdio could not add "${marker}" property to the following value (next line)\n:${util.inspect(obj)}\n`);
    throw err;
  }
  
  return customStringify(obj);
  
};

export const initLogToStdout = function (marker: string) {
  
  assert(marker && typeof marker === 'string', `first argument to "${initLogToStdout.name}" must be a string.`);
  
  return function logToStdout(obj: IStringifyiableObject) {
    
    try {
      console.log(getJSON(obj, marker));
    }
    catch (err) {
      console.error(`json-stdio could not stringify the following value (next line)\n:${util.inspect(obj)}\n`);
      throw err;
    }
    
  };
  
};

export const initLogToStderr = function (marker: string) {
  
  assert(marker && typeof marker === 'string', `first argument to "${initLogToStderr.name}" must be a string.`);
  
  return function logToStderr(obj: IStringifyiableObject) {
    
    try {
      console.error(getJSON(obj, marker));
    }
    catch (err) {
      console.error(`json-stdio could not stringify the following value (next line)\n:${util.inspect(obj)}\n`);
      throw err;
    }
    
  };
  
};

export const logToStdout = initLogToStdout(stdMarker);
export const logToStderr = initLogToStderr(stdMarker);

export const createParser = function (marker?: string, eventName?: string) {
  
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

export interface Object2JSONOpts {
  marker: string;
}

export const transformObject2JSON = function (opts?: Object2JSONOpts) {
  
  const marker = opts && opts.marker || stdMarker;
  
  return new stream.Transform({
    
    objectMode: true,
    
    transform(chunk: any, encoding: string, cb: Function) {
      
      try {
        chunk[marker] = true;
        this.push(JSON.stringify(chunk) + '\n');
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

