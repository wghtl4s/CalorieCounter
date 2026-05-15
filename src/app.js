import MealRepository    from './repositories/MealRepository.js';
import UserRepository    from './repositories/UserRepository.js';
import WaterRepository   from './repositories/WaterRepository.js';
import Observer          from './patterns/Observer.js';
import MealFactory       from './patterns/Factory.js';
import User              from './models/User.js';
import DashboardUI       from './ui/DashboardUI.js';
import FormUI            from './ui/FormUI.js';
import WaterUI           from './ui/WaterUI.js';
import UserProfileUI     from './ui/UserProfileUI.js';
import NavigationUI      from './ui/NavigationUI.js';

document.addEventListener('DOMContentLoaded', async () => {
    console.log('[App] Ініціалізація додатку...');

    const mealRepo  = new MealRepository();
    const userRepo  = new UserRepository();
    const waterRepo = new WaterRepository();

    const dashboard    = new DashboardUI('dashboard-container');
    const formUI       = new FormUI('form-container');
    const waterUI      = new WaterUI('water-container');
    const profileUI    = new UserProfileUI('profile-container');
    const appObserver  = new Observer();

    const nav = new NavigationUI(
        [
            { id: 'dashboard', icon: '🏠', label: 'Огляд'    },
            { id: 'food',      icon: '🍽️', label: 'Їжа'      },
            { id: 'water',     icon: '💧', label: 'Вода'      },
            { id: 'profile',   icon: '👤', label: 'Профіль'   }
        ],
        (tabId) => showTab(tabId)
    );
    nav.init('nav-container');

    try {
        await mealRepo.fetchAll();
        await userRepo.fetch();
        await waterRepo.fetchForToday();
        console.log('[App] Дані завантажено.');
    } catch (err) {
        console.error('[App] Помилка завантаження даних:', err);
    }

    function getCalorieTarget() {
        const user = userRepo.getCurrent();
        return user ? user.calculateDailyCalories() : 2000;
    }

    function getMacroTarget() {
        const user = userRepo.getCurrent();
        return user ? user.calculateMacroSplit() : null;
    }

    function refreshDashboard() {
        const today   = new Date();
        const meals   = mealRepo.getByDate(today);
        const total   = mealRepo.getTotalCaloriesForDate(today);
        const macros  = mealRepo.getTotalMacrosForDate(today);
        const weekly  = mealRepo.getWeeklyCalories();

        dashboard.updateDashboard(
            total,
            getCalorieTarget(),
            macros,
            getMacroTarget(),
            meals,
            weekly,
            handleDeleteMeal
        );
    }

    function refreshWater() {
        const log = waterRepo.getCurrent();
        if (log) {
            waterUI.update('water-container', log, handleAddWater, handleUpdateWaterTarget);
        }
    }

    function refreshProfile() {
        profileUI.init(
            'profile-container',
            userRepo.getCurrent(),
            handleSaveProfile
        );
    }

    const tabPanels = ['dashboard-panel', 'food-panel', 'water-panel', 'profile-panel'];

    function showTab(tabId) {
        tabPanels.forEach(panelId => {
            const el = document.getElementById(panelId);
            if (el) el.classList.toggle('hidden', !panelId.startsWith(tabId));
        });

        if (tabId === 'dashboard') refreshDashboard();
        if (tabId === 'water')     refreshWater();
        if (tabId === 'profile')   refreshProfile();
    }

    appObserver.subscribe('mealAdded',   () => { if (!isTabHidden('dashboard')) refreshDashboard(); });
    appObserver.subscribe('mealDeleted', () => { if (!isTabHidden('dashboard')) refreshDashboard(); });
    appObserver.subscribe('waterAdded',  () => { if (!isTabHidden('water'))     refreshWater(); });
    appObserver.subscribe('userSaved',   () => { refreshDashboard(); });

    function isTabHidden(tabId) {
        const panel = document.getElementById(`${tabId}-panel`);
        return panel ? panel.classList.contains('hidden') : true;
    }

    async function handleDeleteMeal(mealId) {
        try {
            await mealRepo.delete(mealId);
            appObserver.notify('mealDeleted', { id: mealId });
            refreshDashboard();
            console.log(`[App] Запис ${mealId} видалено.`);
        } catch (err) {
            alert(`Помилка видалення: ${err.message}`);
        }
    }

    async function handleAddWater(amount) {
        try {
            await waterRepo.addWater(amount);
            appObserver.notify('waterAdded', { amount });
            refreshWater();
        } catch (err) {
            alert(`Помилка: ${err.message}`);
        }
    }

    async function handleUpdateWaterTarget(target) {
        try {
            await waterRepo.updateTarget(target);
            refreshWater();
        } catch (err) {
            alert(`Помилка: ${err.message}`);
        }
    }

    async function handleSaveProfile(formData) {
        const user = new User(
            Date.now().toString(),
            formData.name, formData.gender, formData.age,
            formData.weight, formData.height, formData.activityLevel, formData.goal
        );
        await userRepo.save(user);
        appObserver.notify('userSaved', user);
        refreshProfile();
    }

    formUI.initMealForm(async (formData) => {
        const mealEntry = MealFactory.createMealEntry(formData);

        await mealRepo.save(mealEntry);
        appObserver.notify('mealAdded', mealEntry);

        formUI.showSuccess(`✅ ${formData.name} додано!`);
        refreshDashboard();
    });

    refreshDashboard();
    refreshWater();

    console.log('[App] Ініціалізацію завершено.');
});
