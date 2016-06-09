"use strict";
class AppModel {
    constructor() {
        this.users = ko.observableArray([]);
        this.sortDirection = ko.observable(Sort.Unsorted);
        this.sortUsers = () => {
            const sort = this.sortDirection();
            if (sort === Sort.Unsorted)
                return;
            this.sortDirection(sort === Sort.Ascending ? Sort.Descending : Sort.Ascending);
            const factor = this.sortDirection() === Sort.Ascending ? 1 : -1;
            this.users.sort((left, right) => (right.points() * factor) - (left.points() * factor));
        };
        this.getUser = (name) => this.users()
            .filter(user => user.name() === name)[0];
        this.loadUsers = () => {
            fetch('/users')
                .then(res => res.json())
                .then(this.parseUsers);
        };
        this.pingTime = ko.observable(-1);
        this.ping = () => {
            const start = new Date().valueOf();
            fetch('/ping')
                .then(() => this.pingTime(new Date().valueOf() - start));
        };
        this.parseUsers = (userList) => {
            const names = Object.keys(userList);
            if (names.length === 0)
                return;
            this.users.removeAll();
            const users = names.map(user => new UserModel(userList[user]));
            this.users(users);
            this.sortUsers();
            return true;
        };
        this.addUser = () => {
            const newName = window.prompt('New user name?');
            if (!newName)
                return;
            fetch(`/adduser/${newName}`).then(() => this.loadUsers());
        };
        this.poll = () => {
            setTimeout(() => fetch('/poll')
                .then(res => res.json())
                .then(this.parseUsers)
                .then(() => this.poll())
                .catch(() => setTimeout(() => this.poll(), 10000)), 500);
        };
        this.loadUsers();
        this.poll();
        setInterval(() => this.ping(), 20000);
        this.ping();
    }
}
class UserModel {
    constructor(user) {
        this.name = ko.observable('');
        this.points = ko.observable(0);
        this.isEnabled = ko.observable(true);
        this.upvote = () => {
            this.isEnabled(false);
            fetch(`/upvote/${this.name()}`)
                .then(res => res.json())
                .then(res => this.points(res.points))
                .then(() => this.isEnabled(true))
                .catch(() => this.isEnabled(true));
        };
        this.downvote = () => {
            this.isEnabled(false);
            fetch(`/downvote/${this.name()}`)
                .then(res => res.json())
                .then(res => this.points(res.points))
                .then(() => this.isEnabled(true))
                .catch(() => this.isEnabled(true));
        };
        this.name(user.name);
        this.points(user.points);
    }
}
ko.applyBindings(new AppModel());
var Sort;
(function (Sort) {
    Sort[Sort["Unsorted"] = 0] = "Unsorted";
    Sort[Sort["Descending"] = 1] = "Descending";
    Sort[Sort["Ascending"] = 2] = "Ascending";
})(Sort || (Sort = {}));
//# sourceMappingURL=app.js.map