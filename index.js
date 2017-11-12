'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var stream = require("stream");
var assert = require("assert");
var util = require("util");
var customStringify = function (v) {
    var cache = [];
    return JSON.stringify(v, function (key, value) {
        if (typeof value === 'object' && value !== null) {
            if (cache.indexOf(value) !== -1) {
                return;
            }
            cache.push(value);
        }
        return value;
    });
};
exports.stdMarker = '@json-stdio';
exports.stdEventName = '@json-stdio-event';
exports.initLogToStdout = function (marker) {
    assert(marker && typeof marker === 'string', "first argument to \"" + exports.initLogToStdout.name + "\" must be a string.");
    return function logToStdout(obj) {
        try {
            obj[marker] = true;
        }
        catch (err) {
            console.error("json-stdio could not add \"" + marker + "\" property to the following value (next line)\n:" + util.inspect(obj) + "\n");
            throw err;
        }
        try {
            console.log(customStringify(obj));
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
            obj[marker] = true;
        }
        catch (err) {
            console.error("json-stdio could not add \"" + marker + "\" property to the following value (next line)\n:" + util.inspect(obj) + "\n");
            throw err;
        }
        try {
            console.error(customStringify(obj));
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
