import WaterLog from '../models/WaterLog.js';

const API_BASE = 'http://localhost:5000/api';

export default class WaterRepository {
    constructor() {
        this._waterLog = null;
    }

    async fetchForToday() {
        const response = await fetch(`${API_BASE}/water`);
        if (!response.ok) throw new Error('Не вдалося завантажити дані про воду.');

        const data = await response.json();

        if (data && data.id) {
            const log = new WaterLog(data.id, data.targetVolume, new Date(data.date));
            log.currentVolume = data.currentVolume;
            log.records = data.records || [];
            this._waterLog = log;
        } else {
            this._waterLog = new WaterLog(Date.now().toString(), 2000);
        }

        return this._waterLog;
    }

    async addWater(amountInMl) {
        const response = await fetch(`${API_BASE}/water/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: amountInMl })
        });

        if (!response.ok) throw new Error('Не вдалося зберегти запис про воду.');

        if (this._waterLog) {
            this._waterLog.addWater(amountInMl);
        }

        return this._waterLog;
    }

    async resetToday() {
        const response = await fetch(`${API_BASE}/water/reset`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) throw new Error('Не вдалося скинути дані про воду.');

        this._waterLog = new WaterLog(Date.now().toString(), 2000);
        return this._waterLog;
    }

    async updateTarget(targetVolume) {
        const response = await fetch(`${API_BASE}/water/target`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ target: targetVolume })
        });

        if (!response.ok) throw new Error('Не вдалося оновити ціль по воді.');

        if (this._waterLog) {
            this._waterLog.targetVolume = targetVolume;
        }

        return this._waterLog;
    }

    getCurrent() {
        return this._waterLog;
    }
}
