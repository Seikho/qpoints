import 'fetch-polyfill'
import * as ko from 'knockout'
import { User } from '../src/points'

enum Sort {
  Unsorted,
  Descending,
  Ascending
}

class AppModel {
  constructor() {
    this.loadUsers()
    this.poll()
    setInterval(() => this.ping(), 20000)
    this.ping()

    setInterval(() => this.randomize(), 1000)
  }

  users = ko.observableArray<UserModel>([])

  hardmodeEnabled = ko.observable(false)
  gethardmodeStyle = () => {
    const element = document.getElementById('hardmode')
    if (!this.hardmodeEnabled()) {
      return ''
    }

    const left = Math.floor(window.innerWidth * Math.random()).toString()
    const top = Math.floor(window.innerHeight * Math.random()).toString()
    const position = 'absolute'
    return `position: ${position}; top: ${top}px; left: ${left}px`
  }

  sortDescending = ko.observable(false)
  sortDirection = ko.observable(Sort.Unsorted)

  changeSort = () => {
    this.sortDirection(this.sortDirection() === Sort.Ascending ? Sort.Descending : Sort.Ascending)
    this.sortUsers()
  }

  sortUsers = () => {
    const sort = this.sortDirection()
    if (sort === Sort.Unsorted) return
    if (this.hardmodeEnabled()) return

    const factor = this.sortDirection() === Sort.Ascending ? 1 : -1
    const compareNames = (left: UserModel, right: UserModel) =>
      left.name() > right.name() ? 1 : -1
    this.users.sort(
      (left, right) =>
        right.points() === left.points()
          ? compareNames(left, right) * factor
          : right.points() * factor - left.points() * factor
    )
  }

  randomize = () => {
    // this is not ideal, but neither is this entire application
    document.getElementById('hardmode').style.cssText = this.gethardmodeStyle()

    if (!this.hardmodeEnabled()) return
    const randomFactor = () => (Math.random() > 0.5 ? 1 : -1)
    this.users.sort((left, right) => randomFactor())
  }

  getUser = (name: string) => this.users().filter(user => user.name() === name)[0]

  loadUsers = () => {
    fetch('/users')
      .then(res => res.json())
      .then(this.parseUsers)
  }

  pingTime = ko.observable(-1)
  ping = () => {
    const start = new Date().valueOf()
    fetch('/ping').then(() => this.pingTime(new Date().valueOf() - start))
  }

  parseUsers = (userList: { [name: string]: User }): any => {
    const names = Object.keys(userList)
    if (names.length === 0) return

    const users = this.users()
    const findUser = (name: string) => users.filter(user => user.name() === userList[name].name)[0]

    names.forEach(name => {
      const user = findUser(name)
      if (!user) {
        this.users.push(new UserModel(userList[name]))
        return
      }
      user.points(userList[name].points)
    })

    users.forEach(user => {
      const exists = names.some(name => userList[name].name === user.name())
      if (exists) return
      this.users.remove(user)
    })

    this.sortUsers()
    return true
  }

  addUser = () => {
    const newName = window.prompt('New user name?')
    if (!newName) return
    fetch(`/adduser/${newName}`).then(() => this.loadUsers())
  }

  poll = () => {
    setTimeout(
      () =>
        fetch('/poll')
          .then(res => res.json())
          .then(this.parseUsers)
          .then(() => this.poll())
          .catch(() => setTimeout(() => this.poll(), 10000)),
      500
    )
  }
}

class UserModel {
  constructor(user: User) {
    this.name(user.name)
    this.points(user.points)
  }

  name = ko.observable('')
  points = ko.observable(0)
  isEnabled = ko.observable(true)

  upvote = () => {
    this.isEnabled(false)
    fetch(`/upvote/${this.name()}`)
      .then(res => res.json())
      .then(res => this.points(res.points))
      .then(() => this.isEnabled(true))
      .catch(() => this.isEnabled(true))
  }

  downvote = () => {
    this.isEnabled(false)
    fetch(`/downvote/${this.name()}`)
      .then(res => res.json())
      .then(res => this.points(res.points))
      .then(() => this.isEnabled(true))
      .catch(() => this.isEnabled(true))
  }
}

ko.applyBindings(new AppModel())
console.log('?')

declare function fetch(...args): any
