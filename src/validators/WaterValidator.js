export default class WaterValidator {
    static validateTarget(target) {
        const errors = [];

        if (isNaN(target) || target <= 0) {
            errors.push("Цільовий об'єм води має бути більшим за нуль.");
        }
        if (target > 10000) {
            errors.push("Цільовий об'єм не може перевищувати 10 000 мл.");
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    static validateAmount(amount) {
        const errors = [];

        if (isNaN(amount) || amount <= 0) {
            errors.push("Кількість випитої води має бути більшою за нуль.");
        }
        if (amount > 5000) {
            errors.push("Не можна додати більше 5 000 мл за один раз.");
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}
