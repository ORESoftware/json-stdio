/// <reference types="node" />
import * as stream from 'stream';
export declare type IStringifyiableObject = IParsedObject;
export interface IParsedObject {
    [index: string]: any;
}
export declare const stdMarker = "@json-stdio";
export declare const stdEventName = "@json-stdio-event";
export declare const initLogToStdout: (marker: string) => (obj: IParsedObject) => void;
export declare const initLogToStderr: (marker: string) => (obj: IParsedObject) => void;
export declare const logToStdout: (obj: IParsedObject) => void;
export declare const logToStderr: (obj: IParsedObject) => void;
export declare const createParser: (marker?: string, eventName?: string) => stream.Transform;
