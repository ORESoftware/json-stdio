'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var stream = require("stream");
var assert = require("assert");
var util = require("util");
var customStringify = function (v) {
    var cache = new Map();
    return JSON.stringify(v, function (key, value) {
        if (typeof value === 'object' && value !== null) {
            if (cache.get(value) === true) {
                return;
            }
            cache.set(value, true);
        }
        return value;
    });
};
exports.stdMarker = '@json-stdio';
exports.stdEventName = '@json-stdio-event';
exports.getJSON = function (obj, marker) {
    marker = marker || exports.stdMarker;
    try {
        obj[marker] = true;
    }
    catch (err) {
        console.error("json-stdio could not add \"" + marker + "\" property to the following value (next line)\n:" + util.inspect(obj) + "\n");
        throw err;
    }
    return customStringify(obj);
};
exports.initLogToStdout = function (marker) {
    assert(marker && typeof marker === 'string', "first argument to \"" + exports.initLogToStdout.name + "\" must be a string.");
    return function logToStdout(obj) {
        try {
            console.log(exports.getJSON(obj, marker));
        }
        catch (err) {
            console.error("json-stdio could not stringify the following value (next line)\n:" + util.inspect(obj) + "\n");
            throw err;
        }
    };
};
exports.initLogToStderr = function (marker) {
    assert(marker && typeof marker === 'string', "first argument to \"" + exports.initLogToStderr.name + "\" must be a string.");
    return function logToStderr(obj) {
        try {
            console.error(exports.getJSON(obj, marker));
        }
        catch (err) {
            console.error("json-stdio could not stringify the following value (next line)\n:" + util.inspect(obj) + "\n");
            throw err;
        }
    };
};
exports.logToStdout = exports.initLogToStdout(exports.stdMarker);
exports.logToStderr = exports.initLogToStderr(exports.stdMarker);
exports.createParser = function (marker, eventName) {
    marker = marker || exports.stdMarker;
    eventName = eventName || exports.stdEventName;
    var lastLineData = '';
    var strm = new stream.Transform({
        objectMode: true,
        transform: function (chunk, encoding, cb) {
            var _this = this;
            var data = String(chunk);
            if (lastLineData) {
                data = lastLineData + data;
            }
            var lines = data.split('\n');
            lastLineData = lines.splice(lines.length - 1, 1)[0];
            lines.forEach(function (l) {
                try {
                    l && _this.push(JSON.parse(l));
                }
                catch (err) {
                }
            });
            cb();
        },
        flush: function (cb) {
            if (lastLineData) {
                try {
                    this.push(JSON.parse(lastLineData));
                }
                catch (err) {
                }
            }
            lastLineData = '';
            cb();
        }
    });
    strm.on('data', function (d) {
        if (d && d[marker] === true) {
            strm.emit(eventName, d);
        }
    });
    return strm;
};
exports.transformObject2JSON = function (opts) {
    var marker = opts && opts.marker || exports.stdMarker;
    return new stream.Transform({
        objectMode: true,
        transform: function (chunk, encoding, cb) {
            try {
                chunk[marker] = true;
                this.push(JSON.stringify(chunk) + '\n');
            }
            catch (err) {
            }
            cb();
        },
        flush: function (cb) {
            cb();
        }
    });
};
