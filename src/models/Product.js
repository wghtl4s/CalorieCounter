import ProductValidator from '../validators/ProductValidator.js';

export default class Product {
    constructor(id, name, caloriesPer100g, proteins = 0, fats = 0, carbs = 0) {
        const result = ProductValidator.validate(name, caloriesPer100g, proteins, fats, carbs);
        if (!result.isValid) {
            throw new Error(result.errors.join(' '));
        }

        this.id = id;
        this.name = name.trim();
        this.caloriesPer100g = parseFloat(caloriesPer100g);
        this.proteins = parseFloat(proteins);
        this.fats = parseFloat(fats);
        this.carbs = parseFloat(carbs);
    }

    calculateCaloriesForWeight(weightInGrams) {
        if (weightInGrams <= 0) return 0;
        return (this.caloriesPer100g * weightInGrams) / 100;
    }

    calculateMacrosForWeight(weightInGrams) {
        if (weightInGrams <= 0) return { proteins: 0, fats: 0, carbs: 0 };
        return {
            proteins: (this.proteins * weightInGrams) / 100,
            fats:     (this.fats * weightInGrams) / 100,
            carbs:    (this.carbs * weightInGrams) / 100
        };
    }

    toJSON() {
        return {
            id: this.id, name: this.name,
            caloriesPer100g: this.caloriesPer100g,
            proteins: this.proteins, fats: this.fats, carbs: this.carbs
        };
    }
}
