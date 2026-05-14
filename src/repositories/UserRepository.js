import User from '../models/User.js';

const API_BASE = 'http://localhost:5000/api';

export default class UserRepository {
    constructor() {
        this._user = null;
    }

    async fetch() {
        const response = await fetch(`${API_BASE}/data`);
        if (!response.ok) throw new Error('Не вдалося завантажити дані.');

        const data = await response.json();

        if (data.user) {
            const u = data.user;
            this._user = new User(u.id, u.name, u.gender, u.age, u.weight, u.height, u.activityLevel, u.goal);
        } else {
            this._user = null;
        }

        return this._user;
    }

    async save(user) {
        const response = await fetch(`${API_BASE}/user`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        });

        if (!response.ok) throw new Error('Не вдалося зберегти профіль.');

        this._user = user;
        return user;
    }

    getCurrent() {
        return this._user;
    }

    hasUser() {
        return this._user !== null;
    }
}
