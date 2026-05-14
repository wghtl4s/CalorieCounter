export default class ProductValidator {
    static validate(name, calories, proteins, fats, carbs) {
        const errors = [];

        if (!name || name.trim() === '') {
            errors.push("Назва продукту не може бути порожньою.");
        }
        if (name && name.trim().length > 100) {
            errors.push("Назва продукту не може перевищувати 100 символів.");
        }
        if (isNaN(calories) || calories < 0) {
            errors.push("Калорії не можуть бути від'ємними або порожніми.");
        }
        if (calories > 900) {
            errors.push("Калорії на 100г не можуть перевищувати 900 ккал.");
        }
        if (isNaN(proteins) || proteins < 0) {
            errors.push("Білки не можуть бути від'ємними.");
        }
        if (isNaN(fats) || fats < 0) {
            errors.push("Жири не можуть бути від'ємними.");
        }
        if (isNaN(carbs) || carbs < 0) {
            errors.push("Вуглеводи не можуть бути від'ємними.");
        }
        if (!isNaN(proteins) && !isNaN(fats) && !isNaN(carbs) && (proteins + fats + carbs) > 100) {
            errors.push("Сума БЖВ не може перевищувати 100г на 100г продукту.");
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}
