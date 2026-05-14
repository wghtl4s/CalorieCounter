import WaterValidator from '../validators/WaterValidator.js';

export default class WaterLog {
    constructor(id, targetVolume = 2000, date = new Date()) {
        const result = WaterValidator.validateTarget(targetVolume);
        if (!result.isValid) {
            throw new Error(result.errors.join(' '));
        }

        this.id = id;
        this.targetVolume = targetVolume;
        this.currentVolume = 0;
        this.date = date;
        this.records = [];
    }

    addWater(amountInMl) {
        const result = WaterValidator.validateAmount(amountInMl);
        if (!result.isValid) {
            throw new Error(result.errors.join(' '));
        }

        this.currentVolume += amountInMl;
        this.records.push({
            amount: amountInMl,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
    }

    getRemaining() {
        const remaining = this.targetVolume - this.currentVolume;
        return remaining > 0 ? remaining : 0;
    }

    getProgressPercentage() {
        const percent = (this.currentVolume / this.targetVolume) * 100;
        return Math.min(Math.round(percent), 100);
    }

    isGoalReached() {
        return this.currentVolume >= this.targetVolume;
    }

    toJSON() {
        return {
            id: this.id,
            targetVolume: this.targetVolume,
            currentVolume: this.currentVolume,
            date: this.date,
            records: this.records
        };
    }
}
