import {User} from "../src/points";

enum Sort {
    Unsorted,
    Descending,
    Ascending
}

class AppModel {
    constructor() {
        this.loadUsers();
        this.poll();
        setInterval(() => this.ping(), 20000);
        this.ping();

        setInterval(() => this.sortUsersRandomly(), 1000);
    }

    users = ko.observableArray<UserModel>([]);

    hardmodeEnabled = ko.observable(false);

    sortDescending = ko.observable(false);
    sortDirection = ko.observable(Sort.Unsorted);

    changeSort = () => {        
        this.sortDirection(this.sortDirection() === Sort.Ascending ? Sort.Descending : Sort.Ascending);
        this.sortUsers();
    }

    sortUsers = () => {
        const sort = this.sortDirection();
        if (sort === Sort.Unsorted) return;

        const factor = this.sortDirection() === Sort.Ascending ? 1 : -1;
        this.users.sort((left, right) => (right.points() * factor) - (left.points() * factor))
    }
    
    sortUsersRandomly = () => {
        if (!this.hardmodeEnabled()) return;
        const randomFactor = () => Math.random() > 0.5 ? 1 : -1;
        this.users.sort((left, right) => randomFactor())
    }

    getUser = (name: string) => this.users()
        .filter(user => user.name() === name)[0];


    loadUsers = () => {
        fetch('/users')
            .then(res => res.json())
            .then(this.parseUsers);
    }

    pingTime = ko.observable(-1);
    ping = () => {
        const start = new Date().valueOf();
        fetch('/ping')
            .then(() => this.pingTime(new Date().valueOf() - start));
    }

    parseUsers = (userList: any): any => {
        const names = Object.keys(userList);
        if (names.length === 0) return;

        this.users.removeAll();
        const users = names.map(user => new UserModel(userList[user]));
        this.users(users);
        this.sortUsers();
        return true;
    }

    addUser = () => {
        const newName = window.prompt('New user name?');
        if (!newName) return;
        fetch(`/adduser/${newName}`).then(() => this.loadUsers());
    }

    poll = () => {
        setTimeout(() => fetch('/poll')
            .then(res => res.json())
            .then(this.parseUsers)
            .then(() => this.poll())
            .catch(() => setTimeout(() => this.poll(), 10000)),
            500);
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