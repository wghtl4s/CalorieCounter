export default class DashboardUI {
    constructor(containerId) {
        this.containerId = containerId;
    }

    renderCalorieProgress(currentCalories, targetCalories) {
        const target = targetCalories > 0 ? targetCalories : 2000;
        const percentage = Math.min((currentCalories / target) * 100, 100).toFixed(1);
        const isExceeded = currentCalories > target;
        const remaining = Math.max(target - currentCalories, 0);

        return `
            <div class="dashboard-widget calories-widget">
                <div class="widget-header">
                    <h3>🔥 Калорії за день</h3>
                    <span class="widget-date">${new Date().toLocaleDateString('uk-UA', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                </div>
                <div class="progress-bar-container">
                    <div class="progress-bar ${isExceeded ? 'danger' : 'success'}" style="width: ${percentage}%"></div>
                </div>
                <div class="calorie-stats">
                    <div class="calorie-stat">
                        <span class="calorie-stat-value">${currentCalories.toFixed(0)}</span>
                        <span class="calorie-stat-label">Спожито</span>
                    </div>
                    <div class="calorie-stat">
                        <span class="calorie-stat-value">${target.toFixed(0)}</span>
                        <span class="calorie-stat-label">Ціль</span>
                    </div>
                    <div class="calorie-stat">
                        <span class="calorie-stat-value ${isExceeded ? 'text-danger' : ''}">${isExceeded ? '+' + (currentCalories - target).toFixed(0) : remaining.toFixed(0)}</span>
                        <span class="calorie-stat-label">${isExceeded ? 'Перевищено' : 'Залишилось'}</span>
                    </div>
                </div>
                ${isExceeded ? '<p class="warning-text">⚠️ Денний ліміт перевищено!</p>' : ''}
            </div>
        `;
    }

    renderMacroProgress(currentMacros, targetMacros) {
        const macros = [
            { key: 'proteins', label: 'Білки',    unit: 'г', color: '#ef5350' },
            { key: 'fats',     label: 'Жири',     unit: 'г', color: '#ffa726' },
            { key: 'carbs',    label: 'Вуглеводи', unit: 'г', color: '#42a5f5' }
        ];

        const barsHtml = macros.map(m => {
            const current = currentMacros[m.key] || 0;
            const target  = targetMacros  ? (targetMacros[m.key] || 1) : 1;
            const pct     = Math.min((current / target) * 100, 100).toFixed(0);
            return `
                <div class="macro-row">
                    <span class="macro-label">${m.label}</span>
                    <div class="macro-bar-wrap">
                        <div class="macro-bar" style="width:${pct}%; background:${m.color}"></div>
                    </div>
                    <span class="macro-value">${current.toFixed(1)} / ${target}${m.unit}</span>
                </div>
            `;
        }).join('');

        return `
            <div class="dashboard-widget macros-widget">
                <h3>🥗 Макронутрієнти</h3>
                <div class="macros-breakdown">
                    ${barsHtml}
                </div>
                ${!targetMacros ? '<p class="form-hint">Заповніть профіль, щоб бачити персональні цілі по БЖВ.</p>' : ''}
            </div>
        `;
    }

    renderMealList(meals, onDeleteCallback) {
        if (!meals || meals.length === 0) {
            return `
                <div class="dashboard-widget meal-list-widget">
                    <h3>📋 Щоденник харчування</h3>
                    <p class="empty-state">Ви ще нічого не додали сьогодні. Час перекусити! 🍽️</p>
                </div>
            `;
        }

        const listHtml = meals.map(meal => {
            const s = meal.getSummary();
            return `
                <li class="meal-item" data-id="${meal.id}">
                    <div class="meal-item-main">
                        <span class="meal-time">${s.time}</span>
                        <div class="meal-details">
                            <span class="meal-name">${s.name} <small>(${s.weight}г)</small></span>
                            <span class="meal-macros-tiny">Б: ${s.proteins}г · Ж: ${s.fats}г · В: ${s.carbs}г</span>
                        </div>
                    </div>
                    <div class="meal-item-right">
                        <span class="meal-cals"><strong>${s.calories} ккал</strong></span>
                        <button class="btn-delete" data-id="${meal.id}" title="Видалити">✕</button>
                    </div>
                </li>
            `;
        }).join('');

        return `
            <div class="dashboard-widget meal-list-widget">
                <h3>📋 Щоденник харчування</h3>
                <ul class="meal-list" id="meal-list-ul">${listHtml}</ul>
            </div>
        `;
    }

    renderDailySummary(meals) {
        if (!meals || meals.length === 0) return '';

        const totalWeight = meals.reduce((s, m) => s + m.weightInGrams, 0);
        const avgCalPer100 = meals.length > 0
            ? (meals.reduce((s, m) => s + m.product.caloriesPer100g, 0) / meals.length).toFixed(0)
            : 0;
        const highCalMeals = meals.filter(m => m.isHighCalorie && m.isHighCalorie(400));
        const mealCount = meals.length;

        return `
        <div class="dashboard-widget summary-widget">
            <h3>📊 Статистика дня</h3>
            <div class="summary-grid">
                <div class="summary-item">
                    <span class="summary-value">${mealCount}</span>
                    <span class="summary-label">прийомів їжі</span>
                </div>
                <div class="summary-item">
                    <span class="summary-value">${totalWeight}г</span>
                    <span class="summary-label">загальна вага</span>
                </div>
                <div class="summary-item">
                    <span class="summary-value">${avgCalPer100}</span>
                    <span class="summary-label">сер. ккал/100г</span>
                </div>
                <div class="summary-item">
                    <span class="summary-value">${highCalMeals.length}</span>
                    <span class="summary-label">висококалорійних</span>
                </div>
            </div>
        </div>
    `;
    }

    renderWeeklyChart(weeklyData) {
        if (!weeklyData || weeklyData.length === 0) return '';

        const maxCal = Math.max(...weeklyData.map(d => d.calories), 1);
        const barsHtml = weeklyData.map(day => {
            const heightPct = Math.round((day.calories / maxCal) * 100);
            const isToday   = day === weeklyData[weeklyData.length - 1];
            return `
            <div class="week-bar-col">
                <span class="week-bar-value">${day.calories > 0 ? day.calories : ''}</span>
                <div class="week-bar-wrap">
                    <div class="week-bar ${isToday ? 'today' : ''}"
                         style="height:${heightPct}%"></div>
                </div>
                <span class="week-bar-label">${day.date}</span>
            </div>
        `;
        }).join('');

        return `
        <div class="dashboard-widget weekly-widget">
            <h3>📅 Калорії за тиждень</h3>
            <div class="weekly-chart">${barsHtml}</div>
        </div>
    `;
    }

    updateDashboard(currentCalories, targetCalories, currentMacros, targetMacros, meals, weeklyData,onDeleteCallback) {
        const container = document.getElementById(this.containerId);
        if (!container) {
            console.error(`[DashboardUI] Елемент '${this.containerId}' не знайдено.`);
            return;
        }

        container.innerHTML =
            this.renderCalorieProgress(currentCalories, targetCalories) +
            this.renderMacroProgress(currentMacros, targetMacros) +
            this.renderWeeklyChart(weeklyData) +
            this.renderDailySummary(meals) +
            this.renderMealList(meals, onDeleteCallback);

        container.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                if (confirm('Видалити цей запис?')) {
                    onDeleteCallback(id);
                }
            });
        });

        console.log('[DashboardUI] Дашборд оновлено.');
    }
}
