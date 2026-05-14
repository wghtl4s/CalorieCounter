export default class UserValidator {
    static validate(name, age, weight, height) {
        const errors = [];

        if (!name || name.trim() === '') {
            errors.push("Ім'я не може бути порожнім.");
        }
        if (name && name.trim().length > 50) {
            errors.push("Ім'я не може перевищувати 50 символів.");
        }
        if (isNaN(age) || age <= 0) {
            errors.push("Вік повинен бути більшим за нуль.");
        }
        if (age > 120) {
            errors.push("Вік не може перевищувати 120 років.");
        }
        if (isNaN(weight) || weight <= 0) {
            errors.push("Вага повинна бути більшою за нуль.");
        }
        if (weight > 500) {
            errors.push("Вага не може перевищувати 500 кг.");
        }
        if (isNaN(height) || height <= 0) {
            errors.push("Зріст повинен бути більшим за нуль.");
        }
        if (height > 300) {
            errors.push("Зріст не може перевищувати 300 см.");
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    static validateActivityLevel(level) {
        const validLevels = [1.2, 1.375, 1.55, 1.725, 1.9];
        return validLevels.includes(parseFloat(level));
    }

    static validateGoal(goal) {
        const validGoals = ['lose', 'maintain', 'gain'];
        return validGoals.includes(goal);
    }
}
