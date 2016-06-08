/// <reference path="../typings/knockout/knockout.d.ts" />
import {User} from "../src/points";

class AppModel {
    constructor() {
        this.loadUsers();
        this.poll();
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
            .then(this.parseUsers);
    }

    parseUsers = (userList: any) => {
        const names = Object.keys(userList);
        if (names.length === 0) return;

        this.users.removeAll();
        const users = names.map(user => new UserModel(userList[user]));
        this.users(users);
        return true;
    }

    addUser = () => {
        const newName = window.prompt('New user name?');
        if (!newName) return;
        fetch(`/adduser/${newName}`).then(() => this.loadUsers());
    }

    poll = () => {
        fetch('/poll')
            .then(res => res.json())
            .then(this.parseUsers)
            .then(() => this.poll())
            .catch(() => setTimeout(() => this.poll(), 10000));
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