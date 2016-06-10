"use strict";
var Sort;
(function (Sort) {
    Sort[Sort["Unsorted"] = 0] = "Unsorted";
    Sort[Sort["Descending"] = 1] = "Descending";
    Sort[Sort["Ascending"] = 2] = "Ascending";
})(Sort || (Sort = {}));
class AppModel {
    constructor() {
        this.users = ko.observableArray([]);
        this.hardmodeEnabled = ko.observable(false);
        this.gethardmodeStyle = () => {
            const element = document.getElementById('hardmode');
            if (!this.hardmodeEnabled()) {
                return '';
            }
            const left = Math.floor(window.innerWidth * Math.random()).toString();
            const top = Math.floor(window.innerHeight * Math.random()).toString();
            const position = 'absolute';
            return `position: ${position}; top: ${top}px; left: ${left}px`;
        };
        this.sortDescending = ko.observable(false);
        this.sortDirection = ko.observable(Sort.Unsorted);
        this.changeSort = () => {
            this.sortDirection(this.sortDirection() === Sort.Ascending ? Sort.Descending : Sort.Ascending);
            this.sortUsers();
        };
        this.sortUsers = () => {
            const sort = this.sortDirection();
            if (sort === Sort.Unsorted)
                return;
            if (this.hardmodeEnabled())
                return;
            const factor = this.sortDirection() === Sort.Ascending ? 1 : -1;
            const compareNames = (left, right) => left.name() > right.name() ? 1 : -1;
            this.users.sort((left, right) => right.points() === left.points() ? (compareNames(left, right) * factor) : (right.points() * factor) - (left.points() * factor));
        };
        this.randomize = () => {
            // this is not ideal, but neither is this entire application
            document
                .getElementById('hardmode')
                .style
                .cssText = this.gethardmodeStyle();
            if (!this.hardmodeEnabled())
                return;
            const randomFactor = () => Math.random() > 0.5 ? 1 : -1;
            this.users.sort((left, right) => randomFactor());
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
            const users = this.users();
            const findUser = (name) => users.filter(user => user.name() === userList[name].name)[0];
            names.forEach(name => {
                const user = findUser(name);
                if (!user) {
                    this.users.push(new UserModel(userList[name]));
                    return;
                }
                user.points(userList[name].points);
            });
            users.forEach(user => {
                const exists = names.some(name => userList[name].name === user.name());
                if (exists)
                    return;
                this.users.remove(user);
            });
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
        setInterval(() => this.randomize(), 1000);
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
//# sourceMappingURL=app.js.map