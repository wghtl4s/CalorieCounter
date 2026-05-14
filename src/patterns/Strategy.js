class CalorieCalculationStrategy {
    calculate(maintenanceCalories) {
        throw new Error("Метод calculate() має бути реалізований");
    }
}

export class WeightLossStrategy extends CalorieCalculationStrategy {
    calculate(maintenanceCalories) {
        console.log("[Strategy] Застосовано стратегію: Схуднення (-500 ккал)");
        return maintenanceCalories - 500;
    }
}

export class WeightGainStrategy extends CalorieCalculationStrategy {
    calculate(maintenanceCalories) {
        console.log("[Strategy] Застосовано стратегію: Набір маси (+500 ккал)");
        return maintenanceCalories + 500;
    }
}

export class MaintainWeightStrategy extends CalorieCalculationStrategy {
    calculate(maintenanceCalories) {
        console.log("[Strategy] Застосовано стратегію: Підтримка ваги (Без змін)");
        return maintenanceCalories;
    }
}

export class GoalContext {
    constructor(strategy) {
        this.strategy = strategy;
    }

    setStrategy(strategy) {
        this.strategy = strategy;
    }

    executeStrategy(maintenanceCalories) {
        if (!this.strategy) {
            throw new Error("Стратегія не встановлена!");
        }
        return this.strategy.calculate(maintenanceCalories);
    }
}