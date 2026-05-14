export default class UserProfileUI {
    constructor(containerId) {
        this.containerId = containerId;
    }

    renderProfileForm(existingUser = null) {
        const u = existingUser;
        return `
            <div class="form-card">
                <h3>${u ? 'Редагувати профіль' : 'Налаштування профілю'}</h3>
                <p class="form-hint">Вкажіть свої параметри, щоб отримати персоналізовану ціль калорій.</p>
                <div id="profile-error" class="error-box hidden"></div>
                <div class="form-group">
                    <label>Ваше ім'я:</label>
                    <input type="text" id="userName" placeholder="Наприклад: Оля" value="${u ? u.name : ''}" required>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Стать:</label>
                        <select id="userGender">
                            <option value="female" ${u && u.gender === 'female' ? 'selected' : ''}>Жінка</option>
                            <option value="male"   ${u && u.gender === 'male'   ? 'selected' : ''}>Чоловік</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Вік (років):</label>
                        <input type="number" id="userAge" min="1" max="120" placeholder="25" value="${u ? u.age : ''}">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Вага (кг):</label>
                        <input type="number" id="userWeight" min="1" step="0.1" placeholder="65" value="${u ? u.weight : ''}">
                    </div>
                    <div class="form-group">
                        <label>Зріст (см):</label>
                        <input type="number" id="userHeight" min="1" placeholder="170" value="${u ? u.height : ''}">
                    </div>
                </div>
                <div class="form-group">
                    <label>Рівень активності:</label>
                    <select id="userActivity">
                        <option value="1.2"   ${u && u.activityLevel == 1.2   ? 'selected' : ''}>Сидячий (офіс, без тренувань)</option>
                        <option value="1.375" ${u && u.activityLevel == 1.375 ? 'selected' : ''}>Легка активність (1-3 тренування/тиж)</option>
                        <option value="1.55"  ${u && u.activityLevel == 1.55  ? 'selected' : ''}>Помірна активність (3-5 тренувань/тиж)</option>
                        <option value="1.725" ${u && u.activityLevel == 1.725 ? 'selected' : ''}>Висока активність (6-7 тренувань/тиж)</option>
                        <option value="1.9"   ${u && u.activityLevel == 1.9   ? 'selected' : ''}>Дуже висока (важка фізична праця)</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Ціль:</label>
                    <div class="goal-selector">
                        <label class="goal-option ${u && u.goal === 'lose' ? 'active' : ''}">
                            <input type="radio" name="userGoal" value="lose" ${u && u.goal === 'lose' ? 'checked' : ''}>
                            <span class="goal-icon">📉</span>
                            <span>Схуднення</span>
                        </label>
                        <label class="goal-option ${!u || u.goal === 'maintain' ? 'active' : ''}">
                            <input type="radio" name="userGoal" value="maintain" ${!u || u.goal === 'maintain' ? 'checked' : ''}>
                            <span class="goal-icon">⚖️</span>
                            <span>Підтримка</span>
                        </label>
                        <label class="goal-option ${u && u.goal === 'gain' ? 'active' : ''}">
                            <input type="radio" name="userGoal" value="gain" ${u && u.goal === 'gain' ? 'checked' : ''}>
                            <span class="goal-icon">📈</span>
                            <span>Набір маси</span>
                        </label>
                    </div>
                </div>
                <button id="saveProfileBtn" class="btn-primary">
                    ${u ? 'Зберегти зміни' : 'Зберегти та почати'}
                </button>
            </div>
        `;
    }

    renderProfileCard(user) {
        const dailyCals   = user.calculateDailyCalories();
        const macros      = user.calculateMacroSplit();
        const bmi         = user.calculateBMI();
        const bmiCategory = user.getBMICategory();
        const idealWeight = user.calculateIdealWeight();
        const waterNorm   = user.calculateWaterNorm();
        const weightDiff  = user.getWeightToGoal();

        return `
        <div class="profile-card">
            <div class="profile-header">
                <div class="profile-avatar">${user.name.charAt(0).toUpperCase()}</div>
                <div class="profile-info">
                    <h3>${user.name}</h3>
                    <span class="profile-meta">${user.age} р. · ${user.weight} кг · ${user.height} см</span>
                    <span class="goal-badge goal-${user.goal}">${user.getGoalLabel()}</span>
                </div>
            </div>
            <div class="profile-stats">
                <div class="stat-item">
                    <span class="stat-value">${dailyCals}</span>
                    <span class="stat-label">ккал/день</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${macros.proteins}г</span>
                    <span class="stat-label">Білки</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${macros.fats}г</span>
                    <span class="stat-label">Жири</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${macros.carbs}г</span>
                    <span class="stat-label">Вуглеводи</span>
                </div>
            </div>
            <div class="bmi-card">
                <div class="bmi-row">
                    <span class="bmi-label">ІМТ:</span>
                    <span class="bmi-value" style="color:${bmiCategory.color}">
                        ${bmi} — ${bmiCategory.label}
                    </span>
                </div>
                <div class="bmi-row">
                    <span class="bmi-label">Ідеальна вага:</span>
                    <span class="bmi-value">${idealWeight} кг</span>
                </div>
                <div class="bmi-row">
                    <span class="bmi-label">Різниця з ідеальною:</span>
                    <span class="bmi-value">${weightDiff.label}</span>
                </div>
                <div class="bmi-row">
                    <span class="bmi-label">Норма води:</span>
                    <span class="bmi-value">${waterNorm} мл/день</span>
                </div>
            </div>
            <button id="editProfileBtn" class="btn-secondary">✏️ Редагувати</button>
        </div>
    `;
    }

    init(containerId, existingUser, onSaveCallback, onEditCallback) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`[UserProfileUI] Контейнер '${containerId}' не знайдено.`);
            return;
        }

        if (existingUser) {
            container.innerHTML = this.renderProfileCard(existingUser);
            document.getElementById('editProfileBtn').addEventListener('click', () => {
                container.innerHTML = this.renderProfileForm(existingUser);
                this._bindFormEvents(container, onSaveCallback);
                this._bindGoalSelector();
            });
        } else {
            container.innerHTML = this.renderProfileForm(null);
            this._bindFormEvents(container, onSaveCallback);
            this._bindGoalSelector();
        }
    }

    _bindGoalSelector() {
        document.querySelectorAll('.goal-option input[type="radio"]').forEach(radio => {
            radio.addEventListener('change', () => {
                document.querySelectorAll('.goal-option').forEach(opt => opt.classList.remove('active'));
                radio.closest('.goal-option').classList.add('active');
            });
        });
    }

    _bindFormEvents(container, onSaveCallback) {
        const btn = document.getElementById('saveProfileBtn');
        if (!btn) return;

        btn.addEventListener('click', () => {
            const errorBox = document.getElementById('profile-error');
            errorBox.classList.add('hidden');
            errorBox.textContent = '';

            const formData = {
                name:          document.getElementById('userName').value.trim(),
                gender:        document.getElementById('userGender').value,
                age:           parseFloat(document.getElementById('userAge').value),
                weight:        parseFloat(document.getElementById('userWeight').value),
                height:        parseFloat(document.getElementById('userHeight').value),
                activityLevel: parseFloat(document.getElementById('userActivity').value),
                goal:          document.querySelector('input[name="userGoal"]:checked')?.value || 'maintain'
            };

            try {
                onSaveCallback(formData);
            } catch (err) {
                errorBox.textContent = err.message;
                errorBox.classList.remove('hidden');
            }
        });
    }
}
