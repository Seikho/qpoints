"use strict";
const userStore = {};
function upvote(name) {
    addUser(name);
    const user = getUser(name);
    user.points++;
    return user;
}
exports.upvote = upvote;
function downvote(name) {
    addUser(name);
    const user = getUser(name);
    user.points--;
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
}
exports.addUser = addUser;
function getUser(name) {
    const lowerName = name.toLowerCase();
    return userStore[lowerName];
}
exports.getUser = getUser;
//# sourceMappingURL=points.js.map