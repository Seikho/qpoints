"use strict";
const events = require('events');
const backup_1 = require('./backup');
exports.emitter = new events.EventEmitter();
const userStore = {};
function upvote(name) {
    addUser(name);
    const user = getUser(name);
    user.points++;
    exports.emitter.emit('users', getUsers());
    return user;
}
exports.upvote = upvote;
function downvote(name) {
    addUser(name);
    const user = getUser(name);
    user.points--;
    exports.emitter.emit('users', getUsers());
    return user;
}
exports.downvote = downvote;
function getUsers() {
    return userStore;
}
exports.getUsers = getUsers;
function addUser(name) {
    const lowerName = name.toLowerCase();
    if (userStore[lowerName] !== undefined)
        return;
    const maxUsers = 50;
    const users = Object.keys(userStore);
    const userCount = users.length;
    if (userCount === maxUsers) {
        const sortedUsers = users.sort((left, right) => userStore[left].points - userStore[right].points);
        delete userStore[sortedUsers[0]];
    }
    userStore[lowerName] = {
        name,
        points: 0
    };
    exports.emitter.emit('users', getUsers());
}
exports.addUser = addUser;
function getUser(name) {
    const lowerName = name.toLowerCase();
    return userStore[lowerName];
}
exports.getUser = getUser;
function loadFromBackup() {
    const existingUsers = Object.keys(userStore);
    if (existingUsers.length > 0) {
        existingUsers.forEach(user => delete userStore[user]);
    }
    const users = backup_1.readBackup();
    Object.keys(users)
        .forEach(user => userStore[user] = users[user]);
}
exports.loadFromBackup = loadFromBackup;
//# sourceMappingURL=points.js.map