import * as express from 'express';
import * as points from './points';
import backup from './backup';

const Brute = require('express-brute');
const server = express();

const store = new Brute.MemoryStore();
const brute = new Brute(store, {
    freeRetries: 25, 
});

const limitCache: { [address: string]: number } = {};

server.use(express.static('front'));

server.get('/upvote/:name', brute.prevent, (req, res) => {

    points.upvote(req.params.name);
    res.json(points.getUser(req.params.name));
});

server.get('/downvote/:name', brute.prevent, (req, res) => {
    points.downvote(req.params.name);
    res.json(points.getUser(req.params.name));
});

server.get('/adduser/:name', brute.prevent, (req, res) => {
    points.addUser(req.params.name);
    res.json(points.getUsers());
});

server.get('/users', (req, res) => {
    res.json(points.getUsers())
});

server.get('/poll', brute.prevent, (req, res) => {
    points.emitter.once('users', users => setTimeout(() => res.json(users), 250));
});

server.get('/ping', (req, res) => res.json({ ok: true }));

server.listen(1716, () => console.log('Listening on port 1716'));

setInterval(() => backup(), 60000);

points.loadFromBackup();