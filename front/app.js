"use strict";
class AppModel {
    constructor() {
        this.users = ko.observableArray([]);
        this.getUser = (name) => this.users()
            .filter(user => user.name() === name)[0];
        this.loadUsers = () => {
            fetch('/users')
                .then(res => res.json())
                .then(this.parseUsers);
        };
        this.parseUsers = (userList) => {
            const names = Object.keys(userList);
            if (names.length === 0)
                return;
            this.users.removeAll();
            const users = names.map(user => new UserModel(userList[user]));
            this.users(users);
            return true;
        };
        this.addUser = () => {
            const newName = window.prompt('New user name?');
            if (!newName)
                return;
            fetch(`/adduser/${newName}`).then(() => this.loadUsers());
        };
        this.poll = () => {
            fetch('/poll')
                .then(res => res.json())
                .then(this.parseUsers)
                .then(() => this.poll())
                .catch(() => setTimeout(() => this.poll(), 10000));
        };
        this.loadUsers();
        this.poll();
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