export default class FormUI {
    constructor(containerId) {
        this.containerId = containerId;
    }

    renderMealForm() {
        return `
            <div class="form-card">
                <h3>🍽️ Додати прийом їжі</h3>
                <div id="meal-error" class="error-box hidden"></div>
                <div class="form-group">
                    <label>Назва продукту:</label>
                    <input type="text" id="productName" required placeholder="Наприклад: Вівсянка" maxlength="100">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Калорії (на 100г):</label>
                        <input type="number" id="productCalories" required min="0" max="900" step="0.1" placeholder="350">
                    </div>
                    <div class="form-group">
                        <label>Вага порції (г):</label>
                        <input type="number" id="mealWeight" required min="1" max="5000" placeholder="150">
                    </div>
                </div>
                <details class="macros-details">
                    <summary>Макронутрієнти (необов'язково)</summary>
                    <div class="form-row" style="margin-top:12px">
                        <div class="form-group">
                            <label>Білки (г):</label>
                            <input type="number" id="productProteins" value="0" min="0" max="100" step="0.1">
                        </div>
                        <div class="form-group">
                            <label>Жири (г):</label>
                            <input type="number" id="productFats" value="0" min="0" max="100" step="0.1">
                        </div>
                        <div class="form-group">
                            <label>Вуглеводи (г):</label>
                            <input type="number" id="productCarbs" value="0" min="0" max="100" step="0.1">
                        </div>
                    </div>
                </details>
                <button type="button" id="addMealBtn" class="btn-primary" style="margin-top:16px">
                    ➕ Додати продукт
                </button>
            </div>
        `;
    }

    initMealForm(onSubmitCallback) {
        const container = document.getElementById(this.containerId);
        if (!container) {
            console.error(`[FormUI] Контейнер '${this.containerId}' не знайдено.`);
            return;
        }

        container.innerHTML = this.renderMealForm();

        document.getElementById('addMealBtn').addEventListener('click', () => {
            const errorBox = document.getElementById('meal-error');
            errorBox.classList.add('hidden');
            errorBox.textContent = '';

            const formData = {
                name:      document.getElementById('productName').value.trim(),
                calories:  parseFloat(document.getElementById('productCalories').value),
                weight:    parseFloat(document.getElementById('mealWeight').value),
                proteins:  parseFloat(document.getElementById('productProteins').value) || 0,
                fats:      parseFloat(document.getElementById('productFats').value)     || 0,
                carbs:     parseFloat(document.getElementById('productCarbs').value)    || 0
            };

            onSubmitCallback(formData).then(() => {
                this._resetForm();
            }).catch(err => {
                errorBox.textContent = err.message;
                errorBox.classList.remove('hidden');
            });
        });

        console.log('[FormUI] Форма прийому їжі ініціалізована.');
    }

    _resetForm() {
        const fields = ['productName', 'productCalories', 'mealWeight'];
        fields.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        ['productProteins', 'productFats', 'productCarbs'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '0';
        });
        console.log('[FormUI] Форму очищено.');
    }

    showSuccess(message) {
        const errorBox = document.getElementById('meal-error');
        if (!errorBox) return;
        errorBox.textContent = message;
        errorBox.classList.remove('hidden');
        errorBox.classList.add('success-box');
        setTimeout(() => {
            errorBox.classList.add('hidden');
            errorBox.classList.remove('success-box');
        }, 2500);
    }
}
