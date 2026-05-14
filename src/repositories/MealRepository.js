import Product from '../models/Product.js';
import MealEntry from '../models/MealEntry.js';

const API_BASE = 'http://localhost:5000/api';

export default class MealRepository {
    constructor() {
        this._meals = [];
    }

    async fetchAll() {
        const response = await fetch(`${API_BASE}/data`);
        if (!response.ok) throw new Error('Не вдалося завантажити дані.');

        const data = await response.json();

        this._meals = (data.meals || []).map(item => {
            const p = item.product;
            const product = new Product(p.id, p.name, p.caloriesPer100g, p.proteins, p.fats, p.carbs);
            return new MealEntry(item.id, product, item.weightInGrams, new Date(item.date));
        });

        return [...this._meals];
    }

    async save(mealEntry) {
        const response = await fetch(`${API_BASE}/meals`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mealEntry)
        });

        if (!response.ok) throw new Error('Не вдалося зберегти запис.');

        this._meals.push(mealEntry);
        return mealEntry;
    }

    async delete(mealId) {
        const response = await fetch(`${API_BASE}/meals/${mealId}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Не вдалося видалити запис.');

        this._meals = this._meals.filter(m => m.id !== mealId);
        return mealId;
    }

    getAll() {
        return [...this._meals];
    }

    getByDate(date) {
        const targetDate = new Date(date).toDateString();
        return this._meals.filter(m => new Date(m.date).toDateString() === targetDate);
    }

    getTotalCaloriesForDate(date) {
        return this.getByDate(date).reduce((sum, meal) => sum + meal.totalCalories, 0);
    }

    getTotalMacrosForDate(date) {
        const meals = this.getByDate(date);
        return meals.reduce(
            (acc, meal) => ({
                proteins: acc.proteins + meal.totalMacros.proteins,
                fats: acc.fats + meal.totalMacros.fats,
                carbs: acc.carbs + meal.totalMacros.carbs
            }),
            { proteins: 0, fats: 0, carbs: 0 }
        );
    }

    getWeeklyCalories() {
        const result = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            result.push({
                date:     date.toLocaleDateString('uk-UA', { weekday: 'short', day: 'numeric' }),
                calories: parseFloat(this.getTotalCaloriesForDate(date).toFixed(0))
            });
        }
        return result;
    }

    getMostCaloricMeal() {
        if (this._meals.length === 0) return null;
        return this._meals.reduce((max, m) => m.totalCalories > max.totalCalories ? m : max);
    }

    searchByName(query) {
        const q = query.toLowerCase().trim();
        return this._meals.filter(m => m.product.name.toLowerCase().includes(q));
    }

    getTodayMeals() {
        return this.getByDate(new Date());
    }
}
