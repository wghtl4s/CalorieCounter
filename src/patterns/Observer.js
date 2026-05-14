export default class Observer {
    constructor() {
        this.listeners = {};
    }

    subscribe(eventType, callback) {
        if (!this.listeners[eventType]) {
            this.listeners[eventType] = [];
        }
        this.listeners[eventType].push(callback);
        console.log(`[Observer] Підписано на подію: ${eventType}`);
    }

    unsubscribe(eventType, callback) {
        if (!this.listeners[eventType]) return;

        this.listeners[eventType] = this.listeners[eventType].filter(cb => cb !== callback);
    }

    notify(eventType, data) {
        if (!this.listeners[eventType] || this.listeners[eventType].length === 0) {
            console.log(`[Observer] Подія ${eventType} відбулася, але підписників немає.`);
            return;
        }

        console.log(`[Observer] Сповіщення підписників про: ${eventType}`);
        this.listeners[eventType].forEach(callback => callback(data));
    }
}