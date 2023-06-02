"use strict";
module.exports = function bodyParser(req, res) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk;
        });
        req.on('end', () => {
            resolve(body);
        });
    });
};
