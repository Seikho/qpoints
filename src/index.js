"use strict";
const express = require('express');
const points = require('./points');
const backup_1 = require('./backup');
const server = express();
const limitCache = {};
server.use(express.static('front'));
server.get('/upvote/:name', (req, res) => {
    if (!limit(ip(req))) {
        res.statusCode = 429;
        return res.end();
    }
    points.upvote(req.params.name);
    res.json(points.getUser(req.params.name));
});
server.get('/downvote/:name', (req, res) => {
    if (!limit(ip(req))) {
        res.statusCode = 429;
        return res.end();
    }
    points.downvote(req.params.name);
    res.json(points.getUser(req.params.name));
});
server.get('/adduser/:name', (req, res) => {
    if (!limit(ip(req))) {
        res.statusCode = 429;
        return res.end();
    }
    points.addUser(req.params.name);
    res.json(points.getUsers());
});
server.get('/users', (req, res) => {
    res.json(points.getUsers());
});
server.get('/poll', (req, res) => {
    points.emitter.once('users', users => setTimeout(() => res.json(users), 250));
});
server.get('/ping', (req, res) => res.json({ ok: true }));
server.listen(1716, () => console.log('Listening on port 1716'));
setInterval(() => backup_1.default(), 60000);
points.loadFromBackup();
function ip(req) {
    return req.headers['x-forwarded-for'] || req.connection.remoteAddress;
}
function limit(address) {
    // REQ_LIMIT requests per RESET_MS milliseconds
    const REQ_LIMIT = 50;
    const RESET_MS = 1000;
    if (limitCache[address] === undefined) {
        limitCache[address] = 0;
        setTimeout(() => delete limitCache[address], RESET_MS);
    }
    limitCache[address]++;
    const canRequest = limitCache[address] < REQ_LIMIT;
    return canRequest;
}
function decrease(address) {
    if (limitCache[address] === undefined)
        return;
    limitCache[address]--;
    if (limitCache[address] > 0)
        return;
    delete limitCache[address];
}
//# sourceMappingURL=index.js.map