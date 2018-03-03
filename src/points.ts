import * as events from 'events'
import { readBackup } from './backup'

export const emitter = new events.EventEmitter()
emitter.setMaxListeners(0)

export interface User {
  name: string
  points: number
}

const userStore: { [name: string]: User } = {}

export function upvote(name: string) {
  addUser(name)
  const user = getUser(name)

  user.points++
  emitter.emit('users', getUsers())
  return user
}

export function downvote(name: string) {
  addUser(name)
  const user = getUser(name)

  user.points--
  emitter.emit('users', getUsers())
  return user
}

export function getUsers() {
  return userStore
}

export function addUser(name: string) {
  const lowerName = name.toLowerCase()
  if (userStore[lowerName] !== undefined) return

  const maxUsers = 50
  const users = Object.keys(userStore)
  const userCount = users.length

  if (userCount === maxUsers) {
    const sortedUsers = users.sort(
      (left, right) => userStore[left].points - userStore[right].points
    )
    delete userStore[sortedUsers[0]]
  }

  userStore[lowerName] = {
    name,
    points: 0
  }

  emitter.emit('users', getUsers())
}

export function getUser(name: string) {
  const lowerName = name.toLowerCase()
  return userStore[lowerName]
}

export function loadFromBackup() {
  const existingUsers = Object.keys(userStore)
  if (existingUsers.length > 0) {
    existingUsers.forEach(user => delete userStore[user])
  }

  const users = readBackup()
  Object.keys(users).forEach(user => (userStore[user] = users[user]))
}
