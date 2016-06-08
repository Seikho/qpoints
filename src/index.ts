import * as express from 'express';
import * as points from './points';
import backup from './backup';

const server = express();

const limitCache: { [address: string]: number } = {};

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
    res.json(points.getUsers())
});

server.get('/poll', (req, res) => {
    points.emitter.once('users', users => setTimeout(() => res.json(users), 250));
});

server.get('/ping', (req, res) => res.json({ ok: true }));

server.listen(1716, () => console.log('Listening on port 1716'));

setInterval(() => backup(), 60000);

points.loadFromBackup();

function ip(req: express.Request) {
    return req.headers['x-forwarded-for'] || req.connection.remoteAddress;
}

function limit(address: string): boolean {
    // REQ_LIMIT requests per RESET_MS milliseconds
    const REQ_LIMIT = 50;
    const RESET_MS = 500;

    if (limitCache[address] === undefined) {
        limitCache[address] = 0;
        setTimeout(() => delete limitCache[address], RESET_MS);
    }

    limitCache[address]++;
    const canRequest = limitCache[address] < REQ_LIMIT;

    return canRequest;
}

function decrease(address: string): void {
    if (limitCache[address] === undefined) return;
    limitCache[address]--;
    if (limitCache[address] > 0) return;
    delete limitCache[address];
}