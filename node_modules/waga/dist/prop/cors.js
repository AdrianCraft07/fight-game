"use strict";
module.exports = function cors(options = {}) {
    if (!options.origin)
        options.origin = '*'; // default
    if (typeof options.origin === 'string')
        options.origin = [options.origin];
    if (!Array.isArray(options.origin)) {
        const originO = options.origin;
        options.origin = function (origin, callback) {
            let allow = originO.includes(origin) || originO.includes('*');
            if (typeof callback == 'function')
                callback(null, allow);
            return allow;
        };
    }
    if (typeof options.origin === 'function') {
        const originO = options.origin;
        options.origin = function (origin, callback) {
            try {
                return originO(origin, callback);
            }
            catch (err) {
                callback(err);
                return false;
            }
        };
    }
    return function (req, res, next) {
        if (options.origin(req.headers.origin)) {
            res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
        }
        if (options.methods) {
            res.setHeader('Access-Control-Allow-Methods', options.methods);
        }
    };
};
