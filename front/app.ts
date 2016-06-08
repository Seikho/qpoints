import {User} from "../src/points";

class AppModel {
    constructor() {
        this.loadUsers();
        this.poll();
    }

    users = ko.observableArray<UserModel>([]);

    sortDescending = ko.observable(false);
    sortUsers = () => {
        this.sortDescending(!this.sortDescending());
        const factor = this.sortDescending() ? 1 : -1;
        this.users.sort((left, right) => (right.points() * factor) - (left.points() * factor))
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
    isEnabled = ko.observable(true);

    upvote = () => {
        this.isEnabled(false);
        fetch(`/upvote/${this.name()}`)
            .then(res => res.json())
            .then(res => this.points(res.points))
            .then(() => this.isEnabled(true))
            .catch(() => this.isEnabled(true));
    }

    downvote = () => {
        this.isEnabled(false);
        fetch(`/downvote/${this.name()}`)
            .then(res => res.json())
            .then(res => this.points(res.points))
            .then(() => this.isEnabled(true))
            .catch(() => this.isEnabled(true));
    }
}

ko.applyBindings(new AppModel());

declare function fetch(...args): any;