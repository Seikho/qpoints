"use strict";
const fs = require('fs');
const points_1 = require('./points');
function backup() {
    const users = points_1.getUsers();
    const json = JSON.stringify(points_1.getUsers());
    fs.writeFileSync('users.json', json);
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = backup;
function readBackup() {
    try {
        const json = fs.readFileSync('users.json').toString();
        const users = JSON.parse(json);
        return users;
    }
    catch (ex) {
        return {};
    }
}
exports.readBackup = readBackup;
//# sourceMappingURL=backup.js.map