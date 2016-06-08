/// <reference path="../typings/knockout/knockout.d.ts" />
import {User} from "../src/points";

class AppModel {
    constructor() {
        this.loadUsers();
    }

    users = ko.observableArray<UserModel>([]);


    upvote = (name: string) => {
        const user = this.getUser(name);
        fetch(`/upvote/${name}`)
            .then(res => res.json())
            .then(res => user.points(res.points));
    }

    downvote = (name: string) => {
        const user = this.getUser(name);
        fetch(`/downvote/${name}`)
            .then(res => res.json())
            .then(res => user.points(res.points));
    }

    getUser = (name: string) => this.users()
        .filter(user => user.name() === name)[0];


    loadUsers = () => {
        fetch('/users')
            .then(res => res.json())
            .then(res => {
                const names = Object.keys(res);
                if (names.length === 0) return;

                this.users.removeAll();
                const users = names.map(user => new UserModel(res[user]));
                this.users(users);
            });
    }

    addUser = () => {
        const newName = window.prompt('New user name?');
        if (!newName) return;
        fetch(`/adduser/${newName}`).then(() => this.loadUsers());
    }
}

class UserModel {
    constructor(user: User) {
        this.name(user.name);
        this.points(user.points);
    }

    name = ko.observable('');
    points = ko.observable(0);
}

ko.applyBindings(new AppModel());

declare function fetch(...args): any;