import UserValidator from '../validators/UserValidator.js';
import { GoalContext, WeightLossStrategy, WeightGainStrategy, MaintainWeightStrategy } from '../patterns/Strategy.js';

export default class User {
    constructor(id, name, gender, age, weight, height, activityLevel, goal = 'maintain') {
        const result = UserValidator.validate(name, age, weight, height);
        if (!result.isValid) {
            throw new Error(result.errors.join(' '));
        }

        this.id = id;
        this.name = name;
        this.gender = gender;
        this.age = parseInt(age);
        this.weight = parseFloat(weight);
        this.height = parseFloat(height);
        this.activityLevel = parseFloat(activityLevel);
        this.goal = goal;

        this._goalContext = this._buildGoalContext(goal);
    }

    _buildGoalContext(goal) {
        switch (goal) {
            case 'lose':     return new GoalContext(new WeightLossStrategy());
            case 'gain':     return new GoalContext(new WeightGainStrategy());
            case 'maintain':
            default:         return new GoalContext(new MaintainWeightStrategy());
        }
    }

    calculateBMR() {
        const base = (10 * this.weight) + (6.25 * this.height) - (5 * this.age);
        return this.gender === 'male' ? base + 5 : base - 161;
    }

    calculateMaintenanceCalories() {
        return this.calculateBMR() * this.activityLevel;
    }

    calculateDailyCalories() {
        const maintenance = this.calculateMaintenanceCalories();
        return Math.round(this._goalContext.executeStrategy(maintenance));
    }

    calculateMacroSplit() {
        const totalCalories = this.calculateDailyCalories();
        let proteinPercent, fatPercent, carbPercent;

        if (this.goal === 'lose') {
            proteinPercent = 0.40; fatPercent = 0.30; carbPercent = 0.30;
        } else if (this.goal === 'gain') {
            proteinPercent = 0.30; fatPercent = 0.25; carbPercent = 0.45;
        } else {
            proteinPercent = 0.30; fatPercent = 0.30; carbPercent = 0.40;
        }

        return {
            proteins: Math.round((totalCalories * proteinPercent) / 4),
            fats:     Math.round((totalCalories * fatPercent) / 9),
            carbs:    Math.round((totalCalories * carbPercent) / 4)
        };
    }

    getGoalLabel() {
        const labels = { lose: 'Схуднення', maintain: 'Підтримка ваги', gain: 'Набір маси' };
        return labels[this.goal] || 'Невідомо';
    }

    getActivityLabel() {
        const levels = {
            1.2:   'Сидячий спосіб життя',
            1.375: 'Легка активність (1-3 рази/тиж)',
            1.55:  'Помірна активність (3-5 разів/тиж)',
            1.725: 'Висока активність (6-7 разів/тиж)',
            1.9:   'Дуже висока активність'
        };
        return levels[this.activityLevel] || 'Невідомо';
    }

    toJSON() {
        return {
            id: this.id, name: this.name, gender: this.gender,
            age: this.age, weight: this.weight, height: this.height,
            activityLevel: this.activityLevel, goal: this.goal
        };
    }

    calculateBMI() {
        const heightInMeters = this.height / 100;
        return parseFloat((this.weight / (heightInMeters * heightInMeters)).toFixed(1));
    }

    getBMICategory() {
        const bmi = this.calculateBMI();
        if (bmi < 18.5) return { label: 'Недостатня вага', color: '#4fc3f7' };
        if (bmi < 25)   return { label: 'Нормальна вага',  color: '#78bf7d' };
        if (bmi < 30)   return { label: 'Надмірна вага',   color: '#ffa726' };
        return               { label: 'Ожиріння',          color: '#cd594e' };
    }

    calculateIdealWeight() {
        if (this.gender === 'male') {
            return parseFloat((50 + 2.3 * ((this.height / 2.54) - 60)).toFixed(1));
        }
        return parseFloat((45.5 + 2.3 * ((this.height / 2.54) - 60)).toFixed(1));
    }

    calculateWaterNorm() {
        return Math.round(this.weight * 33);
    }

    getWeightToGoal() {
        const ideal = this.calculateIdealWeight();
        const diff  = parseFloat((this.weight - ideal).toFixed(1));
        if (Math.abs(diff) < 1) return { diff: 0, label: 'Ви на ідеальній вазі' };
        return diff > 0
            ? { diff, label: `${diff} кг до ідеальної ваги` }
            : { diff, label: `${Math.abs(diff)} кг нижче ідеальної ваги` };
    }
}
