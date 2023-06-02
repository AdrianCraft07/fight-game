"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const fs_1 = __importDefault(require("fs"));
function readFile(path, type = '') {
    const file = fs_1.default.readFileSync;
    let res = new Buffer('');
    if (isDirectory(path))
        res = file(`${path}/index.${type}`);
    else if (path.endsWith(type) && isFile(path))
        res = file(path);
    else if (isFile(`${path}.${type}`))
        res = file(`${path}.${type}`);
    return res;
}
function removeDir(path) {
    const files = fs_1.default.readdirSync(path);
    files
        .filter(file => isDirectory(`${path}/${file}`))
        .map(dir => removeDir(`${path}/${dir}`));
    files
        .filter(file => isFile(`${path}/${file}`))
        .map(file => remove(`${path}/${file}`));
    fs_1.default.rmdirSync(path);
}
function remove(path) {
    fs_1.default.rmSync(path);
}
function removeDetect(path) {
    if (isFile(path) || isDirectory(path))
        try {
            removeDir(path);
        }
        catch (e) {
            remove(path);
        }
}
function isDirectory(path) {
    try {
        fs_1.default.readdirSync(path);
        return true;
    }
    catch (e) {
        return false;
    }
}
function isFile(path) {
    try {
        fs_1.default.readFileSync(path);
        return true;
    }
    catch (e) {
        return false;
    }
}
function directory(path) {
    if (!path)
        return path;
    if (fs_1.default.existsSync(path))
        return path;
    let pathSplit = path.split(/[\\/]/);
    directory(pathSplit.filter((_, index) => index < pathSplit.length - 1).join('/'));
    fs_1.default.mkdirSync(path);
    return path;
}
function file(path, data) {
    let pathSplit = path.split(/[/\\]/);
    fs_1.default.writeFileSync(`${directory(pathSplit.filter((_, index) => index < pathSplit.length - 1).join('/'))}/${pathSplit[pathSplit.length - 1]}`, data);
    return path;
}
module.exports = {
    removeDetect,
    isDirectory,
    directory,
    removeDir,
    readFile,
    remove,
    isFile,
    file,
};
