import Product from '../models/Product.js';
import MealEntry from '../models/MealEntry.js';

export default class MealFactory {
    static createProduct(formData) {
        return new Product(
            Date.now().toString(),
            formData.name,
            formData.calories,
            formData.proteins,
            formData.fats,
            formData.carbs
        );
    }

    static createMealEntry(formData) {
        const product = MealFactory.createProduct(formData);
        return new MealEntry(
            Date.now().toString(),
            product,
            formData.weight
        );
    }

    static createMealEntryFromRaw(rawData) {
        const p = rawData.product;
        const product = new Product(
            p.id, p.name, p.caloriesPer100g,
            p.proteins, p.fats, p.carbs
        );
        return new MealEntry(
            rawData.id,
            product,
            rawData.weightInGrams,
            new Date(rawData.date)
        );
    }
}