"use strict";
class AppModel {
    constructor() {
        this.users = ko.observableArray([]);
        this.upvote = (name) => {
            const user = this.getUser(name);
            fetch(`/upvote/${name}`)
                .then(res => res.json())
                .then(res => user.points(res.points));
        };
        this.downvote = (name) => {
            const user = this.getUser(name);
            fetch(`/downvote/${name}`)
                .then(res => res.json())
                .then(res => user.points(res.points));
        };
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
        this.name(user.name);
        this.points(user.points);
    }
}
ko.applyBindings(new AppModel());
//# sourceMappingURL=app.js.map