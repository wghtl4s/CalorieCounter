export default class Observer {
    constructor() {
        this.listeners = {};
    }

    subscribe(eventType, callback) {
        if (typeof callback !== 'function') {
            console.warn(`[Observer] subscribe() очікує функцію, отримано: ${typeof callback}`);
            return;
        }

        if (!this.listeners[eventType]) {
            this.listeners[eventType] = [];
        }

        // Захист від дублювання: якщо той самий колбек вже підписаний
        // на цю подію — не додаємо його повторно. Без цього переключення
        // вкладок в app.js накопичує refreshWater у масиві підписників,
        // і кожен notify('waterAdded') викликає зайві мережеві запити.
        if (this.listeners[eventType].includes(callback)) {
            console.warn(`[Observer] Колбек вже підписаний на подію: ${eventType}`);
            return;
        }

        this.listeners[eventType].push(callback);
        console.log(`[Observer] Підписано на подію: ${eventType}`);
    }

    unsubscribe(eventType, callback) {
        if (!this.listeners[eventType]) return;

        const before = this.listeners[eventType].length;
        this.listeners[eventType] = this.listeners[eventType].filter(cb => cb !== callback);

        // помилки де unsubscribe викликається для незареєстрованого колбеку
        if (this.listeners[eventType].length === before) {
            console.warn(`[Observer] unsubscribe: колбек не знайдено для події: ${eventType}`);
        }
    }

    notify(eventType, data) {
        if (!this.listeners[eventType] || this.listeners[eventType].length === 0) {
            console.log(`[Observer] Подія ${eventType} відбулася, але підписників немає.`);
            return;
        }

        console.log(`[Observer] Сповіщення підписників про: ${eventType} (${this.listeners[eventType].length} шт.)`);

        // опіюємо масив перед ітерацією якщо колбек зсередини викликає
        // unsubscribe, оригінальний масив змінюється і forEach пропускає

        [...this.listeners[eventType]].forEach(callback => callback(data));
    }
}
