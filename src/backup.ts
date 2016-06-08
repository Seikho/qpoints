import * as fs from 'fs';
import {getUsers} from './points';

export default function backup() {
    const users = getUsers();
    const json = JSON.stringify(getUsers());
    fs.writeFileSync('users.json', json);
}

export function readBackup() {
    try {
        const json = fs.readFileSync('users.json').toString();
        const users = JSON.parse(json);
        return users;
    }
    catch (ex) {
        return {}
    }
}