"use strict";
const express = require('express');
const points = require('./points');
const server = express();
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
    points.emitter.once('users', users => res.json(users));
});
server.listen(1716, () => console.log('Listening on port 1716'));
//# sourceMappingURL=index.js.map