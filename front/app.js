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
                .then(res => {
                const names = Object.keys(res);
                if (names.length === 0)
                    return;
                this.users.removeAll();
                const users = names.map(user => new UserModel(res[user]));
                this.users(users);
            });
        };
        this.addUser = () => {
            const newName = window.prompt('New user name?');
            if (!newName)
                return;
            fetch(`/adduser/${newName}`).then(() => this.loadUsers());
        };
        this.loadUsers();
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