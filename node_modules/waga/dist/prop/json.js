"use strict";
module.exports = function JsonBody(req, res, next) {
    try {
        req.body = JSON.parse(req.body);
    }
    catch (error) {
        req.body = {};
    }
    next();
};
