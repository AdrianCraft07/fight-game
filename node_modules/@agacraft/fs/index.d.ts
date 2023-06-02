/// <reference types="node" />
declare function readFile(path: string, type?: string): Buffer;
declare function removeDir(path: string): void;
declare function remove(path: string): void;
declare function removeDetect(path: string): void;
declare function isDirectory(path: string): boolean;
declare function isFile(path: string): boolean;
declare function directory(path: string): string;
declare function file(path: string, data: string | NodeJS.ArrayBufferView): string;
declare const _default: {
    removeDetect: typeof removeDetect;
    isDirectory: typeof isDirectory;
    directory: typeof directory;
    removeDir: typeof removeDir;
    readFile: typeof readFile;
    remove: typeof remove;
    isFile: typeof isFile;
    file: typeof file;
};
export = _default;
