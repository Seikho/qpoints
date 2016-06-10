"use strict";
const express = require('express');
const points = require('./points');
const backup_1 = require('./backup');
const server = express();
const limitCache = {};
server.use(express.static('front'));
server.get('/upvote/:name', (req, res) => {
    points.upvote(req.params.name);
    res.json(points.getUser(req.params.name));
});
server.get('/downvote/:name', (req, res) => {
    points.downvote(req.params.name);
    res.json(points.getUser(req.params.name));
});
server.get('/adduser/:name', (req, res) => {
    points.addUser(req.params.name);
    res.json(points.getUsers());
});
server.get('/users', (req, res) => {
    res.json(points.getUsers());
});
server.get('/poll', (req, res) => {
    points.emitter.once('users', users => setTimeout(() => res.json(users), 100));
});
server.get('/ping', (req, res) => res.json({ ok: true }));
server.listen(1716, () => console.log('Listening on port 1716'));
setInterval(() => backup_1.default(), 60000);
points.loadFromBackup();
//# sourceMappingURL=index.js.map