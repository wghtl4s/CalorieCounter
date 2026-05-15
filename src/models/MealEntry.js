export default class MealEntry {
    constructor(id, product, weightInGrams, date = new Date()) {
        if (!product) throw new Error("Продукт обов'язковий для запису прийому їжі.");
        if (weightInGrams <= 0) throw new Error("Вага порції повинна бути більшою за нуль.");

        this.id            = id;
        this.product       = product;
        this.weightInGrams = weightInGrams;
        this.date          = date;
        this.totalCalories = product.calculateCaloriesForWeight(weightInGrams);
        this.totalMacros   = product.calculateMacrosForWeight(weightInGrams);
    }

    getSummary() {
        return {
            name:     this.product.name,
            weight:   this.weightInGrams,
            calories: this.totalCalories.toFixed(1),
            proteins: this.totalMacros.proteins.toFixed(1),
            fats:     this.totalMacros.fats.toFixed(1),
            carbs:    this.totalMacros.carbs.toFixed(1),
            time:     this.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
    }

    getCalorieBreakdown() {
        return {
            fromProteins: parseFloat((this.totalMacros.proteins * 4).toFixed(1)),
            fromFats:     parseFloat((this.totalMacros.fats * 9).toFixed(1)),
            fromCarbs:    parseFloat((this.totalMacros.carbs * 4).toFixed(1)),
            total:        parseFloat(this.totalCalories.toFixed(1))
        };
    }

    isHighCalorie(threshold = 400) {
        return this.totalCalories > threshold;
    }

    toJSON() {
        return {
            id:            this.id,
            product:       this.product.toJSON(),
            weightInGrams: this.weightInGrams,
            date:          this.date,
            totalCalories: this.totalCalories,
            totalMacros:   this.totalMacros
        };
    }
}