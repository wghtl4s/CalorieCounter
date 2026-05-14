export default class WaterUI {
    constructor(containerId) {
        this.containerId = containerId;
    }

    render(waterLog) {
        const pct = waterLog.getProgressPercentage();
        const remaining = waterLog.getRemaining();
        const isReached = waterLog.isGoalReached();

        const recordsHtml = waterLog.records.length > 0
            ? waterLog.records.slice().reverse().map(r => `
                <li class="water-record">
                    <span class="water-time">${r.time}</span>
                    <span class="water-amount">+${r.amount} мл</span>
                </li>`).join('')
            : '<li class="empty-state">Ще не пили воду сьогодні 💧</li>';

        return `
            <div class="dashboard-widget water-widget">
                <h3>💧 Водний баланс</h3>

                <div class="water-circle-container">
                    <svg class="water-circle" viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r="50" fill="none" stroke="#e0e0e0" stroke-width="10"/>
                        <circle cx="60" cy="60" r="50" fill="none"
                            stroke="${isReached ? '#78bf7d' : '#4fc3f7'}"
                            stroke-width="10"
                            stroke-dasharray="${Math.round(2 * Math.PI * 50)}"
                            stroke-dashoffset="${Math.round(2 * Math.PI * 50 * (1 - pct / 100))}"
                            stroke-linecap="round"
                            transform="rotate(-90 60 60)"/>
                        <text x="60" y="55" text-anchor="middle" class="circle-value" font-size="18" fill="var(--text-color)" font-weight="bold">
                            ${waterLog.currentVolume}
                        </text>
                        <text x="60" y="72" text-anchor="middle" font-size="10" fill="#888">
                            з ${waterLog.targetVolume} мл
                        </text>
                    </svg>
                </div>

                ${isReached
                    ? '<p class="success-text">🎉 Ціль виконана! Чудова робота!</p>'
                    : `<p class="water-remaining">Ще <strong>${remaining} мл</strong> до цілі</p>`
                }

                <div class="quick-water-buttons">
                    <button class="btn-water" data-amount="150">150 мл</button>
                    <button class="btn-water" data-amount="200">200 мл</button>
                    <button class="btn-water" data-amount="250">250 мл</button>
                    <button class="btn-water" data-amount="500">500 мл</button>
                </div>

                <div class="custom-water-row">
                    <input type="number" id="customWaterAmount" min="1" max="5000" placeholder="Своя кількість (мл)">
                    <button class="btn-secondary" id="addCustomWater">Додати</button>
                </div>

                <div class="water-target-row">
                    <label>Денна ціль (мл):</label>
                    <input type="number" id="waterTarget" value="${waterLog.targetVolume}" min="100" max="10000">
                    <button class="btn-secondary" id="saveWaterTarget">Зберегти</button>
                </div>

                <ul class="water-records">
                    <strong>Журнал:</strong>
                    ${recordsHtml}
                </ul>
            </div>
        `;
    }

    update(containerId, waterLog, onAddWater, onUpdateTarget) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`[WaterUI] Контейнер '${containerId}' не знайдено.`);
            return;
        }

        container.innerHTML = this.render(waterLog);

        // Quick-add buttons
        container.querySelectorAll('.btn-water').forEach(btn => {
            btn.addEventListener('click', () => {
                const amount = parseInt(btn.dataset.amount);
                onAddWater(amount);
            });
        });

        // Custom amount
        document.getElementById('addCustomWater').addEventListener('click', () => {
            const input = document.getElementById('customWaterAmount');
            const amount = parseInt(input.value);
            if (amount > 0) {
                onAddWater(amount);
                input.value = '';
            }
        });

        // Update target
        document.getElementById('saveWaterTarget').addEventListener('click', () => {
            const target = parseInt(document.getElementById('waterTarget').value);
            if (target > 0) onUpdateTarget(target);
        });
    }
}
